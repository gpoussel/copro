# Troll Farm — handoff for a new session (goal: rank 1 in Legend)

Read this first, then `../CLAUDE.md` (section `spring-challenge-2026-troll-farm`,
the full log of every experiment and its result).

## Where things stand (2026-09-29)

- Puzzle: `spring-challenge-2026-troll-farm` (CodinGame multi, Legend league,
  184 players). Our pseudo: `gpoussel_`.
- Submitted bot: `bot.cpp` (C++, single file). Best builds: v22 (commit
  `fe12c95`) scored 28.29 then 27.45 on a resubmission; v19 27.85 / 25.67.
  **The same code varies by about ±1 point between submissions**; our true level
  is ~27.5–28 (rank 4–6).
- Rank 1: `delineate` (agentId 6479768) at 31.23 — a PPO-trained ResNet
  (details below). Then norxondor_gorgonax (6480540) ~30.8,
  Bubaptik (6568138) ~28.5, laconic_pixel, bl4sterino (6714048) ~28.
- Against delineate we lose by 130–250 points a game: it trains a cheap chopper
  around turn 5–11, fells our trees near our shack (~70 tree sizes a game), and
  builds a better team (avg speed/carry/chop 1.78/2.21/1.77 vs our 1.51/1.98/1.59).

## Why the previous session stopped

The previous machine had 1 GB RAM, 2 cores, no numpy/torch. Every heuristic lever
was tried (see CLAUDE.md); the plateau is ~28. What is left needs compute:

1. **A learned policy** like delineate's (PPO, curriculum: build-order →
   free choice; 104×11×22 observation planes, 4-block ResNet, ~100k params,
   per-troll action heads + a train-plan head; ~2–3 ms inference per turn).
   His write-up is a GitHub gist by delineate (id starting 93ba9d48), linked
   from the forum post-mortem thread forum.codingame.com/t/208241 (fetch the
   thread as JSON: `https://forum.codingame.com/t/208241.json`).
2. **Behaviour cloning as a bootstrap**: labels are cheap —
   - our own bot (`bot.cpp`) can generate millions of (state, action) pairs by
     self-play with the C++ engine (≈35 games/min/core on the old machine);
   - delineate's own games: `get_player_battles(delineate)` lists ~118, and
     `play_arena_games` against agent 6479768 produces more (IDE rate limit
     ≈100 games/hour). `imitate.ts` already extracts per-troll labels from
     replays. Note: cloning *only its job choices* into our heuristic framework
     failed (79.6 % agreement, but 5–35 head-to-head) — the whole policy must be
     learned together.
3. Then RL fine-tuning (PPO) on the score difference against a pool: our
   heuristic bot, earlier network snapshots.

## Code map (this directory)

- `bot.cpp` — the submitted bot AND a local toolbox (`./tfbot planall`,
  `bench`, `arena`, `imitate`, `trainimit` modes). Engine port of the referee,
  checked decision-for-decision against the TypeScript engine (`cppcheck.ts`,
  48/48 games identical). Build: `g++ -std=c++20 -O2 bot.cpp -o tfbot`.
  CodinGame compiles without -O: the file starts with
  `#pragma GCC optimize("O3,inline")` (needed, else the STL is 3.5× slower).
- `engine.ts`, `bot.ts` — the TypeScript engine/bot (reference, older logic).
- `seedmap.ts` (map from a replay seed: SHA1PRNG port), `recon.ts` (rebuild any
  replay turn by turn), `dumpmaps.ts` (maps for the C++ bench:
  `node --import <repo>/node_modules/tsx/dist/esm/index.mjs dumpmaps.ts maps 1 1000`),
  `replaymaps.ts`, `dumpinputs.ts` (feed a real game to the C++ bot),
  `imitate.ts` (labels from a player's replays), analysis: `stats.ts`,
  `triage.ts`, `timeline.ts`, `actmix.ts`, `raidcensus.ts`, `freeze.ts`.

## Constraints on CodinGame

- g++ 11.2, C++20, `-lm -lpthread -ldl -lcrypt`, no -O flag (use the pragma).
- 1000 ms on turn 1, 50 ms after (a turn over 50 ms loses the game).
- Source size: the current `bot.cpp` is ~102 k characters and still accepted,
  but there is little room: a network submission needs a stripped build (drop
  the local modes `bench/arena/imitate/trainimit`, the TS-era options, debug
  env hooks) and compact weights (int8/fp16 as base64 in a string literal).
  Check the real limit with a test submission early.
- Do not calibrate time budgets on the local machine: measure on CodinGame
  through stderr (`play_arena_games(..., stderr_tail=5)`).

## Evaluation protocol that worked

- Local self-play (`par.sh`-style arena, our bot vs a variant) and the solo
  bench mispredict the arena. Use them only as smoke tests.
- IDE panel: `play_arena_games` vs named agents with fixed seeds, both seats
  (`games=2, rotate_seats=true`). Seeds used: `seed=5224344176413357000`,
  `seed=-716092810094852000`, `seed=1602470739730264000`,
  `seed=8068404119122904000`. Opponents: delineate 6479768, norxondor 6480540,
  Bubaptik 6568138, bl4sterino 6714048. Opponents are deterministic: compare
  per-game score differences. 16 games is still noisy for small changes.
- Final judge: arena submission (`submit_arena_bot`), ~3 h to 100 %, ±1 point.
  Keep v22 (`fe12c95`) as the fallback to resubmit.
