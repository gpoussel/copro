#!/usr/bin/env python3
"""
Precalculation script for the 6-letter Wordle contest.

Rules implemented here:
  3: exact same letter at same position
  2: guessed letter is present anywhere in the answer, but not at this position
  1: guessed letter is not present in the answer

Outputs and cached word lists go to ./out/ by default and are ignored by git.
"""

from __future__ import annotations

import argparse
import itertools
import json
import math
import os
import random
import string
import time
import urllib.request
from collections import defaultdict
from functools import lru_cache
from typing import Iterable


DEFAULT_URL = (
    "https://raw.githubusercontent.com/tanvir362/english-words/"
    "refs/heads/master/6letters.txt"
)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(SCRIPT_DIR, "out")


def load_words(path: str | None, url: str, cache_path: str | None) -> list[str]:
    source_path = path or cache_path
    if source_path and os.path.exists(source_path):
        print(f"loading words from cache: {source_path}")
        with open(source_path, "r", encoding="utf-8") as f:
            raw = f.read().splitlines()
    elif path:
        raise FileNotFoundError(path)
    else:
        print(f"downloading words from: {url}")
        with urllib.request.urlopen(url, timeout=30) as response:
            raw_text = response.read().decode("utf-8")
        raw = raw_text.splitlines()
        if cache_path:
            os.makedirs(os.path.dirname(os.path.abspath(cache_path)), exist_ok=True)
            with open(cache_path, "w", encoding="utf-8", newline="\n") as f:
                f.write(raw_text)
            print(f"cached words to: {cache_path}")

    words = []
    seen = set()
    for line in raw:
        word = line.strip().lower()
        if len(word) == 6 and word.isalpha() and word not in seen:
            seen.add(word)
            words.append(word)
    return words


def pattern(guess: str, answer: str) -> int:
    present = set(answer)
    value = 0
    mul = 1
    for g, a in zip(guess, answer):
        if g == a:
            state = 3
        elif g in present:
            state = 2
        else:
            state = 1
        value += state * mul
        mul *= 4
    return value


def pattern_text(value: int) -> str:
    chars = []
    for _ in range(6):
        chars.append(str(value % 4))
        value //= 4
    return "".join(chars)


def partition(guess: str, answers: tuple[str, ...]) -> dict[int, tuple[str, ...]]:
    groups: dict[int, list[str]] = defaultdict(list)
    for answer in answers:
        groups[pattern(guess, answer)].append(answer)
    return {k: tuple(v) for k, v in groups.items()}


def expected_remaining(guess: str, answers: tuple[str, ...]) -> float:
    groups = partition(guess, answers)
    n = len(answers)
    return sum(len(group) * len(group) for group in groups.values()) / n


def distribution(groups: dict[int, tuple[str, ...]], guess: str) -> dict[str, int]:
    solved = 1 if guess in groups.get(pattern(guess, guess), ()) else 0
    sizes = [len(g) for g in groups.values()]
    return {
        "groups": len(sizes),
        "singletons": sum(1 for s in sizes if s == 1),
        "max_group": max(sizes, default=0),
        "solves_now": solved,
    }


def letter_position_tables(words: list[str]) -> tuple[list[dict[str, int]], dict[str, int]]:
    by_pos = [defaultdict(int) for _ in range(6)]
    present = defaultdict(int)
    for word in words:
        for i, ch in enumerate(word):
            by_pos[i][ch] += 1
        for ch in set(word):
            present[ch] += 1
    return by_pos, present


def synthetic_guesses(words: list[str], limit: int) -> list[str]:
    by_pos, present = letter_position_tables(words)
    letters = string.ascii_lowercase
    pos_order = [
        sorted(letters, key=lambda c: by_pos[i][c], reverse=True)[:12]
        for i in range(6)
    ]
    scored = []
    for chars in itertools.product(*pos_order):
        if len(set(chars)) != 6:
            continue
        guess = "".join(chars)
        score = 0
        for i, ch in enumerate(guess):
            score += by_pos[i][ch] * 2 + present[ch]
        scored.append((score, guess))
    scored.sort(reverse=True)
    return [guess for _, guess in scored[:limit]]


