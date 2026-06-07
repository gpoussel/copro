#!/usr/bin/env python3
from __future__ import annotations

import argparse
import random
import re
from collections import defaultdict
from pathlib import Path


L = 6
PATTERN_COUNT = 1 << (2 * L)
TURN_POOL_LIMITS = [(30, 2400), (200, 1800), (1000, 900)]
SCRIPT_DIR = Path(__file__).resolve().parent
OUT_DIR = SCRIPT_DIR / "out"
DEFAULT_TS = SCRIPT_DIR.parent / "wordle.ts"

SEED_PROBES = [
    "lacies",
    "calies",
    "caries",
    "salien",
    "saniel",
    "sarlen",
    "lanies",
    "sanler",
    "larnes",
    "saoiel",
    "sainer",
    "laries",
    "salier",
    "sariel",
    "saoier",
    "sanier",
    "laoies",
    "sarien",
    "sauier",
    "sailer",
    "alries",
    "laroes",
    "lraies",
    "arlies",
    "liraes",
    "airles",
    "sacier",
    "slaier",
    "saloer",
    "salner",
    "saroen",
    "deblur",
    "dorbug",
    "numpty",
    "phobic",
    "mugful",
    "plight",
    "youpon",
    "bulbul",
    "melded",
]


def load_words(path: Path) -> list[str]:
    return [
        w.strip().lower()
        for w in path.read_text(encoding="utf-8").splitlines()
        if len(w.strip()) == 6 and w.strip().isalpha()
    ]


def parse_ts_string(name: str, ts: str) -> str:
    m = re.search(rf'const {name} = "([^"]*)"', ts)
    if not m:
        raise ValueError(f"missing TS const {name}")
    return m.group(1)


def parse_pattern(raw: str, offset: int = 0) -> int:
    value = 0
    for i in range(L):
        value |= (ord(raw[offset + i]) - 48) << (2 * i)
    return value


def pattern_text(value: int) -> str:
    return "".join(str((value >> (2 * i)) & 3) for i in range(L))


def parse_table(data: str, double_key: bool) -> dict[int, str]:
    table = {}
    if not data:
        return table
    for entry in data.split():
        key, word = entry.split(":")
        first = parse_pattern(key)
        if double_key:
            second = parse_pattern(key, L)
            table[(first << 12) | second] = word
        else:
            table[first] = word
    return table


def pattern(guess: str, answer: str) -> int:
    present = set(answer)
    value = 0
    for i, ch in enumerate(guess):
        if ch == answer[i]:
            state = 3
        elif ch in present:
            state = 2
        else:
            state = 1
        value |= state << (2 * i)
    return value


def synthetic_guesses(words: list[str], limit: int) -> list[str]:
    pos_freq = [[0] * 26 for _ in range(L)]
    present_freq = [0] * 26
    for word in words:
        seen = set()
        for i, ch in enumerate(word):
            x = ord(ch) - 97
            pos_freq[i][x] += 1
            seen.add(x)
        for x in seen:
            present_freq[x] += 1

    per_pos = [
        sorted(range(26), key=lambda x: pos_freq[i][x], reverse=True)[:7]
        for i in range(L)
    ]
    scored = []
    for a in per_pos[0]:
        for b in per_pos[1]:
            for c in per_pos[2]:
                for d in per_pos[3]:
                    for e in per_pos[4]:
                        for f in per_pos[5]:
                            xs = (a, b, c, d, e, f)
                            if len(set(xs)) != L:
                                continue
                            score = sum(2 * pos_freq[i][x] + present_freq[x] for i, x in enumerate(xs))
                            word = "".join(chr(97 + x) for x in xs)
                            scored.append((score, word))
    scored.sort(reverse=True)
    return [w for _, w in scored[:limit]]


