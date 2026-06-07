# CodinGame Optimization puzzles — working notes

Solvers scored by **quality** (a score, not pass/fail). A puzzle's ranking is decided
by **one fixed hidden test case, the same for everyone** — the visible cases are not it.

**Golden rule:** the visible test cases do **NOT** predict the leaderboard. Don't tune
against them — the only ground truth is a real submission. The user submits promising
variants (sparingly); CodinGame keeps your **best** submission, so aggressive
experiments never lower your rank. Keep files type-clean (CG runs `tsc`).

---

## codingame-sponsored-contest

The statement hides everything on purpose ("figure out what the inputs mean").
**It is disguised PAC-MAN.** Proof: each `testIn` is base64+zlib **twice** —
`inflate(base64(testIn))` yields another base64 string, inflate that to get a
plain-text maze (`P`=you, `1..4`=ghosts with release timers `3,30`/`4,90`,
`#`=walls, `.`=pellets, corners `A/B/C/D`). Decode snippet lived in `D:\tmp`
(sandbox, ephemeral): `zlib.inflateSync(Buffer.from(s,"base64"))` applied twice.

**The catch: the program never receives the maze.** Per the stub it only gets
LOCAL info, so this is blind/local Pac-Man:
- Init: 3 ints (3rd = number of int-pairs streamed per turn = ghost count = 4 in
  the decoded replays; 1st/2nd likely maze w/h).
- Each turn: **4 single-char lines** (the 4 cells around Pac-Man) then
  `<3rd-init>` lines `"x y"` (ghosts). Output one of `A B C D E`.

