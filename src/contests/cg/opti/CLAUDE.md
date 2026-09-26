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

## code-vs-zombies

Ash moves 1000/turn, shoots all zombies within 2000 at end of turn. Zombies move
400/turn toward the nearest human (Ash included) and eat one they reach. Turn
order: zombies move → Ash moves → Ash shoots ≤2000 → surviving zombies on a human
eat it. **Score per kill = aliveHumans² × 10 × fib(n)** for the n-th kill that
turn (fib = 1,2,3,5,8,…). Losing every human ⇒ **0 for that test**. So keeping
humans alive (squared!) dominates; multi-kill combos are the secondary lever.

**Big advantage over sponsored-contest: the rules are fully deterministic**, so we
have a **faithful offline simulator** — `code-vs-zombies-tools/sim.mjs` + the 21
visible scenarios in `cases.json`. Run:
`pnpm exec node src/contests/cg/opti/code-vs-zombies-tools/sim.mjs` (prints per-
test + TOTAL). `decide()` in sim.mjs **mirrors** `code-vs-zombies.ts` — keep them
in sync by hand. Standard golden-rule caveat: visible totals don't predict the
hidden validator, but they're great for catching regressions.

**Input gotcha:** the raw `testIn` lists humans/zombies as just `x y` (the engine
adds ids + zombie next-positions at runtime). The shipped bot reads the real
stdin (`id x y` humans, `id x y nx ny` zombies); the sim parses the seed form.

**Heuristic baseline (`sim.mjs`): offline TOTAL 42760.** Per human compute zombie
ETA (`ceil(d/400)`) and Ash defend-ETA (`ceil((d−2000)/1000)`); defend the most
urgent *savable* human; if none savable but some threatened, rush the closest one
(never let everyone die — v1 scored 0 on test 9 "Rectangle", v2 → 900); else farm
the densest zombie cluster. This is now just the GA's seed/floor.

**Shipped bot = per-turn GENETIC SEARCH** over Ash's future move-angle sequence
(genome = `HORIZON=40` angles), evaluated by an inline faithful simulator. Each
turn: seed the population with the heuristic genome (guarantees we never score
below it) + the previous turn's best (shifted) + mutations + randoms, evolve until
`TIME_BUDGET_MS=90` (time-based so it auto-adapts to CG's slower hardware and never
times out), output the first move. Eval penalises losing all humans (−1e9) and
adds a small survivor bonus. This lines up Fibonacci multi-kill combos while
keeping humans alive.

**Offline scorer `ga.mjs`** mirrors the bot with a fixed gen budget instead of
time: **TOTAL ≈ 250k–320k** (RNG variance) vs 42760 heuristic — combo tests jump
hugely (test 6 3600→~80k, test 17/18 ~7k/9k→~40k+). Timing: ~5ms/turn at
POP36/GENS12, ~22ms/turn at POP60/GENS30 locally — well under 100ms, so the
time-budgeted bot gets many generations. End-to-end checked: the real bot reads
the live stdin format (`id x y` humans, `id x y nx ny` zombies), returns a valid
move in budget. Not submitted yet at time of writing.

Keep `sim.mjs decide()`, `ga.mjs`, and `code-vs-zombies.ts` in sync by hand.
`ga.mjs` takes `POP`/`GENS`/`HOR` env overrides.

