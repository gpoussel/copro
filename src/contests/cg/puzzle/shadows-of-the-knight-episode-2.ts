// 🎮 CodinGame Puzzle - shadows-of-the-knight-episode-2
// https://www.codingame.com/training/expert/shadows-of-the-knight-episode-2

// Each feedback compares squared distances, so the quadratic terms cancel and it becomes a
// linear constraint A*b < B (WARMER), = B (SAME) or > B (COLDER) on one bomb coordinate.
// Solve X first (keeping Y fixed), then Y (keeping X on the found column). Each turn,
// brute-force the next coordinate that minimises a worst-case cost estimate.

type Range = [number, number]

const [W, H]: number[] = readline().split(" ").map(Number)
readline()
let [px, py]: number[] = readline().split(" ").map(Number)

let xl: number = 0
let xh: number = W - 1
let yl: number = 0
let yh: number = H - 1

// Split [lo, hi] into WARMER / SAME / COLDER ranges for the constraint A*v ? B
const splitRange = (A: number, B: number, lo: number, hi: number): [Range, Range, Range] => {
  const empty: Range = [1, 0]
  if (A === 0) {
    const all: Range = [lo, hi]
    if (B > 0) return [all, empty, empty]
    if (B === 0) return [empty, all, empty]
    return [empty, empty, all]
  }
  let sign: number = 1
  if (A < 0) {
    A = -A
    B = -B
    sign = -1
  }
  const fl: number = Math.floor(B / A)
  const exact: boolean = B % A === 0
  const below: Range = [lo, Math.min(hi, exact ? fl - 1 : fl)]
  const eq: Range = exact && fl >= lo && fl <= hi ? [fl, fl] : empty
  const above: Range = [Math.max(lo, fl + 1), hi]
  return sign > 0 ? [below, eq, above] : [above, eq, below]
}

// Constraint coefficients (A, B) for moving from p to t along the searched axis, with extra
// squared offset K carried by the other (already known) axis
const coeffs = (p: number, t: number, K: number): [number, number] => [2 * (p - t), K + p * p - t * t]

// Extra-jump table for an interval [0, 1] lying against the building edge, Batman at
// relative position a: from there a jump with split b either leaves the edge interval [0, b]
// (Batman then at a' = 2 - a / b of it) or an interior interval [b, 1] that halves freely.
// Greedy halving is unstable near the edge (a' drifts away from the 2/3 fixed point), so
// the value of every a is computed by value iteration and used as a lookahead heuristic.
const A_STEP: number = 0.01
const A_MAX: number = 4
const edgeW: Float64Array = new Float64Array(Math.round(A_MAX / A_STEP) + 1)
const edgeAt = (a: number): number => {
  const x: number = Math.min(A_MAX, Math.max(0, a)) / A_STEP
  const i: number = Math.min(edgeW.length - 2, Math.floor(x))
  return edgeW[i] + (edgeW[i + 1] - edgeW[i]) * (x - i)
}
for (let iter = 0; iter < 60; iter++) {
  let minW: number = Infinity
  for (let i = 0; i < edgeW.length; i++) minW = Math.min(minW, edgeW[i])
  const next: Float64Array = new Float64Array(edgeW.length)
  for (let i = 0; i < edgeW.length; i++) {
    const a: number = i * A_STEP
    // wasted jump anywhere (always possible)
    let best: number = 1 + minW
    for (let b = Math.max(a / 2, 0.02); b < 0.99; b += 0.005) {
      if (Math.abs(b - a) < 1e-9) continue
      const edgeCost: number = 1 + Math.log2(b) + edgeAt(2 - a / b)
      const midCost: number = 1 + Math.log2(1 - b)
      best = Math.min(best, Math.max(edgeCost, midCost))
    }
    next[i] = best
  }
  edgeW.set(next)
}

// Heuristic cost of a state: log2 of the interval size plus expected extra jumps
const leafCost = (p: number, lo: number, hi: number, n: number): number => {
  const sz: number = hi - lo + 1
  if (sz <= 1) return p === lo ? -1 : 0
  let extra: number = Infinity
  if (lo === 0) extra = Math.min(extra, edgeAt((p + 0.5) / sz))
  if (hi === n - 1) extra = Math.min(extra, edgeAt((n - 1 - p + 0.5) / sz))
  if (extra === Infinity) {
    const r: number = lo + hi - p
    extra = r < 0 || r >= n ? 1 : 0
  }
  return Math.log2(sz) + extra
}

// Best target along an axis, given current coordinate p, candidate interval and axis size:
// minimise the worst-case heuristic cost over the three possible answers
const bestTarget = (p: number, K: number, lo: number, hi: number, n: number): number => {
  let best: number = p
  let bestScore: number = Infinity
  for (let t = 0; t < n; t++) {
    if (t === p && K === 0) continue
    const [A, B] = coeffs(p, t, K)
    let worst: number = -Infinity
    for (const r of splitRange(A, B, lo, hi)) {
      if (r[0] <= r[1]) worst = Math.max(worst, leafCost(t, r[0], r[1], n))
    }
    const score: number = worst + (t >= lo && t <= hi ? 0 : 1e-6)
    if (score < bestScore) {
      bestScore = score
      best = t
    }
  }
  return best
}

// Pending constraint from the last jump: axis (0 = x, 1 = y) and coefficients
let axis: number = -1
let lastA: number = 0
let lastB: number = 0

while (true) {
  const dir: string = readline().trim()
  if (axis >= 0) {
    const idx: number = dir === "WARMER" ? 0 : dir === "SAME" ? 1 : 2
    if (axis === 0) [xl, xh] = splitRange(lastA, lastB, xl, xh)[idx]
    else [yl, yh] = splitRange(lastA, lastB, yl, yh)[idx]
  }
  let nx: number = px
  let ny: number = py
  if (xl < xh) {
    nx = bestTarget(px, 0, xl, xh, W)
    ;[lastA, lastB] = coeffs(px, nx, 0)
    axis = 0
  } else if (yl < yh) {
    nx = xl
    const K: number = (px - xl) * (px - xl)
    ny = bestTarget(py, K, yl, yh, H)
    ;[lastA, lastB] = coeffs(py, ny, K)
    axis = 1
  } else {
    nx = xl
    ny = yl
    axis = -1
  }
  px = nx
  py = ny
  console.log(`${nx} ${ny}`)
}
