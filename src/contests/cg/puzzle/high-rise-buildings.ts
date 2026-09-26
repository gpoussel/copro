// 🎮 CodinGame Puzzle - high-rise-buildings
// https://www.codingame.com/training/expert/high-rise-buildings

// Skyscrapers puzzle. Every row (resp. column) is a permutation of 1..N, so
// all permutations matching the two clues of that line are enumerated once
// (at most 8! = 40320). Each cell keeps a bitmask of possible heights; lines
// drop permutations using an impossible height and cells keep only heights
// still used by some permutation of their row and of their column. This
// propagation runs to a fixpoint, then a backtracking search branches on the
// cell with the fewest candidates.

const size = Number(readline())
const north = readline().split(" ").map(Number)
const west = readline().split(" ").map(Number)
const east = readline().split(" ").map(Number)
const south = readline().split(" ").map(Number)
const given: number[][] = []
for (let i = 0; i < size; i++) given.push(readline().trim().split(/\s+/).map(Number))

const visible = (p: number[]): number => {
  let best = 0
  let cnt = 0
  for (const h of p) {
    if (h > best) {
      best = h
      cnt++
    }
  }
  return cnt
}

// All permutations of 1..size
const allPerms: number[][] = []
const permute = (cur: number[], used: number): void => {
  if (cur.length === size) {
    allPerms.push(cur.slice())
    return
  }
  for (let v = 1; v <= size; v++) {
    if (used & (1 << v)) continue
    cur.push(v)
    permute(cur, used | (1 << v))
    cur.pop()
  }
}
permute([], 0)

const matching = (front: number, back: number): number[][] =>
  allPerms.filter(p => (front === 0 || visible(p) === front) && (back === 0 || visible(p.slice().reverse()) === back))

// Lines 0..size-1 are rows, size..2size-1 are columns
const initLines: number[][][] = []
for (let r = 0; r < size; r++) initLines.push(matching(west[r], east[r]))
for (let c = 0; c < size; c++) initLines.push(matching(north[c], south[c]))

const cellOf = (line: number, k: number): number => (line < size ? line * size + k : k * size + (line - size))

const full = ((1 << (size + 1)) - 1) & ~1
const initDom: number[] = []
for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) initDom.push(given[r][c] ? 1 << given[r][c] : full)

// Propagate to a fixpoint; returns false on contradiction (state mutated in place)
const propagate = (dom: number[], lines: number[][][]): boolean => {
  let changed = true
  while (changed) {
    changed = false
    for (let l = 0; l < 2 * size; l++) {
      const kept = lines[l].filter(p => p.every((v, k) => (dom[cellOf(l, k)] >> v) & 1))
      if (kept.length === 0) return false
      lines[l] = kept
      const union: number[] = new Array<number>(size).fill(0)
      for (const p of kept) for (let k = 0; k < size; k++) union[k] |= 1 << p[k]
      for (let k = 0; k < size; k++) {
        const idx = cellOf(l, k)
        const nd = dom[idx] & union[k]
        if (nd !== dom[idx]) {
          dom[idx] = nd
          changed = true
        }
      }
    }
  }
  return true
}

const popcount = (x: number): number => {
  let c = 0
  while (x) {
    x &= x - 1
    c++
  }
  return c
}

const search = (dom: number[], lines: number[][][]): number[] | null => {
  if (!propagate(dom, lines)) return null
  let bestIdx = -1
  let bestCnt = 99
  for (let i = 0; i < size * size; i++) {
    const pc = popcount(dom[i])
    if (pc > 1 && pc < bestCnt) {
      bestCnt = pc
      bestIdx = i
    }
  }
  if (bestIdx < 0) return dom
  for (let v = 1; v <= size; v++) {
    if (!((dom[bestIdx] >> v) & 1)) continue
    const nd = dom.slice()
    nd[bestIdx] = 1 << v
    const res = search(nd, lines.slice())
    if (res) return res
  }
  return null
}

const solved = search(initDom, initLines)
if (solved) {
  for (let r = 0; r < size; r++) {
    const row: number[] = []
    for (let c = 0; c < size; c++) row.push(Math.log2(solved[r * size + c]))
    console.log(row.join(" "))
  }
}