class Solver:
    def __init__(self, words: list[str], ts_path: Path):
        self.words = words
        self.word_set = set(words)
        self.ts = ts_path.read_text(encoding="utf-8")
        self.first = parse_ts_string("FIRST_GUESS", self.ts)
        self.second_table = parse_table(parse_ts_string("SECOND_GUESS_DATA", self.ts), False)
        self.third_table = parse_table(parse_ts_string("THIRD_GUESS_DATA", self.ts), True)

        seen = set()
        self.base_guesses = []
        for w in SEED_PROBES + synthetic_guesses(words, 1200) + words:
            if len(w) == L and w.isalpha() and w not in seen:
                seen.add(w)
                self.base_guesses.append(w)

    def choose_greedy(self, candidates: list[str]) -> str:
        if len(candidates) <= 1:
            return candidates[0]

        candidate_set = set(candidates)
        best = candidates[0]
        best_rank = (float("inf"), float("inf"), float("inf"))
        local_limit = len(candidates) if len(candidates) <= 80 else 160 if len(candidates) <= 300 else 80
        if len(candidates) <= 30:
            pool_limit = 2400
        elif len(candidates) <= 200:
            pool_limit = 1800
        elif len(candidates) <= 1000:
            pool_limit = 900
        else:
            pool_limit = 450

        def evaluate(guess: str):
            groups = defaultdict(int)
            for answer in candidates:
                groups[pattern(guess, answer)] += 1
            sizes = list(groups.values())
            avg = sum(s * s for s in sizes) / len(candidates)
            if guess in candidate_set:
                avg *= 0.92
            return (avg, max(sizes), -sum(1 for s in sizes if s == 1))

        for guess in candidates[:local_limit]:
            rank = evaluate(guess)
            if rank < best_rank:
                best_rank = rank
                best = guess
        for guess in self.base_guesses[:pool_limit]:
            rank = evaluate(guess)
            if rank < best_rank:
                best_rank = rank
                best = guess
        return best

    def solve(self, secret: str, max_turns: int = 26) -> tuple[int, list[tuple[str, str]]]:
        candidates = self.words[:]
        previous = ""
        first_result = 0
        trace = []
        for turn in range(max_turns):
            if turn > 0:
                result = pattern(previous, secret)
                candidates = [w for w in candidates if pattern(previous, w) == result]
                if turn == 1:
                    first_result = result
            else:
                result = 0

            if turn == 0:
                guess = self.first
            elif turn == 1:
                guess = self.second_table.get(result) or self.choose_greedy(candidates)
            elif turn == 2:
                guess = self.third_table.get((first_result << 12) | result) or self.choose_greedy(candidates)
            else:
                guess = self.choose_greedy(candidates)

            trace.append((guess, pattern_text(result)))
            if guess == secret:
                return turn + 1, trace
            previous = guess
        return max_turns + 1, trace


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--words", default=str(OUT_DIR / "6letters.txt"))
    parser.add_argument("--ts", default=str(DEFAULT_TS))
    parser.add_argument("--runs", type=int, default=10)
    parser.add_argument("--sample", type=int, default=50)
    parser.add_argument("--seed", type=int, default=12345)
    parser.add_argument("--show-worst", type=int, default=3)
    args = parser.parse_args()

    words = load_words(Path(args.words))
    solver = Solver(words, Path(args.ts))
    rng = random.Random(args.seed)

    print(f"words={len(words)} first={solver.first} second_table={len(solver.second_table)} third_table={len(solver.third_table)}")
    scores = []
    for run in range(1, args.runs + 1):
        sample = rng.sample(words, args.sample)
        results = []
        for secret in sample:
            turns, trace = solver.solve(secret)
            results.append((turns, secret, trace))
        score = sum(t for t, _, _ in results)
        scores.append(score)
        hist = defaultdict(int)
        for turns, _, _ in results:
            hist[turns] += 1
        worst = sorted(results, reverse=True)[: args.show_worst]
        hist_text = " ".join(f"{k}:{hist[k]}" for k in sorted(hist))
        worst_text = "; ".join(f"{secret}={turns}" for turns, secret, _ in worst)
        print(f"run {run:02d}: score={score} avg={score/args.sample:.3f} hist={hist_text} worst={worst_text}")
    print(f"scores: {' '.join(map(str, scores))}")
    print(f"min={min(scores)} max={max(scores)} mean={sum(scores)/len(scores):.2f}")


if __name__ == "__main__":
    main()