def top_greedy_guesses(
    guesses: Iterable[str],
    answers: tuple[str, ...],
    keep: int,
    deadline: float,
) -> list[dict[str, object]]:
    rows = []
    for idx, guess in enumerate(guesses, 1):
        if time.time() > deadline:
            break
        groups = partition(guess, answers)
        n = len(answers)
        exp_rem = sum(len(group) * len(group) for group in groups.values()) / n
        sizes = [len(group) for group in groups.values()]
        # Lower is better. The small in-list bonus makes ties prefer possible answers.
        rank = (
            exp_rem,
            max(sizes, default=0),
            -sum(1 for s in sizes if s == 1),
            0 if guess in answers else 1,
        )
        rows.append(
            {
                "guess": guess,
                "rank": rank,
                "expected_remaining": exp_rem,
                "max_group": max(sizes, default=0),
                "singletons": sum(1 for s in sizes if s == 1),
                "groups": len(sizes),
                "in_answers": guess in answers,
            }
        )
        if idx % 1000 == 0:
            rows.sort(key=lambda r: r["rank"])
            rows = rows[: keep * 3]
    rows.sort(key=lambda r: r["rank"])
    return rows[:keep]


def table3_quality_for_second(
    second: str,
    answers: tuple[str, ...],
    guesses: tuple[str, ...],
    third_keep: int,
    deadline: float,
) -> dict[str, object]:
    second_groups = partition(second, answers)
    solved_by_second = 1 if second in answers else 0
    solved_by_third = 0
    ambiguous_after_third = 0
    max_after_third = 0
    third_by_pattern = {}

    for p2, group2 in second_groups.items():
        if len(group2) == 1:
            if group2[0] != second:
                solved_by_third += 1
            continue
        if time.time() > deadline:
            ambiguous_after_third += len(group2)
            max_after_third = max(max_after_third, len(group2))
            continue
        top3 = top_greedy_guesses(guesses, group2, third_keep, deadline)
        third = str(top3[0]["guess"]) if top3 else group2[0]
        third_by_pattern[pattern_text(p2)] = third
        third_groups = partition(third, group2)
        for group3 in third_groups.values():
            if len(group3) == 1:
                solved_by_third += 1
            else:
                ambiguous_after_third += len(group3)
                max_after_third = max(max_after_third, len(group3))

    # Ranking target for a table that is only used for turns 2 and 3:
    # maximize words identified by turn 3, then minimize remaining ambiguity.
    return {
        "second": second,
        "rank": (
            ambiguous_after_third,
            max_after_third,
            -solved_by_third,
            -(solved_by_second),
            0 if second in answers else 1,
        ),
        "solved_by_second": solved_by_second,
        "solved_by_third": solved_by_third,
        "ambiguous_after_third": ambiguous_after_third,
        "max_after_third": max_after_third,
        "third_by_pattern": third_by_pattern,
    }


def choose_second_for_table3(
    answers: tuple[str, ...],
    guesses: tuple[str, ...],
    second_keep: int,
    third_keep: int,
    deadline: float,
) -> dict[str, object] | None:
    top2 = top_greedy_guesses(guesses, answers, second_keep, deadline)
    best = None
    for row in top2:
        if time.time() > deadline:
            break
        quality = table3_quality_for_second(str(row["guess"]), answers, guesses, third_keep, deadline)
        quality["second_stats"] = {k: v for k, v in row.items() if k != "rank"}
        if best is None or quality["rank"] < best["rank"]:
            best = quality
    return best


def candidate_pool(
    answers: list[str],
    synthetic_limit: int,
    random_limit: int,
    seed: int,
) -> list[str]:
    pool = list(dict.fromkeys(answers + synthetic_guesses(answers, synthetic_limit)))
    if random_limit:
        rng = random.Random(seed)
        random_guesses = set()
        letters = string.ascii_lowercase
        while len(random_guesses) < random_limit:
            random_guesses.add("".join(rng.sample(letters, 6)))
        pool.extend(g for g in random_guesses if g not in set(pool))
    return pool


