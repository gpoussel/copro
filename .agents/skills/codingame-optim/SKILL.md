---
name: codingame-optim
description: >-
  Attack a CodinGame OPTIMIZATION puzzle (the "Optim" category: Mars Lander optim,
  A*Craft, SameGame, Search Race, Code vs Zombies, 2048, Travelling Salesman,
  Wordle, Code of the Rings, Number Shifting…), where the puzzle is not pass/fail
  but scored — you must maximize (or minimize) a quality metric and climb a
  leaderboard. Use this whenever the user wants to solve, improve, or tune a
  CodinGame optim puzzle, mentions a score/leaderboard rather than "tests pass",
  asks for a better heuristic/search/GA/beam search for a CodinGame puzzle, or
  wants to squeeze more points out of an existing optim solution. Not for regular
  pass/fail puzzles (write a straightforward solution) nor for "Shortest" byte-golf
  (use the codingame-golf skill).
---

# CodinGame Optimization puzzles

An optim puzzle is a **search problem with a scoreboard**, not a correctness
problem. Passing is trivial; the whole game is *how well* you pass. That changes
the workflow completely: you don't write a solution, you build a **scoring loop**
and then feed it search.

## The three questions to answer before writing any solver

1. **What exactly is scored?** Read the statement for the metric, then find the
   *shape* of it. It is almost never "do the obvious thing well". Examples from
   this repo: `code-vs-zombies` scores `aliveHumans² × 10 × fib(n)` per kill — the
   square means keeping humans alive dominates everything, and the Fibonacci means
   multi-kill combos are the real lever. `codingame-sponsored-contest` turned out
   to score ≈ 2 × distinct cells visited — a *coverage* objective, so every turn
   spent fleeing a ghost is a turn not scoring. Misreading the metric costs more
   than any amount of tuning.
2. **Is the referee deterministic and knowable?** If yes, you can build a faithful
   offline simulator and iterate for free. If no (hidden ghost AI, hidden maze),
   your only oracle is a real submission — and everything below changes.
3. **Do the visible tests predict the score?** Usually **NO** — see the golden rule.
   But check: `mars-lander` (optim) states outright that validators are near-copies
   of the visible tests. Read the statement's "Note" section; it tells you.

## The golden rule (and its exception)

**The visible test cases usually do NOT predict the leaderboard.** Most optim
puzzles are ranked by *one fixed hidden validator set* that is not the visible
cases. Do not tune against the visible cases and declare victory — use them to
catch regressions, not to measure quality.

The exception is the puzzles whose statement explicitly promises the validators
mirror the tests (Mars Lander optim says exactly this). There, the visible tests
*are* the objective and you can tune directly.

**Submissions are rank-safe.** CodinGame keeps your **best** submission ever, so a
failed experiment can never lower your rank. Aggressive experiments are free in
rank terms — they only cost a submission round-trip. That makes submitting the
correct way to resolve "is this actually better?" when you have no offline oracle.

## Build the offline harness first — it is the whole game

Every strong result in this repo came from a **faithful offline simulator** plus a
scorer, living in `src/contests/cg/opti/<slug>-tools/` (plain `.mjs`, run with
`pnpm exec node`). Build it *before* the solver:

- Port the referee's rules **verbatim**, including the parts that look like
  implementation noise — they aren't. For `2048` the spawn PRNG is a custom
  generator (`seed = seed*seed % 50515093`), free cells are listed **column-major**,
  and getting either wrong desyncs the whole game.
- **Calibrate against the real runner.** Use the CodinGame MCP tool
  `run_puzzle_tests` and diff your simulator's predicted trajectory/score against
  the real one. A simulator you never calibrated is a confident lie.
- **Add desync detection**: have the bot predict the next state and assert it
  matches what the referee actually sends. This catches referee misunderstandings
  immediately instead of as a mysterious low score.
- Give the harness a `bench` mode over all visible seeds printing per-seed + mean,
  so a tuning change is one command.
- Keep the solver and the harness's copy of the decision logic **in sync by hand**,
  and say so in a comment — this duplication is the standing hazard of the pattern.

If the referee is *not* knowable (hidden state, hidden AI), say so out loud and
plan for blind submission-driven iteration instead — and expect a low ceiling.

## Probe the referee's *semantics* before writing the solver

The physics equations are the easy part; the **edge semantics** are where the points
are, and they are only discoverable empirically. On `mars-lander` two probes were
worth ~+30 fuel while *every* GA parameter sweep combined was worth nothing:

- **Limits are usually checked on the ROUNDED values you're shown, not the internal
  floats.** Mars Lander accepted a touchdown at float `vy = −40.34` (displayed as
  −40) even though the stated limit is 40 — the true limit is `< 40.5`. That half a
  metre per second of extra legal speed is free fuel on every single test.
- **Collision/end-of-episode has its own rounding.** A turn ending at float
  `y = 149.83` above ground at 150 was still flying; a naive float segment-
  intersection ends the episode one turn early. This is not a scoring nit: a plan
  whose touchdown is legal in a one-turn-early sim becomes an illegal crash when the
  referee runs the extra turn.

Method: write a program that **echoes its inputs to stderr** and executes a **fixed
command script**, run it with `run_puzzle_tests`, and read the ground-truth
trajectory back from the per-frame stderr (available on most puzzles — but *not* on
`codingame-sponsored-contest`, where stderr is hidden). Three or four such calls pin
down the integration order, the rounding, and the acceptance limits. **Design each
probe so the competing hypotheses predict different verdicts** — one Mars Lander
probe was wasted because it landed at `vy = −39.77`, which is legal under both the
rounded and the float reading and therefore discriminates nothing.

