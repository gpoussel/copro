# CodinGame Optimization puzzles — working notes

Solvers scored by **quality** (a score, not pass/fail). A puzzle's ranking is decided
by **one fixed hidden test case, the same for everyone** — the visible cases are not it.

**Golden rule:** the visible test cases do **NOT** predict the leaderboard. Don't tune
against them — the only ground truth is a real submission. The user submits promising
variants (sparingly); CodinGame keeps your **best** submission, so aggressive
experiments never lower your rank. Keep files type-clean (CG runs `tsc`).

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
