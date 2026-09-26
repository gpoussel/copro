// 🎮 CodinGame Puzzle - takuzu-solver
// https://www.codingame.com/training/hard/takuzu-solver

// Every row / column is one of the few valid balanced lines without triples
// (8196 for n = 20). Keep a candidate list per line, filter it against known
// cells, fix cells shared by all candidates, forbid duplicate complete lines,
// and branch on the line with the fewest candidates when propagation stalls.
const n = parseInt(readline())
const half = n / 2
const full = (1 << n) - 1

const popcount = (x: number): number => {
  let c = 0
  while (x) {
    x &= x - 1
    c++
  }
  return c
}
const valid: number[] = []
for (let m = 0; m <= full; m++) {
  if (popcount(m) !== half) continue
  if (m & (m >> 1) & (m >> 2)) continue
  const z = ~m & full
  if (z & (z >> 1) & (z >> 2)) continue
  valid.push(m)
}

interface State {
  mask: number[] // lines 0..n-1 rows, n..2n-1 columns: known bits
  val: number[] // known values
  cands: number[][]
}

const init: State = {
  mask: new Array<number>(2 * n).fill(0),
  val: new Array<number>(2 * n).fill(0),
  cands: [],
}
const setCell = (s: State, i: number, j: number, v: number): void => {
  s.mask[i] |= 1 << j
  s.mask[n + j] |= 1 << i
  if (v) {
    s.val[i] |= 1 << j
    s.val[n + j] |= 1 << i
  }
}
for (let i = 0; i < n; i++) {
  const line = readline()
  for (let j = 0; j < n; j++) if (line[j] !== ".") setCell(init, i, j, line[j] === "1" ? 1 : 0)
}
for (let k = 0; k < 2 * n; k++) init.cands.push(valid)

// Returns false on contradiction
const propagate = (s: State): boolean => {
  let changed = true
  while (changed) {
    changed = false
    for (let k = 0; k < 2 * n; k++) {
      const m = s.mask[k]
      const v = s.val[k]
      const isRow = k < n
      // lines of the same orientation already fixed must not be repeated
      const taken: number[] = []
      const base = isRow ? 0 : n
      for (let o = base; o < base + n; o++) if (o !== k && s.mask[o] === full) taken.push(s.val[o])
      const filtered = s.cands[k].filter(c => (c & m) === v && !taken.includes(c))
      if (filtered.length === 0) return false
      s.cands[k] = filtered
      let and = full
      let or = 0
      for (const c of filtered) {
        and &= c
        or |= c
      }
      const known = (and | (~or & full)) & ~m
      if (known === 0) continue
      changed = true
      for (let b = 0; b < n; b++) {
        if (!(known & (1 << b))) continue
        const bit = (and >> b) & 1
        if (isRow) setCell(s, k, b, bit)
        else setCell(s, b, k - n, bit)
      }
    }
  }
  return true
}

const solve = (s: State): State | null => {
  if (!propagate(s)) return null
  let best = -1
  for (let k = 0; k < 2 * n; k++)
    if (s.cands[k].length > 1 && (best < 0 || s.cands[k].length < s.cands[best].length)) best = k
  if (best < 0) return s
  for (const c of s.cands[best]) {
    const next: State = { mask: s.mask.slice(), val: s.val.slice(), cands: s.cands.slice() }
    next.cands[best] = [c]
    const res = solve(next)
    if (res) return res
  }
  return null
}

const res = solve(init) as State
const out: string[] = []
for (let i = 0; i < n; i++) {
  let row = ""
  for (let j = 0; j < n; j++) row += (res.val[i] >> j) & 1 ? "1" : "0"
  out.push(row)
}
console.log(out.join("\n"))