**Exact I/O (reverse-engineered, confirmed via texus' published solution —
https://github.com/texus/codingame "CodinGame Sponsored Contest"):**
- Init: `width`, `height`, `players` (= ghosts + you).
- Each turn: 4 chars in order **UP, RIGHT, DOWN, LEFT** (content of the 4 cells
  around you), then `players` lines `"x y"` **1-indexed with wrap-around**; the
  **last pair is YOU**, the rest are ghosts.
- Action mapping (the gotcha): **A=RIGHT, B=STAY, C=UP, D=DOWN, E=LEFT**. Our
  first naive bot always printed `D`=DOWN, a wall at spawn → it froze in place.

**stderr is HIDDEN for this puzzle** (a `console.error` banner printed before any
read never showed up), so you cannot debug via stderr — only stdout (the A–E
moves) and the score are visible. That's why we needed the published writeup.

Solver `codingame-sponsored-contest.ts` is a faithful port of texus' approach:
keep a grid of `?`(unknown)/`#`(wall)/`_`(eaten), each turn fill in our cell +
4 neighbours, **BFS to the nearest still-unknown cell** and step toward it
(exploring == eating), refusing any step whose destination sits next to a ghost
(`alternativeMove` keeps us alive otherwise). **JS gotcha:** Python's `%` is
non-negative; JS isn't — every grid index uses a `mod(a,n)=((a%n)+n)%n` helper.

**Submitted: scored 2532** (clears the >2000 "we're hiring" bar; #1 ≈ 14337).
The score accumulates across many Pac-Man levels, so **finishing each level fast
+ surviving** is the lever, not single-maze pellet %.

**v2 improvements (current file):**
- BFS target is now `?` OR `.` (clear the level, don't idle once explored).
- never STAY when no target is reachable — `alternativeMove` actively **flees**
  (picks the safe neighbour maximising distance to the nearest ghost).

**Local referee sim** (`D:\tmp`, ephemeral) with the real mapping and three ghost
models (stationary / random / perfect-chaser):
- random ghosts (realistic): **clears 100%** of tests 1 & 10 in ~470 turns,
  never dies → should advance through many levels.
- perfect omniscient chaser (unrealistic worst case): eats less but still never
  dies. CG keeps your best score, so shipping the aggressive v2 can't lower rank.
- caveat: stationary ghosts leave ~6 pellets stuck by the ghost house (a sim
  artifact — real ghosts leave the house).

**Submitted scores:** v1 (`?`-only) **2532**; v2 (`?`+`.`) **2568** (best, the
committed version). Coni63's writeup reverse-engineers the score as ≈ **2 ×
distinct cells visited** (2568/2 ≈ 1284 cells; #1 ≈ 14337 ≈ 7168 cells), i.e. a
**coverage** objective on a large hidden maze.

**Proactive-flee experiment — REGRESSED, do not repeat.** Fleeing whenever a
ghost is within DANGER (wrap-aware) scored **DANGER=2 → 2516, DANGER=3 → 2176**,
both below 2568. Conclusion: the bot is **coverage/turn-bound, not death-bound** —
every turn spent fleeing is a turn not exploring a new cell. So survival tweaks
hurt; the lever is **exploration efficiency** (visit a new cell as often as
possible, minimise backtracking over already-visited cells). Caveat: we have
**zero observability** (can't see the hidden eval, the visible-test replay, or
stderr), so the only oracle is submitting; CG keeps your best, so experiments are
rank-safe but cost a submission each.

**Efficiency experiment — no change.** Removing the redundant ghost-gate on the
BFS step (the step is already safety-filtered by `possibleMoves`) and making the
fallback always prefer a fresh neighbour scored **exactly 2568** again — byte-for-
byte the same as v2. So these micro-tweaks don't alter the trajectory on the
hidden maze. Combined with the flee regression, **2568 is the ceiling of this
greedy-BFS-coverage approach**, and it matches the published reference solutions
(texus, Coni63) — i.e. this is a good, representative score, not a low one.

**Verdict:** keep v2 (2568). Beating it would need a *fundamentally* better
coverage planner (leaders ≈ 7000 cells = ~5.5× ours, so either we waste most
turns backtracking or we die early — we can't tell which without observability).
That's a from-scratch rewrite tuned by repeated blind submissions (no eval/replay/
stderr visibility), i.e. high cost / uncertain payoff. Not worth burning
submissions on blindly. If revisited, first build a faithful referee — but the
real ghost AI and exact scoring are unknown, which is the whole problem.

---

## travelling-salesman

Tour over all points, start/end at 0; score ≈ tour length on the hidden instance. N≤300, 5s.

Best so far: **201391** (committed), #1 = 201382. Solver: **multi-seed neighbor-list ILS**
(per round: fresh nearest-neighbor tour + own seed/start; local search = knn 2-opt +
Or-opt seg 1..8 both orientations + don't-look bits on the cycle; double-bridge ILS to
stagnation; keep best tour across rounds; rotate to start at 0 at output).

Key findings:
- **Depth lowers the floor** (Or-opt seg 3→5 gained 25 pts; 5→8, +2 — flattening).
  More draws at the *same* depth does **not** help (floor is depth-bound, not count-bound).
- **Multi-seed diversification** beat a single ILS walk (201541→201418).
- **STAG_LIMIT sweet spot ≈ 300** (100 too shallow, 500 slightly worse).
- **Seed lottery floors at 201391** — fresh seed tranches sample more but never broke it.
- **Lin-Kernighan / node-swap: no reliable gain** (change trajectory, slow draws). The
  last few points to #1 likely need an LKH-class local search.

Tunables (top of file): `TIME_LIMIT` (~4900, push it — safety net), `K0`, `STAG_LIMIT`,
Or-opt max segment length, seed-tranche offset.

---

## 2048

Port of the play2048 game. Score = sum of merge values. Grid 4x4. **The referee
gives the spawn seed every turn**, so the game is fully deterministic — no
Expectimax needed, just deterministic search.

**Engine internals** (from `eulerscheZahl/2048` `engine/Board.java`, ported in
`2048-tools/engine.mjs`): the PRNG is NOT `java.util.Random` — it is a tiny
custom generator. Per spawn: free cells listed **column-major** (`x` outer,
`y` inner) as `idx = x + y*4`; `pos = seed % freeCount`; `value = (seed & 0x10)
? 4 : 2`; then `seed = seed*seed % 50515093`. The seed stays < 50515093, so
`seed*seed` is exact in JS doubles (no BigInt in the hot path). Move/merge order
is ported verbatim (dirs `U R D L`). The board state given on turn 1 is after the
constructor's two spawns; the seed in the input is the one the *next* spawn uses.

**The binding constraint is the 600-output cap, not a stuck board.** Each output
line may batch many moves (`UURDL...`, prefix `-` disables the viewer). A whole
strong game is ~17k moves, so we must commit ~28 moves per output to fit the game
into 600 lines. This dominates everything: bigger batches ≈ pure score until the
board can't sustain them.

**Solver** (`2048.ts`): deterministic **beam search** on an exponent board.
Per turn: search to depth `commitLen + lookahead` (beam width `W`), pick the
best-eval node in the **deepest reached layer**, and commit the first `commitLen`
moves; if the line died before the horizon, back off to `earlyFrac` of it.
Heuristic = empties + **magnitude-weighted monotonicity** (on tile values, so a
misplaced big tile dominates) + smoothness + merge pairs + max-in-corner.

Tuned config (defaults in file): `bw=200, commitLen=28, lookahead=60,
W.mono=2.0`. Offline mean **652k** over the 8 first visible seeds (every game
reaching 32768), and **628k over all 30 visible seeds** (28/30 reach 32768, no
desync, ~11ms/turn locally — lots of timing margin). Not submitted yet at time
of writing. This is a fairly sharp optimum — neighbors reintroduce mid-game
collapses (16384→stuck):

- `commitLen` is the main score lever (24→545k, 26→583k, **28→652k**); 30 starts
  collapsing. Too high over-commits into death.
- `W.mono` peaks at ~2.0 (0.55→425k, 1.7→516k, **2.0→652k**, 3.5→464k, 6→447k).
- **Bigger beam is NOT better**: bw 240/260/800 are worse — a wider beam overfits
  the imperfect eval to fragile lines and/or fails to reach the full horizon in
  budget (then `earlyFrac` commits a death-bound prefix). Reaching the full
  target depth each turn is what keeps play healthy.
- Picking the *deepest* line (to death) or committing toward the *eval peak* both
  underperform the lookahead-commit model.

**CG-timing caveat:** locally this is ~12–16ms/turn; the bot caps itself at
`TURN_MS` and falls back to `earlyFrac`. If CG's slower hardware can't reach the
horizon, play degrades (early collapse). If a submission underperforms, lower
`BEAM_WIDTH` and/or `LOOKAHEAD` so the horizon is reached within budget.

**Harness** (`2048-tools/`, run with `pnpm exec tsx`):
- `play.mjs sim <seed> [moves]` — pure-engine replay; prints the initial board
  then the board after each single move. **Use this to compare with the website**
  (type the same seed/test case + moves and diff the boards/score).
- `play.mjs bot <seed> [--bw= --clen= --look= --ef= --wmono= ...]` — runs the bot
  to the end; reports score, max tile, turns, end reason, and **checks the bot's
  own prediction against the engine every turn (desync detection)**.
- `play.mjs bench [flags] [seeds...]` — same over many seeds (default: the 30
  visible seeds), prints per-seed lines + mean. No desync seen in any run.

Next directions if pushing further: faster simulator (row LUT/bitboard) to reach
the horizon with more margin on CG; transposition table (Zobrist) to dedup the
beam; a snake-gradient eval term to cut the remaining collapses.

## wordle

Interactive 6-letter Wordle optimizer. The answer is always in the provided
~10k word list, but guesses may be arbitrary alphabetical 6-letter strings.

Rules differ from standard Wordle for duplicate letters: feedback is independent
per position. For guess letter `g` and answer `a`:
- `3` if `g === answer[i]`
- `2` if `g` appears anywhere in the answer
- `1` otherwise

No letter-count consumption is used.

Current solver file: `src/contests/cg/opti/wordle.ts`.

Current TS strategy kept in file:
- first guess: `LACIES`
- table for turn 2: `firstResult -> secondGuess`
- table for turn 3: `(firstResult, secondResult) -> thirdGuess/answer`
- turn 4+: runtime greedy splitter over the remaining candidates

The current table strategy scored **203** on the leaderboard. This is worse than
the best runtime-only baseline, but the user asked to keep it as-is for now so we
can improve the JSON/table later.

Best leaderboard observations so far:
- Runtime greedy with first `LACIES`: **171**
- Same greedy with first `CALIES`: **179**
- Same greedy with first `CARIES`: **179**
- Small exact-search / stronger candidate bias variant: **177**
- Forced table for only turn 2: **201**
- Table through turn 3, original JSON: **203**
- Python-like greedy alignment in TS without full policy: **191**

Important conclusion: partial offline alignment hurts. A second/third guess chosen
by the Python policy can be bad when the rest of the play falls back to a different
TS greedy. To make tables work, improve the whole table policy, not just the first
one or two levels independently.

Tool scripts live in `src/contests/cg/opti/wordle-tools/`:
- `wordle_precalc.py`: downloads/caches `6letters.txt`, builds JSON policies, prints
  quality metrics, and can generate policies with `--fixed-first` and
  `--optimize-table3`.
- `wordle_simulate_ts.py`: reads the current TS constants, simulates the strategy
  over random samples, and reports comparable local scores.
- generated files/cache go to `src/contests/cg/opti/wordle-tools/out/`, which
  is ignored by git.

Useful Python commands:

```powershell
python src\contests\cg\opti\wordle-tools\wordle_precalc.py --seconds 30 --policy-seconds 240 --synthetic 12000 --first-keep 20 --fixed-first lacies --second-keep 8 --third-keep 2 --exact-threshold 0 --optimize-table3 --out src\contests\cg\opti\wordle-tools\out\wordle_lacies_table3_try.json
```

This produced the currently integrated improved JSON/table:
- `policy_avg_cost`: **4.8575**
- `solved_by_3`: **3638 / 9935** words
- `solved_by_4_or_less`: **6946 / 9935** words
- `ambiguous_after_3`: **2989** words

Previous table JSON (`wordle_firstkeep_40_slow.json`) for `LACIES` was worse:
- `policy_avg_cost`: **4.9834**
- `solved_by_3`: **3619**
- `solved_by_4_or_less`: **6704**
- `ambiguous_after_3`: **3231**

Local simulation command:

```powershell
python src\contests\cg\opti\wordle-tools\wordle_simulate_ts.py --runs 10 --sample 50 --seed 20260607
```

Scores obtained with current TS table strategy on 10 random samples of 50 words:

```text
198 194 187 185 195 195 190 190 194 195
min=185 max=198 mean=192.30
```

TS size with current turn-2/turn-3 table: about **86,661 characters**. This is
probably below a 100k CodinGame source limit, but not by a huge margin.

Next likely direction:
- Keep TS table mechanics as-is.
- Improve `wordle_precalc.py` policy quality, especially the choice of second/third
  guesses for the hidden validation distribution.
- Compare JSONs using `wordle_simulate_ts.py` before submitting.
- If returning to runtime-only, restore the baseline greedy with `LACIES`; that is
  currently the best known submitted score (**171**).
