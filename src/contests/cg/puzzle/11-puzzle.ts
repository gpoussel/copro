// 🎮 CodinGame Puzzle - 11-puzzle
// https://www.codingame.com/training/hard/11-puzzle

// IDA* on the 3x4 sliding puzzle, with the Manhattan distance plus linear
// conflicts as admissible heuristic (updated incrementally for Manhattan).
const R = 3
const C = 4
const N = R * C
const board: number[] = []
for (let r = 0; r < R; r++) board.push(...readline().trim().split(/\s+/).map(Number))

const manhattan = (tile: number, pos: number): number =>
  tile === 0 ? 0 : Math.abs(Math.floor(tile / C) - Math.floor(pos / C)) + Math.abs((tile % C) - (pos % C))

// Linear conflicts: pairs of tiles in their goal row (or column) in reversed order
const conflicts = (): number => {
  let lc = 0
  for (let r = 0; r < R; r++)
    for (let a = 0; a < C; a++) {
      const t = board[r * C + a]
      if (!t || Math.floor(t / C) !== r) continue
      for (let b = a + 1; b < C; b++) {
        const u = board[r * C + b]
        if (u && Math.floor(u / C) === r && u < t) lc += 2
      }
    }
  for (let c = 0; c < C; c++)
    for (let a = 0; a < R; a++) {
      const t = board[a * C + c]
      if (!t || t % C !== c) continue
      for (let b = a + 1; b < R; b++) {
        const u = board[b * C + c]
        if (u && u % C === c && u < t) lc += 2
      }
    }
  return lc
}

const neighbours: number[][] = []
for (let p = 0; p < N; p++) {
  const r = Math.floor(p / C)
  const c = p % C
  const ns: number[] = []
  if (r > 0) ns.push(p - C)
  if (r < R - 1) ns.push(p + C)
  if (c > 0) ns.push(p - 1)
  if (c < C - 1) ns.push(p + 1)
  neighbours.push(ns)
}

let md = 0
for (let p = 0; p < N; p++) md += manhattan(board[p], p)
const path: number[] = []

const search = (blank: number, g: number, bound: number, prev: number): number => {
  const f = g + md + conflicts()
  if (f > bound) return f
  if (md === 0) return -1
  let min = Infinity
  for (const q of neighbours[blank]) {
    if (q === prev) continue
    const t = board[q]
    const delta = manhattan(t, blank) - manhattan(t, q)
    board[blank] = t
    board[q] = 0
    md += delta
    path.push(q)
    const res = search(q, g + 1, bound, blank)
    if (res === -1) return -1
    path.pop()
    md -= delta
    board[q] = t
    board[blank] = 0
    if (res < min) min = res
  }
  return min
}

const blank = board.indexOf(0)
let bound = md + conflicts()
while (true) {
  const res = search(blank, 0, bound, -1)
  if (res === -1) break
  bound = res
}
console.log(path.map(q => `${Math.floor(q / C)} ${q % C}`).join("\n"))