**Submitted: 210920** (heuristic baseline would be ~42k; #1 ≈ 1,763,840, ~8x).
So the approach works and the offline scorer is representative, but top solutions
extract far bigger Fibonacci combos.

**The GA is high-variance** — repeated offline runs of the same config swing wildly
(e.g. HOR=80 gave 195k–234k across runs; HOR=100 ~228k–253k). Longer horizon helps
*on average* but a longer eval means fewer generations within the 90ms turn budget
on CG, so it's not a clear win — don't bump HORIZON blindly. The variance also
means a single submission is noisy; CG keeps your best, so resubmitting the same
bot can itself bump the score.

**Path to higher scores (combo herding).** 1.76M needs deliberately luring zombies
into one tight cluster while keeping ALL humans alive (the aliveHumans² multiplier),
then killing the whole cluster in one/few turns for a huge fib sum. Random-angle
GA rarely discovers precise herding. Likely upgrades (each verify via `ga.mjs`,
watching variance over several runs, before submitting): a genome of **target
points / entities** instead of raw angles (expresses "go to cluster centroid"
directly), a longer horizon paired with a faster eval (typed arrays / fewer allocs
so more generations fit the budget), and an eval term that rewards *grouping*
zombies (future combo potential), not just realized kills. This is a substantial
optimisation effort with noisy feedback, not a quick tweak.

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

---

## mars-lander (fuel optimisation)

Score = fuel remaining after a safe landing, summed over validators. **Exception
to the golden rule:** the statement explicitly says validators are near-copies of
the visible tests ("un programme qui passe un test passera le validateur
correspondant") — tune directly against the 5 visible tests.

**Physics (calibrated bit-exact vs the real runner, `mars-lander-tools/validate.mjs`):**
per 1s turn: `angle += clamp(req-angle, ±15)` (req clamped ±90), `power +=
clamp(req-power, ±1)` (0..4, forced 0 when fuel 0), `fuel -= power`, `ax =
-sin(angle°)*power`, `ay = cos(angle°)*power - 3.711`, `pos += v + a/2`, `v += a`.
Internal referee state is FLOAT; the ints we receive are `Math.round` of it.

**Two referee semantics worth real fuel (found via fixed-script probes through
`run_puzzle_tests` — stderr IS returned per frame for this puzzle):**
- **Landing speed limits are checked on ROUNDED speeds**: float vy = −40.34
  (displays −40) was accepted. So the true float limits are < 40.5 / 20.5. The
  bot uses MAX_VY=40.35 / MAX_VX=20.35 (0.15 buffer). Worth ~+20 fuel/test vs
  a naive 39/19 margin.
- **Collision fires only when the trajectory goes strictly below the surface in
  rounded terms** — a turn ending at float y=149.83 over ground 150 is still
  flying (referee waited one more turn than a float segment-intersection test).
  Model it by lowering the surface by `SINK = 0.5` in the intersection test;
  after that fix our sim's landing turn + fuel match the referee exactly.

**Solver** (`mars-lander.ts`): per-turn GA over future command deltas
(dAngle∈[-15..15], dPower∈[-1..1], horizon H=120), fitness bands landed(+fuel)
> crash-in-zone(overspeed/angle-graded) > outside/lost/timeout(distance-graded),
decode-time guard forcing rotation→0 when a gravity-only fall reaches ground
within `ceil(|angle|/15)+1` turns (makes nearly every genome landing-legal),
internal FLOAT state maintained by replaying our own commands (rounded inputs
only used for a desync check — never fired in any real run), population
warm-started across turns (shift left, refill tail, re-eval postponed into the
next turn's 80ms budget; post-output work is copies only). Seeded with a
hand-written descent controller as floor.

Tuned values: POP=50, ELITE=8, MUT=0.06, BLOCK_MUT=0.35, H=120, TIME_MS=80.
The GA is remarkably flat here: POP 30–80, MUT 0.03–0.12, BLOCK_MUT 0.35–0.6
all score within ±20 total (noise). Don't waste time on these knobs; the
referee-semantics work above was worth more than all parameter tuning combined.

**Real-runner scores (run_puzzle_tests, the committed bot):** test1 327,
test2 334, test3 469, test4 532, test5 707 → **TOTAL 2369**, all landed, no
desync. Offline bench predicts 2380–2405 at the same settings (CG hardware is
slower ⇒ fewer generations ⇒ a few fuel less). NOT SUBMITTED yet at time of
writing (user submits).

**Harness** (`mars-lander-tools/`, `pnpm exec node …`):
- `sim.mjs` referee (SINK + rounded-speed landing check), `cases.json` the 5 tests.
- `validate.mjs` — replays a captured real-referee trajectory; must print
  CALIBRATION OK after any sim change.
- `bench.mjs [--ms=80 --seed=N --case=K --pop --mut --bmut --h --maxvx --maxvy]`
  — full episodes over the 5 cases, prints per-case fuel + TOTAL.
- `bot.mjs` mirrors `mars-lander.ts` BY HAND — keep in sync.
- `dump.mjs --case=K [--maxvy=…]` — dumps a full command script + touchdown
  floats; paste into a fixed-script probe to interrogate the real referee.

**Insights for reruns:** fuel-optimal shape is free-fall/cruise, ride vy ≈
−41…−47 mid-flight (only the TOUCHDOWN speed is checked), late full-power brake
to touch at rounded −40; horizontal travel tilts hard (±60°) early. The
descent-speed profile follows from thrust 4 barely beating gravity (net +0.289):
you can only shave ~0.3 m/s per braking second, so the GA rides just above the
recoverable envelope. Turn-1 GA has no landed genome yet; fitness shaping alone
steers the early free-fall commits — that was never a problem in practice.

---

## a-star-craft

Place arrows once on a 19x10 **torus** to route robots; each turn score += number
of live robots. A robot moves 1 cell in its facing, an arrow rotates it, void or a
repeated `(cell,dir)` state kills it. **Score = sum of per-robot lifetimes.** It is
a **one-shot combinatorial optimization** (output all arrows once, no game loop),
so the whole game is: faithful simulator + local search.

**Referee facts** (CodinGameCommunity/A-Star-Craft, read verbatim):
- A robot's state hashes on `Cell` *identity* (no `hashCode` override) + direction,
  and there is one Cell per (x,y) → state == `(x, y, dir)`.
- Raw contributor map (what the MCP `testIn` shows): **UPPERCASE `URDL` = a robot**
  with that facing on an empty cell; **lowercase `urdl` = a FIXED pre-placed arrow**;
  `.` empty platform; `#` void. The program's actual stdin uppercases the arrows and
  lists robots separately (`robotCount` then `x y DIR`), robot cells shown as `.`.
- `apply(x,y,d)`: only onto an empty (`NONE`) platform cell; if a robot sits there it
  **overrides that robot's initial direction** (place an arrow under a robot to turn
  it at start). Then `registerStates()`.
- `play()` order: `score += robots.size()`; each robot moves; void → dead; else arrow
  turns it; register new state; repeat → dead. Robots **never interact** (arrows are
  static), so each robot is simulated independently and summed.

**Simulator** `a-star-craft-tools/solver.mjs` — `score(cfg, robots)` walks each robot
with a stamped `visited` buffer (state = `idx*4+dir`), no allocation. Candidate cells
= empty platform cells reachable from a robot on the non-void component (flood fill);
arrows anywhere else can never be visited, so they're excluded from the search.

**Solver** `a-star-craft.ts` = **simulated annealing** over single-cell arrow choices
(`{NONE,U,R,D,L}`), full re-eval each step (a few thousand ops), geometric cooling
`T*=0.99997` from 3.0, reheat-to-best after 60k non-improving steps, ~900ms budget.
Millions of iterations fit easily. Mirrors solver.mjs by hand (keep in sync).

**Calibration = BIT-EXACT.** Via `run_puzzle_tests` (side-effect-free) the referee's
`Points` matched the solver's own `PREDICT` on every probed test: Simple 23=23,
Plateforme3x3 11=11, Rond-point 100=100, CodinGame 86=86. No sim discrepancy.

**THE bug worth remembering — start the clock AFTER reading input.** First submit
scored the *baseline* (12/24/1/2 = no arrows) on every test: `T0 = Date.now()` at
module load, but the first `readline()` **blocks ~1s** until the referee sends turn-0
data, so the very first SA time-check already saw `Date.now()-T0 >= budget` and broke
at iteration 0. Fix: capture `T0` right after the input read. This is the A*Craft form
of the general game-loop timing hazard — the blocking read is not free wall-clock.

**Offline bench** (`a-star-craft-tools/bench.mjs [timeMs] [seed]`, all 30 visible maps,
re-scores each result as a mismatch check): TOTAL **9285** at 900ms, every map > 0, no
mismatch → all validators pass (100%). Visible totals don't predict the hidden
leaderboard, but here every non-empty placement clears the bar; the lever for rank is
placement *quality* (longer non-looping coverage tours). Bench is the regression
guard; the online `run_puzzle_tests` calibration is the correctness proof.

**SUBMITTED: score 100, 30/30 validators (submissionId 41009675)** — puzzle solved.
Labels claimed (optimization, simulation).

Next directions if pushing rank: incremental re-eval (only re-sim robots whose path
touches the changed cell) to raise iterations; multi-restart / population SA; a
coverage-biased eval or seeding a boustrophedon fill so the search starts near a
board-covering tour instead of from empty.

---

## search-race

Drive a car through 3 laps of checkpoints (radius 600), map 16000x9000, max 600
turns. **SCORE = timer + colTime** (completed turns + fractional swept-collision
time of the FINAL checkpoint, rounded to 2 decimals), lower better; 1000 if not
finished. The finishing turn does NOT increment the timer. Per-turn limits:
50ms (first turn 1000ms).

**Referee facts** (Illedan/CGSearchRace, ported verbatim in
`search-race-tools/engine.mjs`):

- Per turn: rotate (≤18°) → `v += heading*thrust` → swept-circle collision loop
  against the next checkpoint (instant hit if already inside; `t_col + t ≤ 1`)
  → `move(1-t)` → adjust: truncate x/y, `v = truncate(v*0.85)`, angle rounded
  to whole degrees, normalized into **[0, 360] with 360 included**.
- `Utility.truncate` = round if within 1e-5 of an int, else trunc toward zero.
- **The whole state is integer after adjust** (pos/speed truncated, angle whole
  degrees) → the 6 turn inputs fully determine the state; replan every turn with
  zero float carry. Maintain a predicted-next-state desync check anyway.
- **Output `EXPERT rotationAngle thrust`** (rot integer in [-18,18], thrust
  0..200): applied verbatim (`angleDeg += rot`), which makes the sim exact
  integer-degree arithmetic and avoids the X-Y-target pitfalls (atan2 rounding,
  and the referee's "target == position → no rotation AND NO THRUST" edge).
- The streamed checkpoint list starts at index 1: `seq[i] = cps[(i+1) % n]`,
  and the next checkpoint to hit is always `seq[checkpointIndex]` — use the
  streamed list directly.
- Initial car: on `cps[0]`, v=0, angle = rounded degrees of atan2 toward
  `cps[1]`.

**CALIBRATION = BIT-EXACT** via `run_puzzle_tests` probes (stderr echoes the
inputs): a 600-turn orbiting trace AND a full 93-turn winning race matched the
referee state-for-state, and the referee's final score (92.48) equalled the
predicted `timer + colTime` exactly. `validate.mjs` replays a captured dump and
must print CALIBRATION OK after any engine change.

**Solver** (`search-race.ts`) = per-turn GA over a horizon of (rot, thrust)
gene pairs, faithful inline sim, warm start from previous best (shifted) +
greedy seeds (aim-at-cp with/without >90° coasting) + straight-full-thrust +
randoms. Fitness: finish within horizon dominates (earlier + colTime better),
else `passed*50000 - dist(next)` **minus VEL_W × speed-away-from-next-cp**.
Tuned: H=15, POP=48, ELITE=8, MUT=0.12, VEL_W=4, TURN_MS=36.

**THE fitness lever: VEL_W** (end-of-horizon velocity projected on the
direction to the next checkpoint). Adding it took the 19-case offline total
from 4274 to **3735** (−12%) — more than every knob combined. Sweep: 1→3756,
2→3755, **4→3735**, 6→3743, 8→3740. Distance-only fitness undervalues carrying
speed. Knobs after that are flat: POP 48 ≈ 24 (±15), POP=72 slightly worse,
MUT 0.25 neutral, H: 12 worse (4524@200gens), 15 best (4358), 20 worse (4425).

**CG TIMEOUT HAZARD (cost a real 1000 on test8 at TURN_MS=40):** the budget
check between generations is too coarse on CG's slower hardware — one
generation + a GC pause can bust the 50ms cap mid-race. Fix: TURN_MS=36,
re-check the clock **per child** inside the breeding loop, and zero per-turn
allocations (reused warm-start buffers, search returns a pop reference). After
the fix: no timeout, real scores ≈ offline (test1 77.34 vs 77.55 predicted,
zero DESYNC in any frame).

**Offline bench** (`search-race-tools/`, `pnpm exec node bench.mjs
[--ms=40|--gens=N] [--pop --elite --mut --h --velw --seed --case]`): 19 visible
cases, per-case time + TOTAL + gens/turn. At --ms=40: **TOTAL 3733.75, 0
fails** (~1000 gens/turn locally, ~2ms/gen-batch). `runner.mjs [label]` runs
the REAL search-race.ts end-to-end via a readline shim (smoke test).
`bot.mjs` mirrors the solver BY HAND — keep in sync.

**Real-referee scores** (run_puzzle_tests; offline prediction in parens):
test1 77.34 (77.55), test2 79.07 (78.30), test7 206.42 (204.18), test8 243.04
(242.55), test9 235.24 (235.60), test10 153.11 (152.58), test11 296.72
(296.83), Tokyo drift 105.93 (105.41), Round and round 78.77 (77.87), Hold the
line 107.1 (104.55), Longest 335.7 (334.41) — zero desync, zero timeout, real ≈
offline within ~2.5. Offline TOTAL over all 19: 3733.75 (@40ms).

**SUBMITTED: 100%, 50/50 validators (submissionId 41011232, TURN_MS=25).** The
50 hidden validators are the referee repo's test1..test50 + the 4 named maps —
their exact checkpoint layouts are public in `SearchRace/config/testN.json`, so
any failing validator can be reproduced offline. Submission history: user's
82% (stale TURN_MS=40 session draft), 94% 47/50 @TURN_MS=30 (test19/28/39
failed — all three finish offline in 203-219 turns even at 8ms budget on 3
seeds, so those were random grading-machine stalls, not algorithmic), 100%
@TURN_MS=25. Lesson: **on wall-clock-budgeted game loops, validator failures
are a dice roll on noisy graders; lower the budget (cost here ~0.3% of total
time) and resubmit rather than hunting a phantom bug.** Labels claimed.

Next directions if pushing rank: longer horizon with a faster eval (flat typed
arrays instead of per-genome objects), simulated-annealing/hill-climb hybrid on
the best genome tail, lap-aware lookahead past the chased checkpoint (aim-line
blending toward the following checkpoint), and re-tuning VEL_W per-phase
(approach vs cruise).

---

## code-of-the-rings ("Brain Fork")

Output one Brainfuck-like program that prints the phrase. The tape has 30 cells and wraps; each
cell holds a rune in the 27-symbol ring (space=0, A..Z = 1..26, wraps both ways). Ops are
`< > + - .` plus `[ ]` (loop while the current cell is not space). **Score = total program
length summed over the passed validators (lower is better).** A test fails on a wrong phrase or
on more than 4000 executed ops. There are 23 validators, which are "similar but different" to
the 24 visible tests (same labels: "Une lettre x70", "Sort long", ...). The referee is fully
known, so `tools/bench.mjs` has an exact interpreter.

**Solver** (`code-of-the-rings.ts`): a beam search over the phrase index. A state is
(tape, pointer, cost); states are bucketed by index, deduped with zobrist hashes and cut to
the beam width. Transitions:
- print one char from any of the 30 cells (move + rune adjust + `.`);
- a **period loop**: r repetitions of a period of length L ≤ 14, where each position j
  advances by a per-repetition delta |d_j| ≤ 3. d = 0 covers plain repeats; d = ±1/±2 covers
  alphabets and step sequences. Positions with d = 0 and the same letter share a cell. The
  period cells sit contiguously next to a counter cell, in either direction and at any of
  the 30 positions; the cheapest placement wins, and cells that already hold the right
  value cost nothing. The counter can be:
  - a dedicated cell stepping by k ∈ {±1, ±2, ±4, ±5, ±7}. k is coprime to 27, so the
    counter hits space exactly after r ≤ 26 steps, and k is picked to minimise |k| plus
    the adjustment from the cell's current value. The counter ends at 0, which gives a
    free space cell afterwards.
  - a **self counter**: one period cell with d ≠ 0 that reaches space after exactly r
    steps, e.g. `+[.+]` prints A..Z.
  For each state and pattern, it tries r = rmax (capped at 26) and rmax - 1.
- The beam width adapts (8..200) to keep elapsed time proportional to progress
  (`TIME_BUDGET_MS = 900`, limit is 2 s).

**Bench** (`pnpm exec node src/contests/cg/opti/code-of-the-rings-tools/bench.mjs [idx...]`):
it runs the real TS solver through a readline preload (`preload.mjs`), interprets the output,
checks the phrase and counts length and steps.
- Visible-test TOTAL: **3314** at 900 ms adaptive (3283 with a fixed beam of 160 and no time
  limit). "Sort long" (371 chars of prose) alone is ~1230-1250, so the prose-heavy tests
  dominate.

**Submitted (1 submission): 100% (23/23), criteriaScore 3306, rank 52 / 1000 shown on the
board** (the board is capped at 1000; solvedCount is 8620). #1 = 2491. The top-25% cutoff
(rank 250) is about 3869. Objective reached, so I stopped there. Labels claimed
(pattern-recognition, optimization).

Next levers, if anyone pushes further:
- nested loops;
- loops whose body re-adjusts shared cells;
- `[-]` / `[>]` idioms to reach zero or space cells;
- a smarter single-char transition for prose, such as multi-char lookahead or keeping
  common letters parked in cells. Prose tests are where most of the remaining length is.

---

## samegame

15x15, 5 colors; removing a group of n>=2 scores (n-2)^2, gravity down then empty
columns shift left, +1000 for clearing the board. Referee: acatai/SameGame (the
standard AI-benchmark rules). Fully deterministic, whole board known on turn 1
(20 s first turn, 50 ms after) → plan the whole game on turn 1, replay after
(replan if the board ever differs from the prediction — never happened offline).

**Validators = 40 boards: "Standard Testset 1..20" + the same 20 "(recolored)".**
The criterion is the sum of the 40 game scores. Visible tests 6-10 are standard
sets 1/5/10/15/20, so they are representative of the hidden set.

Leaderboard (2026-09-26): #1 178016 (~4450/board), rank ~223 ≈ 45k, rank 250 ≈
40k. The API reports total=1000, capped=false, but global ranks go past 1059, so
the list is really capped; solvedCount = 892.

**Solver** `samegame.ts`: iterated beam search (width 60, ×1.6 each restart
until the 15 s budget), dedupe by Zobrist hash, eval = score + W_COLOR ×
Σ_c (n_c−2)² (lone cell of a color −50) + 1000 if the move clears the board.
Keeping each color's total count high rewards saving colors for big final
removals (tabu-color idea).

**Submitted v1 (1 submission): 49901, 100% (40/40), global rank 195 → top
~20-22% → objective met.** v1 materialized every child (copy+apply+flood fill),
reaching only width ~400 in 15 s.

**Submitted v2 (current file, 2nd submission): 67552, 100% (40/40), global
rank 119 → top ~12-13%.** v2 ranks children from the parent's group list alone
(the eval needs only color counts), and survivors are built lazily in rank order
with dedupe → ~7x wider beam (width ~1000 in 4 s, ~2600-4100 in 15 s locally).
No timeouts on CG with the 15 s first-turn budget (run_puzzle_tests itself
errored on the long first turn, so use submissions or the offline referee).

Offline (`samegame-tools/referee.mjs`, spawns the real .ts via a readline
preload; `SG_BUDGET` ms, `SG_WC` weight; args = test indexes), tests 6-10 total:
- v1 @4 s: WC 0 → 3130, 0.25 → 4573, 1 → 3548.
- v2 @4 s: WC 0.1 → 5421, 0.25 → 6500, 0.5 → 6483, 1 → 6310.
- v2 @15 s, WC 0.35: 6867 (the +1000 clear bonus makes per-board results jumpy).

Next levers: better eval (e.g. penalise isolated
cells, pick one tabu color); NMCS/NRPA, which the leaders use (puzzle label
"NRPA"); keep refining the tail of the plan during the 50 ms turns.

---

## block-the-spreading-fire

**Rules / referee (confirmed with a stderr-echo probe through run_puzzle_tests):**
- Each turn: the cut (if any) is applied first, then every burning cell's
  fireProgress += 1; a cell reaching fireDuration ignites its `-1` neighbours at 0
  (chained within the same turn when the neighbour's fireDuration is 0). Newly lit
  cells are not incremented in the turn they ignite.
- The start cell shows progress 0 on turn 0 → "ignition turn" -1. A cell ignited at
  turn t lights its neighbours at t + fireDuration.
- Cutting a cell sets it safe immediately (blocks the fire in the same turn) and sets
  cooldown = cutDuration; the next turn shows cutDuration-1; you can cut again at turn
  s + cutDuration (s + 1 when cutDuration is 0).
- Cutting a burning cell or cutting during cooldown ends the bot (fire runs out).
- The game ends when no cell is burning. Score = value of cells neither burnt nor cut.
- Coni63's Rust repo (github.com/Coni63/cg_fire) has a local referee `src/bin/referee.rs`
  that matches these semantics, plus the 8 visible tests.

**Validators:** 8, apparently the same maps as the 8 visible tests: the first
submission scored 43326, while the offline visible total is ~42.6-43.1k. #1 = 62940
(8 players tied).
Top-25% cutoff (rank ~201 / 806) ≈ 26.5k.

**Solver** (`block-the-spreading-fire.ts`): plans everything on turn 1, replays.
- Evaluator = exact event simulation: min-heap of (ignition turn, cell), with the
  cuts of an ordered list interleaved (a cut at turn s is processed before any
  ignition event with turn >= s; if the cell is already ignited it is skipped at no
  time cost, and the replay skips it the same way). It records the executed cuts, so
  the replay never issues a cut after the evaluator's fire died out.
- SA over the cut set: add (a neighbour within 2 of a plan cell, or a random cell),
  remove, shift a cut to a nearby cell, nudge a cell's order key ±1..4. The order is
  sorted by key, and the initial key is the uncut fire-arrival turn (EDF). T goes from
  0.004·totalValue down to 0.3, geometric in time. Budget 4000 ms.
- Seeds: every "ring" {arrival > R, adjacent to arrival <= R} and every full
  row/column; the best one starts the SA.
- **Bug hit:** saving `bestCells` and re-sorting them at the end with the *mutated*
  keys changes the order → the replay diverged from the plan (test 5: predicted
  6680, got 120). Fix: store the sorted order (`bestOrd`) whenever a new best is found.

**Offline** (`block-the-spreading-fire-tools/referee.mjs [idx,...]`, env
`BF_BUDGET` ms; it spawns the real .ts via `readline-preload.cjs`, tests in
`tests.json`). Results @2 s: t1 9500, t2 700-800, t3 6400, t4 ~5200, t5 ~6700,
t6 6280, t7 ~6050, t8 ~1800-2100 → TOTAL ~42.6-43.1k.
Plan score == referee score on every test after the bestOrd fix.

**Submitted:** 1 submission, 100%, **43326, global rank 123 / 806 (top ~15%)**.
The objective was reached, so I stopped there. Labels claimed.

Next levers: the weakest maps are t2 (~800; houses are worth 3700 and burn fast),
t8 (~2k, random map) and t4 (a 47x47 open map, ~5.2k). Ideas: a smarter move that
closes the wall where the fire escapes (the first burnt cell adjacent to a saved
region), a faster incremental eval, and restarts.

---

## bulls-and-cows-2

Interactive Bulls & Cows: secret of `numberLength` (1..10) distinct digits, no leading 0.
Each turn output a guess, read `bulls cows` (`-1 -1` on turn 1). 50 ms/turn, 300 turns.
**Score = total number of guesses over all validators (lower is better)**; the winning
guess counts.

**Validators: 46 games** — 1x length 1 and 5x each of lengths 2..10 (names seen in the
submission result). Visible tests are one per length, so they are only a smoke test.

Leaderboard (2026-09-26): 770 players, not capped. #1 = 290, rank 192 (top 25%) = 491.

**Solver** (`bulls-and-cows-2.ts`): always guess a code consistent with every previous
answer. A DFS over positions with pruning per past answer (partial bulls and common-digit
count vs. target, both upper and lower bounds with the remaining positions) finds
consistent codes. If the full consistent set enumerates within `ENUM_CAP = 3000` codes
(and 40% of the time budget), choose the candidate minimising Σ(partition size)² over
the set; otherwise random-restart DFS samples (up to 400, random start digit per node)
and choose the sample that best splits the sample set. First guess fixed `1234567890`
prefix. `TIME_BUDGET = 30` ms.

**Offline bench** (`bulls-and-cows-2-tools/bench.mjs [gamesPerLen] [seed]`): transpiles
the real .ts with `typescript` and runs it in-process with a fake `readline()` that
answers the last guess. Means per length (20 games): 5.65 / 5.10 / 5.20 / 4.95 / 5.60 /
6.70 / 7.10 / 8.55 / 9.45 / 11.05 → predicted ≈ 5.5 + 5 × 63.7 ≈ 324 on the validators.
Worst turn ~50-70 ms locally at budget 38 (GC blips), hence 30 ms.

**Submitted (1 submission): 100% (46/46), criteriaScore 319, global rank 79 / 770
(top ~10%).** Objective reached, stopped. Label claimed (combinatorics).

Next levers: allow non-candidate guesses when the set is small (better splits), use
entropy / max-partition tie-breaks, precompute an optimal opening per length
(2nd guess by first answer), and for length 10 (only bulls carry information) a
dedicated permutation strategy — n=9/10 games cost the most (9.5 / 11 guesses).

---

## number-shifting

Grid of numbers. A move pushes a number v exactly v cells U/D/L/R onto another
non-zero number, which becomes a+v or |a-v|. Clear the board to finish a level.
The program prints a level password first ("first_level" = level 0), then plays.
**Criterion = "Level" metadata = (0-based index of the last level solved) + 1.**
After a solve the referee sends the next level in the same run, so one run can
chain many levels.

**Referee** (github.com/eulerscheZahl/NumberShifting, `Referee.java` +
`NumberShifting.java`), ported in `gen.mjs`:
- The test input is the seed: comma-separated signed bytes
  (`-99,12,87,19,...`). Passwords come from `SecureRandom("SHA1PRNG")` seeded with
  it (32 letters each via `nextInt(26)`). Level n seeds another SHA1PRNG with
  `seed[0] ^= n & 0xff; seed[1] ^= n >> 8`. `spawns = 3 + n/2` (n > 150:
  `3 + n - 75`), 8x5 grid, which grows (height+1, width = h*16/9) while
  `w*h < 2*spawns` (spawns -= 2 each time).
- `gen.mjs` has a from-scratch SHA1PRNG (sun.security.provider.SecureRandom:
  state = SHA1(seed), output = SHA1(state), state += output + 1 bytewise) and
  `java.util.Random.next/nextInt/nextBoolean` on top of it. **Bit-exact**: level 0
  matches the stub example, and the level passwords and maps match the game
  summaries of a real run_puzzle_tests (level 1 = `pmkhklcg...`, level 20 =
  `yhabewqs...`).
- **The validator uses the same seed as the visible test.** A submission that
  starts from the level-20 password computed offline scored 100%. That's also how
  the #1 players reach 999.
- Timing: 800 ms for the first move of a level, then 50 ms per move, 600 turns,
  one move per turn. You can print the whole plan at once; the extra lines are
  consumed on the following turns.
- **Hidden limit: "Total game duration too long (>30000ms)".** The CG runner
  costs about 130 ms per turn, so a run can't go past about 225 turns. A run from
  `first_level` reaches level 27 in about 250 turns, so it was killed. That was
  submission 1 (score 0). The run has to start from a late password.

**Solver** (`number-shifting.ts`): DFS over moves. Equal-value subtractions come
first (they remove 2 numbers), then other subtractions, then additions. It uses a
Zobrist transposition set and one prune: a number with no other number in its row
or column is dead. The DFS restarts with a node limit (3000, x1.3 each restart)
and a random tie-break inside each move class (NOISE 0.9). Restarts were the big
win: without them level 20 (18 numbers) failed at 650 ms, and level 24
(20 numbers) failed at 20 s. With them, levels 20-26 solve in 0.05-0.5 s each
offline. Level 27 (20 numbers) is not solved in 40 s with 3 different seeds.

**Harness:** run everything from `number-shifting-tools/`.
- `node gen.mjs <level>` prints the password, the map and the generator's
  reference solution.
- `NS_BUDGET=ms node sim.mjs <startLevel>` is the offline referee. It runs the
  real .ts through a readline/console.log shim, chains levels and counts turns.
- `NS_DUMP=out/plans.json` saves the plans. `node embed.mjs 15` rewrites the
  `PLANS` table in the .ts. The key is a hash of the map text. A plan is used only
  if it replays to an empty board; otherwise the level is solved live.
- Env knobs: `NS_NOISE`, `NS_RN`, `NS_RG`, `NS_SEED`, `NS_START` (the starting
  password).

**Submissions (2):**
1. Start from `first_level`, live solve: **score 0**. The run went over the 30 s
   game-duration limit.
2. Start from the level-20 password, with embedded plans for levels 20-26 and
   level 27 solved live (it fails): **100%, criteriaScore 27, global rank
   184 / 959 (top ~19%)**. The top-25% cutoff is rank ~239, which is level 22
   (level 21 is rank 234+). Level 24 is ~rank 196, and #1 is 999. The objective
   was reached, so I stopped. The puzzle has no labels to claim.

**Failed experiment:** replacing the row/column-isolation prune with a full
row/column union-find prune was slower overall at the same budget. That prune
checks that each component has at least 2 cells and an even sum, since a+b and
|a-b| keep parity. Reverted.

**Next lever** (to go past 27): the moves split into independent groups. A set of
cells that can be cleared by moves inside the set never needs anything outside
it, because moves jump over cells. So a level is an exact cover of the cells by
clearable groups, where each group is a merge tree ending in an equal
subtraction. The forum mentions this exact-cover / sub-problem decomposition.
Enumerate small clearable groups, then run DLX. Solve offline and embed the
plans, keeping the start password within ~200 turns of the last level.

---

## vehicle-routing-problem

Classic CVRP: depot 0, unlimited vehicles of capacity `c`, each customer once,
`dist = round(euclid)`. Output routes (no depot) joined by `;`. Single-shot, 10 s.
Leaderboard criterion = **total distance summed over the hidden validators**
(lower is better). The statement says validators are CVRPLib sets A and M
(some rescaled/renamed like the visible "Stars and Stripes", "Beer Delivery"...),
"similar but different" from the tests. #1 (many ties) = **87904** = the sum of
the optima. At the time of writing (349 players) top 25% (rank 87) was 91794,
i.e. ~4.4% total gap: a decent metaheuristic clears it easily.

**Solver**: SISR (Christiaens & Vanden Berghe 2020, "Slack Induction by String
Removals") inside simulated annealing, wall-clock budget 8500 ms. Ruin: remove
`ks` strings (or split strings, 50/50) from routes adjacent to a random seed
customer (c̄=10, Lmax=10, split beta=0.01). Recreate: cheapest insertion with
1% blinks, order by random/demand desc/far/close (4/4/2/1). T0/Tf = 2.0/0.02 ×
mean nearest-neighbour edge (so the schedule is scale-free across instances).
Starts from a pure recreate of all customers. No separate local search.

**Harness**: `bench.mjs <instDir> <ms> [solver] [regex] [seed]` runs the solver
(Node native type stripping + `readline-preload.cjs`) on CVRPLib `.vrp` files and
prints per-instance gap. Instances: `https://galgos.inf.puc-rio.br/cvrplib/en/download/instance/<id>`
and `.../download/bks/<id>` (ids 4..~60 cover A, B, E, F, M, P sets as single
files; set archives are .7z and there is no 7z tool here). The X set with .sol
is also on GitHub at `PyVRP/Instances/CVRP`.

Offline (2 s budget, local machine): A-n60..A-n80 + M set total gap 0.70%
(M-n200-k16 2.6%, M-n151 1.7%, most A at 0-1%). On CG (8.5 s) M-n200-k17 -> 1281
(0.4% gap) with 385k iterations: CG is at least as fast as local.

**Submissions**: v1 (above, 1 submission) -> 100% validators, labels claimed,
**criteriaScore 88006** (0.12% above the 87904 optimum sum), **rank 11 / 350
(top 3.1%)**. Objective (top 25%) reached on the first submission; stopped.
Next levers if ever needed: add intra-route 2-opt/or-opt polishing of the best,
or restarts / multiple SA runs (the remaining 102 units are spread over the
larger M-like validators).

---

## snake

96x54 grid (x < 96, y < 54). The snake starts at (14,10)..(10,10), heading
right, length 5. The N rabbits (50-70) are all given on turn 1. Each turn the
bot reads the snake body (head first) and outputs the new head cell. Stepping on
a rabbit catches it and the snake grows by 1. Leaving the map or hitting its own
body ends the game. Limits: 600 turns, 50 ms/turn. The first-turn limit was not
probed: run_puzzle_tests errored (tool error, no result) on 3 calls in a row,
then worked again.

**Scoring (the author posted the referee code on the forum,
forum.codingame.com/t/community-puzzle-snake/202961).** A catch at turn t, with
gap g = t - lastCatch (lastCatch starts at -10000):
`combo = g <= 2 ? combo + 1 : 1`; `add = combo > 1 ? 15000 * combo : 0`;
`pen = (not the first catch && g > 10) ? t * g : 0`;
`SCORE += 10000 + add - pen`.
- Combos grow quadratically along chains of rabbits spaced ≤ 2 apart.
- Gaps of 10 or less are free. Later gaps cost more (the penalty is t × g).
- Only one rabbit is caught per step (the loop breaks), so two rabbits on the
  same cell need a leave-and-return (distance 2).
- A rabbit can spawn under the initial snake. The bot drops a rabbit when it
  stepped on it and the snake did not grow.
- The score still counts when the snake dies (the probe died at turn 287 and
  scored 288542).

**Validators:** fixed tests plus random ones (50/60/70 rabbits). Forum: scores
vary by ±500k between submissions because of the random validators, so a
resubmit can change the score.

**Solver** (`snake.ts`): SA over the order of the remaining rabbits, scored with
the exact formula. The first leg uses the time-aware BFS distance from the head;
the other legs use Manhattan distance. Moves are reverse, segment move (1-3) and
swap. T goes from 20000 to 100, geometric over 3e6 iterations; the SA state
persists across turns. Budget: 40 ms on turn 1, 30 ms after (40 ms gave a 52 ms
worst turn offline). The move follows a time-aware BFS to the first planned
rabbit. A body cell i counts as free after L-i+1 moves. Among shortest paths,
the tie-break avoids other rabbits. A flood-fill check needs at least len+2
reachable cells; otherwise the bot takes the roomiest neighbour.

**Harness** (`snake-tools/sim.mjs [nGames] [seed0]`, env `ONLY=i,j`, `SN_*`
knobs, `SN_DEBUG=1` prints the plan every 25 turns): an offline referee with the
forum formula. It runs visible tests 1-2 plus random 50/60/70 games, spawning
the real .ts through `readline-preload.cjs`. Offline, 5 games: TOTAL ~3.08-3.20M.
Changing T0/T1 (2000/20) or a 3 s first turn gave no clear difference
(±3%, noise). A 60-70 rabbit game often does not finish in 600 turns.
Min-length open paths (2-opt/or-opt): 50 → 496, 60 → 579, 70 → ~580-595. The
score-optimal plan is longer than the min-length one, because gaps ≤ 10 are
free.

**Submitted (1 submission): 100%, criteriaScore 6,628,463, global rank 7 / 369
(top 1.9%).** #1 = 6,882,526; rank 92 (top 25%) ≈ 5.69M. Objective reached on
the first submission, so I stopped. Labels claimed (pathfinding, distance, graph
theory, travelling salesman).

Next levers: a longer first-turn plan (probe the first-turn limit), path shaping
so the executed path matches the plan (the plan end jumped +24 turns mid-game
once, from a detour or an out-of-order catch), and resubmitting for luck on the
random validators.