def solve_small_exact(
    answers: tuple[str, ...],
    guesses: tuple[str, ...],
    deadline: float,
    max_depth: int,
) -> tuple[float, dict[str, object] | None]:
    answers = tuple(sorted(answers))

    @lru_cache(maxsize=None)
    def rec(state: tuple[str, ...], depth: int) -> tuple[float, str | None]:
        if len(state) == 1:
            return 1.0, state[0]
        if depth <= 1 or time.time() > deadline:
            return float(len(state) + 1000), None

        best_cost = float("inf")
        best_guess = None
        local_guesses = tuple(dict.fromkeys(state + guesses[:2000]))
        for guess in local_guesses:
            groups = partition(guess, state)
            cost = len(state)
            for group in groups.values():
                if len(group) == 1:
                    # If the guess was the answer, that branch is already solved.
                    if group[0] == guess:
                        continue
                    cost += 1
                else:
                    subcost, _ = rec(tuple(sorted(group)), depth - 1)
                    cost += subcost
                if cost >= best_cost:
                    break
            if cost < best_cost:
                best_cost = cost
                best_guess = guess
        return best_cost, best_guess

    total, guess = rec(answers, max_depth)
    if guess is None:
        return total, None
    return total, {"guess": guess, "total_cost": total, "avg_cost": total / len(answers)}


def build_policy(
    first: str,
    answers: tuple[str, ...],
    guesses: tuple[str, ...],
    second_keep: int,
    third_keep: int,
    exact_threshold: int,
    exact_depth: int,
    deadline: float,
    optimize_table3: bool,
) -> dict[str, object]:
    first_groups = partition(first, answers)
    policy: dict[str, object] = {
        "first": first,
        "branches": {},
        "stats": {
            "answers": len(answers),
            "first_groups": len(first_groups),
            "first_singletons": sum(1 for g in first_groups.values() if len(g) == 1),
            "first_max_group": max(len(g) for g in first_groups.values()),
        },
    }
    total_cost = 0

    for p1, group in sorted(first_groups.items(), key=lambda item: len(item[1]), reverse=True):
        key1 = pattern_text(p1)
        branch = {"size": len(group)}
        if len(group) == 1:
            branch["answer"] = group[0]
            branch["cost"] = 1 if group[0] == first else 2
            total_cost += branch["cost"]
            policy["branches"][key1] = branch
            continue

        second = None
        if len(group) <= exact_threshold:
            _, exact = solve_small_exact(group, guesses, deadline, exact_depth)
            if exact:
                second = str(exact["guess"])
                branch["exact_avg_cost_from_branch"] = exact["avg_cost"]

        top2 = []
        table3_choice = None
        if second is None:
            if optimize_table3:
                table3_choice = choose_second_for_table3(
                    group, guesses, second_keep, third_keep, deadline
                )
                if table3_choice:
                    second = str(table3_choice["second"])
            else:
                top2 = top_greedy_guesses(guesses, group, second_keep, deadline)
                if top2:
                    second = str(top2[0]["guess"])

        if second is None:
            second = group[0]
            branch["note"] = "deadline hit; fallback to first candidate"

        branch["second"] = second
        if top2:
            branch["second_stats"] = {k: v for k, v in top2[0].items() if k != "rank"}
        if table3_choice:
            branch["table3_stats"] = {
                k: v
                for k, v in table3_choice.items()
                if k not in ("rank", "third_by_pattern")
            }

        second_groups = partition(second, group)
        after_second = {}
        branch_cost = 0
        unresolved_count = 0
        branch["after_second_singletons"] = sum(1 for v in second_groups.values() if len(v) == 1)
        branch["after_second_max_group"] = max(len(v) for v in second_groups.values())

        for p2, group2 in sorted(second_groups.items(), key=lambda item: len(item[1]), reverse=True):
            key2 = pattern_text(p2)
            if len(group2) == 1:
                answer = group2[0]
                cost = 2 if answer == second else 3
                branch_cost += cost
                after_second[key2] = {"answer": answer, "size": 1, "cost": cost}
                continue

            unresolved_count += 1
            third = None
            if table3_choice:
                third = table3_choice["third_by_pattern"].get(pattern_text(p2))
            if len(group2) <= exact_threshold and time.time() <= deadline:
                _, exact3 = solve_small_exact(group2, guesses, deadline, max(2, exact_depth - 1))
                if exact3:
                    third = str(exact3["guess"])
            if third is None and time.time() <= deadline:
                top3 = top_greedy_guesses(guesses, group2, 1, deadline)
                if top3:
                    third = str(top3[0]["guess"])
            if third is None:
                third = group2[0]

            third_groups = partition(third, group2)
            after_third = {}
            group2_cost = 0
            for p3, group3 in sorted(third_groups.items(), key=lambda item: len(item[1]), reverse=True):
                key3 = pattern_text(p3)
                if len(group3) == 1:
                    answer = group3[0]
                    cost = 3 if answer == third else 4
                    group2_cost += cost
                    after_third[key3] = {"answer": answer, "size": 1, "cost": cost}
                else:
                    # Complete but deliberately simple fallback: if this happens,
                    # store the remaining candidates. Runtime can use the same
                    # strategy recursively or play them in order.
                    cost = 4 + len(group3) - 1
                    group2_cost += cost * len(group3)
                    after_third[key3] = {
                        "candidates": list(group3),
                        "size": len(group3),
                        "fallback": "linear",
                        "cost_model_per_word": cost,
                    }

            branch_cost += group2_cost
            after_second[key2] = {
                "size": len(group2),
                "third": third,
                "after_third": after_third,
                "cost": group2_cost,
            }

        branch["unresolved_after_second"] = unresolved_count
        branch["after_second"] = after_second
        branch["cost"] = branch_cost
        total_cost += branch_cost
        policy["branches"][key1] = branch

    policy["stats"]["policy_total_cost"] = total_cost
    policy["stats"]["policy_avg_cost"] = total_cost / len(answers)
    return policy