Corollary: **maintain your own internal float state and never trust the rounded
inputs.** Feed your simulator its own previous state, use the referee's inputs only
for a desync assertion. This turns online control into offline planning.

## Choosing the search

Deterministic + short horizon → **beam search** (`2048`: beam over the move tree,
commit a batch per turn). Continuous control + physics → **genetic algorithm over
the action sequence** (`code-vs-zombies`: genome = future move angles, evaluated by
an inline faithful sim). Combinatorial tour/assignment → **local search + ILS**
(`travelling-salesman`: nearest-neighbour + 2-opt + Or-opt + don't-look bits +
double-bridge restarts). Whatever the family:

- **Seed the population/beam with your best heuristic.** It guarantees the search
  can never do worse than the heuristic (`code-vs-zombies` seeds the GA with the
  handwritten defender; that's its floor).
- **Budget by time, not by iteration count.** CodinGame's hardware is slower than
  your machine — a fixed generation count that fits locally can time out there.
  Use a wall-clock budget (~90ms of the 100ms turn) so it auto-adapts, and keep a
  safe fallback if the search doesn't reach its horizon in budget.
- **Randomised search is high-variance.** The same GA config can swing ±20% across
  runs. Never conclude a tunable is better from one run — and remember a single
  submission is itself one noisy sample (resubmitting the *same* bot can score
  higher, and CG keeps the best).
- **Enforce the hard constraints at decode time, not through the fitness.** The
  biggest search-quality win on `mars-lander` was a guard that forces the rotation
  request to 0 as soon as the lander could no longer straighten up before touching
  down. Random genomes essentially never end at exactly angle 0, so without the
  guard the GA burns its whole budget rediscovering "be upright" instead of
  optimising fuel; with it, almost every genome is landing-legal and the search goes
  straight at the objective. Generalise: any constraint you can *project onto*
  rather than *penalise for* makes the feasible manifold dense and the search cheap.
- **Spend the turn budget on evaluation, not bookkeeping.** Print the command
  *first*, then do population maintenance, and defer re-evaluations into the next
  turn's timed budget — a fixed post-output eval pass can silently eat the next
  turn's clock on CG's slower hardware.

## Tuning discipline

- Change **one tunable at a time** and re-bench. Optima here are sharp: in `2048`,
  `commitLen` 28 → 652k but 30 collapses; `W.mono` peaks at 2.0 and is much worse
  at 1.7 or 3.5.
- **Bigger is not better.** Wider beams overfit an imperfect eval to fragile lines
  and can fail to reach the horizon in budget (`2048`: beam 800 is *worse* than
  200). More restarts at the same depth don't help when the floor is depth-bound
  (`travelling-salesman`: deeper Or-opt segments gained, more draws didn't).
- **Fitness shaping beats knob tuning.** On `mars-lander`, sweeping the GA knobs
  (population 30–80, mutation 0.03–0.12, block-mutation 0.35–0.6) produced nothing
  but noise — a config that looked better on two seeds evaporated on re-test —
  while the referee-semantics fixes and the decode-time guard produced all the real
  gains. Only trust a knob change if the offline bench shows a gap bigger than the
  run-to-run spread across at least three seeds.
- **Write down the dead ends.** Half the value in `src/contests/cg/opti/CLAUDE.md`
  is the list of things that regressed: proactive fleeing (−400 pts), partial
  offline table alignment in `wordle` (worse than plain runtime greedy), LK moves
  in TSP (no reliable gain). Record the failed experiment with its number, so
  nobody re-runs it.
- Know when you've hit the **ceiling of the approach**. If two independent
  micro-tweaks both come back byte-for-byte identical in score, more tweaking is
  wasted — the next gain needs a structurally different planner, and that's a
  deliberate decision, not a tweak.

## Repo conventions

- Solver: `src/contests/cg/opti/<slug>.ts` — a **standalone** program, no imports
  from the repo, reading the ambient `readline()` global (declared in
  `src/contests/cg/puzzle/cg.d.ts`) and writing with `console.log`. Open it with a
  header comment stating the rules, the scoring formula, and the approach, and put
  the tunables together at the top.
- **It must type-check under `strict`** — CodinGame runs `tsc` and a type error
  fails the run before it ever executes. `pnpm typecheck` covers `opti/` (unlike
  `golf/`, which is excluded). Run it before every submission.
- Harness: `src/contests/cg/opti/<slug>-tools/*.mjs`. Generated data/caches go in
  an ignored `out/` subfolder.
- Working notes per puzzle: `src/contests/cg/opti/CLAUDE.md` — append a section
  per puzzle with the scoring formula, referee internals, submitted scores, tuned
  values, and the failed experiments. This file is the memory of the effort; keep
  it current, because the offline harnesses are worthless without the context of
  what was already tried.
- **Game-loop puzzles must emit output every turn** and never block; a missed turn
  scores zero.
- Bump the CodinGame count in the root `README.md` table when a puzzle is solved.

## Submitting

The user submits (or asks you to). Before proposing a submission: `pnpm typecheck`
is clean, the harness bench shows no regression, and you can state the expected
score. After a submission, **record the real score in `CLAUDE.md`** next to the
offline prediction — the gap between the two is the single most useful number you
have, because it tells you whether your offline oracle is worth trusting at all.
