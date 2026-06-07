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