def add_playbook(policy: dict[str, object]) -> None:
    playbook = {
        "first": policy["first"],
        "on_first_result": {},
    }
    branches = policy.get("branches", {})
    for r1, branch_obj in branches.items():
        branch = branch_obj
        entry = {}
        if "answer" in branch:
            entry["answer"] = branch["answer"]
            entry["note"] = "play this as second guess"
        else:
            entry["second"] = branch.get("second")
            entry["on_second_result"] = {}
            for r2, second_obj in branch.get("after_second", {}).items():
                if "answer" in second_obj:
                    entry["on_second_result"][r2] = {
                        "answer": second_obj["answer"],
                        "note": "play this as third guess",
                    }
                else:
                    entry["on_second_result"][r2] = {
                        "third": second_obj.get("third"),
                        "note": "play this as third guess; then use on_third_result",
                    }
                    third_table = {}
                    for r3, third_obj in second_obj.get("after_third", {}).items():
                        if "answer" in third_obj:
                            third_table[r3] = {"answer": third_obj["answer"]}
                        else:
                            third_table[r3] = {
                                "candidates": third_obj.get("candidates", []),
                                "fallback": third_obj.get("fallback"),
                            }
                    entry["on_second_result"][r2]["on_third_result"] = third_table
        playbook["on_first_result"][r1] = entry
    policy["playbook"] = playbook


def analyze_policy(policy: dict[str, object], max_examples: int = 8) -> dict[str, object]:
    words_by_cost: dict[str, int] = defaultdict(int)
    needs_third_probe_branches = 0
    needs_third_probe_words = 0
    ambiguous_after_3_branches = 0
    ambiguous_after_3_words = 0
    examples = []

    for r1, branch in policy.get("branches", {}).items():
        if "answer" in branch:
            words_by_cost[str(branch.get("cost", 2))] += int(branch["size"])
            continue

        for r2, second_branch in branch.get("after_second", {}).items():
            if "answer" in second_branch:
                words_by_cost[str(second_branch.get("cost", 3))] += int(
                    second_branch["size"]
                )
                continue

            needs_third_probe_branches += 1
            needs_third_probe_words += int(second_branch["size"])
            for r3, third_branch in second_branch.get("after_third", {}).items():
                if "answer" in third_branch:
                    words_by_cost[str(third_branch.get("cost", 4))] += int(
                        third_branch["size"]
                    )
                    continue

                size = int(third_branch["size"])
                ambiguous_after_3_branches += 1
                ambiguous_after_3_words += size
                words_by_cost["ambiguous_after_3"] += size
                if len(examples) < max_examples:
                    examples.append(
                        {
                            "first_result": r1,
                            "second": branch.get("second"),
                            "second_result": r2,
                            "third": second_branch.get("third"),
                            "third_result": r3,
                            "candidates": third_branch.get("candidates", []),
                        }
                    )

    answers = int(policy["stats"]["answers"])
    solved_by_3 = (
        words_by_cost.get("1", 0) + words_by_cost.get("2", 0) + words_by_cost.get("3", 0)
    )
    solved_by_4_or_less = solved_by_3 + words_by_cost.get("4", 0)
    return {
        "words_by_cost": dict(sorted(words_by_cost.items())),
        "solved_by_3_words": solved_by_3,
        "solved_by_3_pct": solved_by_3 / answers * 100,
        "solved_by_4_or_less_words": solved_by_4_or_less,
        "solved_by_4_or_less_pct": solved_by_4_or_less / answers * 100,
        "needs_third_probe_branches": needs_third_probe_branches,
        "needs_third_probe_words": needs_third_probe_words,
        "ambiguous_after_3_branches": ambiguous_after_3_branches,
        "ambiguous_after_3_words": ambiguous_after_3_words,
        "examples": examples,
    }


