// 🎮 CodinGame Puzzle - cooperative-mate-with-rook
// https://www.codingame.com/training/medium/cooperative-mate-with-rook

const [sideToMove, wkStr, wrStr, bkStr] = readline().trim().split(/\s+/)

const sq = (s: string): number => (s.charCodeAt(0) - 97) * 8 + (s.charCodeAt(1) - 49)
const sqName = (p: number): string => String.fromCharCode(97 + Math.floor(p / 8)) + String.fromCharCode(49 + (p % 8))
const colOf = (p: number) => Math.floor(p / 8)
const rowOf = (p: number) => p % 8

const kingAdjacent = (a: number, b: number): boolean =>
  a !== b && Math.abs(colOf(a) - colOf(b)) <= 1 && Math.abs(rowOf(a) - rowOf(b)) <= 1

function kingTargets(p: number): number[] {
  const res: number[] = []
  for (let dc = -1; dc <= 1; dc++)
    for (let dr = -1; dr <= 1; dr++) {
      if (!dc && !dr) continue
      const c = colOf(p) + dc
      const r = rowOf(p) + dr
      if (c >= 0 && c < 8 && r >= 0 && r < 8) res.push(c * 8 + r)
    }
  return res
}

// Squares reached by the rook, stopping before any blocker (and at the board edge)
function rookTargets(rook: number, ...blockers: number[]): number[] {
  const res: number[] = []
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
  for (const [dc, dr] of dirs) {
    let c = colOf(rook) + dc
    let r = rowOf(rook) + dr
    while (c >= 0 && c < 8 && r >= 0 && r < 8) {
      const p = c * 8 + r
      if (blockers.indexOf(p) >= 0) break
      res.push(p)
      c += dc
      r += dr
    }
  }
  return res
}

// Is square `target` attacked by the rook (white king may block; black king is transparent)
function rookAttacks(rook: number, wk: number, target: number): boolean {
  if (target === rook) return false
  return rookTargets(rook, wk).indexOf(target) >= 0
}

function blackMoves(wk: number, wr: number, bk: number, allowCapture: boolean): number[] {
  return kingTargets(bk).filter(t => {
    if (kingAdjacent(t, wk)) return false
    if (t === wr) return allowCapture && !kingAdjacent(wr, wk)
    return !rookAttacks(wr, wk, t)
  })
}

const isMate = (wk: number, wr: number, bk: number): boolean =>
  rookAttacks(wr, wk, bk) && blackMoves(wk, wr, bk, true).length === 0

const encode = (black: number, wk: number, wr: number, bk: number) => ((black * 64 + wk) * 64 + wr) * 64 + bk

const startBlack = sideToMove === "black" ? 1 : 0
const start = encode(startBlack, sq(wkStr), sq(wrStr), sq(bkStr))
const parent: { [state: number]: number } = {}
const moveTo: { [state: number]: string } = {}
parent[start] = -1
let queue = [start]
let found = -1

while (queue.length && found < 0) {
  const next: number[] = []
  for (const state of queue) {
    const bk = state % 64
    const wr = Math.floor(state / 64) % 64
    const wk = Math.floor(state / 4096) % 64
    const black = Math.floor(state / 262144)
    const children: [number, string][] = []
    if (black) {
      for (const t of blackMoves(wk, wr, bk, false)) children.push([encode(0, wk, wr, t), sqName(bk) + sqName(t)])
    } else {
      for (const t of kingTargets(wk))
        if (t !== wr && !kingAdjacent(t, bk) && t !== bk) children.push([encode(1, t, wr, bk), sqName(wk) + sqName(t)])
      for (const t of rookTargets(wr, wk, bk)) children.push([encode(1, wk, t, bk), sqName(wr) + sqName(t)])
    }
    for (const [child, move] of children) {
      if (parent[child] !== undefined) continue
      parent[child] = state
      moveTo[child] = move
      const cbk = child % 64
      const cwr = Math.floor(child / 64) % 64
      const cwk = Math.floor(child / 4096) % 64
      if (!black && isMate(cwk, cwr, cbk)) {
        found = child
        break
      }
      next.push(child)
    }
    if (found >= 0) break
  }
  queue = next
}

const moves: string[] = []
for (let s = found; s !== start; s = parent[s]) moves.push(moveTo[s])
console.log(moves.reverse().join(" "))