def print_quality(quality: dict[str, object]) -> None:
    print("quality:")
    print(f"  words_by_cost: {quality['words_by_cost']}")
    print(
        "  solved_by_3: "
        f"{quality['solved_by_3_words']} "
        f"({quality['solved_by_3_pct']:.2f}%)"
    )
    print(
        "  solved_by_4_or_less: "
        f"{quality['solved_by_4_or_less_words']} "
        f"({quality['solved_by_4_or_less_pct']:.2f}%)"
    )
    print(
        "  needs_third_probe: "
        f"{quality['needs_third_probe_words']} words, "
        f"{quality['needs_third_probe_branches']} branches"
    )
    print(
        "  ambiguous_after_3: "
        f"{quality['ambiguous_after_3_words']} words, "
        f"{quality['ambiguous_after_3_branches']} branches"
    )
    examples = quality.get("examples", [])
    if examples:
        print("  ambiguous examples:")
        for example in examples:
            print(
                "    "
                f"r1={example['first_result']} "
                f"second={example['second']} "
                f"r2={example['second_result']} "
                f"third={example['third']} "
                f"r3={example['third_result']} "
                f"candidates={','.join(example['candidates'])}"
            )


def print_first_keep_sweep(policies: list[dict[str, object]]) -> None:
    if len(policies) <= 1:
        return

    checkpoints = [1, 2, 3, 5, 8, 10, 15, 20, 25, 30, 40, 50, 75, 100]
    checkpoints = [n for n in checkpoints if n <= len(policies)]
    if len(policies) not in checkpoints:
        checkpoints.append(len(policies))

    best = None
    print("first_keep sweep:")
    for i, policy in enumerate(policies, 1):
        quality = policy["quality"]
        current = (
            float(policy["stats"]["policy_avg_cost"]),
            int(quality["ambiguous_after_3_words"]),
            -int(quality["solved_by_3_words"]),
            str(policy["first"]),
            i,
            quality,
        )
        if best is None or current < best:
            best = current
        if i in checkpoints:
            avg, ambiguous, _neg_by3, first, rank, quality = best
            print(
                f"  first_keep={i:3d}: "
                f"best_rank={rank:3d} "
                f"first={first:6s} "
                f"avg={avg:.4f} "
                f"by3={quality['solved_by_3_pct']:.2f}% "
                f"ambiguous3={ambiguous}"
            )

    print("top evaluated first guesses:")
    ranked = []
    for i, policy in enumerate(policies, 1):
        quality = policy["quality"]
        ranked.append(
            (
                float(policy["stats"]["policy_avg_cost"]),
                i,
                str(policy["first"]),
                float(quality["solved_by_3_pct"]),
                int(quality["ambiguous_after_3_words"]),
            )
        )
    for avg, rank, first, by3, ambiguous in sorted(ranked)[:10]:
        print(
            f"  greedy_rank={rank:3d} "
            f"first={first:6s} "
            f"avg={avg:.4f} "
            f"by3={by3:.2f}% "
            f"ambiguous3={ambiguous}"
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--word-file")
    parser.add_argument("--cache", default=os.path.join(OUT_DIR, "6letters.txt"))
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--out", default=os.path.join(OUT_DIR, "wordle_policy.json"))
    parser.add_argument("--seconds", type=float, default=300)
    parser.add_argument(
        "--policy-seconds",
        type=float,
        default=None,
        help="Per-first-guess policy budget. Defaults to --seconds.",
    )
    parser.add_argument("--synthetic", type=int, default=30000)
    parser.add_argument("--random", type=int, default=0)
    parser.add_argument("--seed", type=int, default=1)
    parser.add_argument("--first-keep", type=int, default=20)
    parser.add_argument(
        "--evaluate-firsts",
        type=int,
        default=1,
        help="Build a full policy for the top N first guesses and keep the best one.",
    )
    parser.add_argument("--fixed-first")
    parser.add_argument("--second-keep", type=int, default=10)
    parser.add_argument("--third-keep", type=int, default=3)
    parser.add_argument("--optimize-table3", action="store_true")
    parser.add_argument("--exact-threshold", type=int, default=18)
    parser.add_argument("--exact-depth", type=int, default=3)
    args = parser.parse_args()

    start = time.time()
    scoring_deadline = start + args.seconds
    policy_seconds = args.policy_seconds if args.policy_seconds is not None else args.seconds
    answers = load_words(args.word_file, args.url, args.cache)
    answers_t = tuple(answers)
    guesses = tuple(candidate_pool(answers, args.synthetic, args.random, args.seed))

    print(f"answers={len(answers)} guesses={len(guesses)}")
    print("scoring first guesses...")
    first_rows = top_greedy_guesses(guesses, answers_t, args.first_keep, scoring_deadline)
    for i, row in enumerate(first_rows[:10], 1):
        print(
            f"{i:2d}. {row['guess']} exp={row['expected_remaining']:.2f} "
            f"max={row['max_group']} singletons={row['singletons']} "
            f"in_answers={row['in_answers']}"
        )

    if not first_rows:
        raise SystemExit("No first guess found before deadline.")

    first_candidates = (
        [args.fixed_first.lower()]
        if args.fixed_first
        else [str(row["guess"]) for row in first_rows[: args.evaluate_firsts]]
    )
    policies = []
    for first in first_candidates:
        print(f"building policy from first guess: {first}")
        policy_deadline = time.time() + policy_seconds
        policy = build_policy(
            first,
            answers_t,
            guesses,
            args.second_keep,
            args.third_keep,
            args.exact_threshold,
            args.exact_depth,
            policy_deadline,
            args.optimize_table3,
        )
        add_playbook(policy)
        quality = analyze_policy(policy)
        policy["quality"] = quality
        policies.append(policy)
        print(
            f"candidate {first}: avg={policy['stats']['policy_avg_cost']:.4f} "
            f"by3={quality['solved_by_3_pct']:.2f}% "
            f"ambiguous3={quality['ambiguous_after_3_words']}"
        )

    if not policies:
        raise SystemExit("No policy built before deadline.")

    def policy_rank(policy: dict[str, object]) -> tuple[float, int, int]:
        quality = policy["quality"]
        return (
            float(policy["stats"]["policy_avg_cost"]),
            int(quality["ambiguous_after_3_words"]),
            -int(quality["solved_by_3_words"]),
        )

    policy = min(policies, key=policy_rank)
    print(f"selected first guess: {policy['first']}")
    add_playbook(policy)
    quality = policy["quality"]
    policy["top_first_guesses"] = [
        {k: v for k, v in row.items() if k != "rank"} for row in first_rows
    ]
    policy["evaluated_firsts"] = [
        {
            "first": p["first"],
            "stats": p["stats"],
            "quality": {
                k: v
                for k, v in p["quality"].items()
                if k != "examples"
            },
        }
        for p in policies
    ]
    policy["config"] = vars(args)
    policy["elapsed_seconds"] = time.time() - start

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(policy, f, indent=2, sort_keys=True)
    print(f"wrote {args.out}")
    print(json.dumps(policy["stats"], indent=2, sort_keys=True))
    print_quality(quality)
    print_first_keep_sweep(policies)


if __name__ == "__main__":
    main()
