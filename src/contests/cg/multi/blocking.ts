// 🎮 CodinGame Multiplayer - blocking
// https://www.codingame.com/multiplayer/bot-programming/blocking
//
// Blokus-like on 13x13 for 2-4 players. The referee lists the valid moves
// "col row Xfrn" (shape X, flip f, rotations r, square n of the oriented shape
// laid on col,row). The flip/rotation convention is not stated: on the first
// turn the bot keeps the convention under which every listed move is legal.
// Greedy: big shapes first, more corners for us, fewer for the others, and
// early moves towards the centre.

const BLOCK = 1.5 // weight of the opponents' corners

interface Shape {
  w: number
  h: number
  cells: [number, number][] // [x, y] of the '#' in reading order
}
const shapes = new Map<string, Shape>()
const nShapes = parseInt(readline())
for (let i = 0; i < nShapes; i++) {
  const [id, w, h, def] = readline().trim().split(" ")
  const cols = parseInt(w)
  const rows = parseInt(h)
  const cells: [number, number][] = []
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (def[y * cols + x] === "#") cells.push([x, y])
  shapes.set(id, { w: cols, h: rows, cells })
}
const nPlayers = parseInt(readline())
const myId = parseInt(readline())
const N = parseInt(readline())
readline() // authorised shapes

// The convention, fitted on a real move list (48/48 first moves; the
// statement is vague): a flip is a transpose (x, y) -> (y, x), then each
// rotation is clockwise (x, y) -> (-y, x), and the square number refers to
// the ORIGINAL shape's reading order.
function oriented(shape: Shape, flip: number, rot: number): [number, number][] {
  let pts = shape.cells.map(([x, y]) => [x, y] as [number, number])
  if (flip) pts = pts.map(([x, y]) => [y, x] as [number, number])
  for (let k = 0; k < rot; k++) pts = pts.map(([x, y]) => [-y, x] as [number, number])
  return pts
}
function moveCells(col: number, row: number, code: string): number[] | null {
  const shape = shapes.get(code[0])
  if (!shape) return null
  const pts = oriented(shape, parseInt(code[1]), parseInt(code[2]))
  const anchor = pts[parseInt(code.slice(3)) - 1]
  if (!anchor) return null
  const out: number[] = []
  for (const [x, y] of pts) {
    const cx = col + x - anchor[0]
    const cy = row + y - anchor[1]
    if (cx < 0 || cx >= N || cy < 0 || cy >= N) return null
    out.push(cy * N + cx)
  }
  return out
}

// board[i]: player id, or -1 free.
const board = new Int8Array(N * N)
const DX4 = [1, -1, 0, 0]
const DY4 = [0, 0, 1, -1]
const DXD = [1, 1, -1, -1]
const DYD = [1, -1, 1, -1]
const at = (x: number, y: number) => (x < 0 || x >= N || y < 0 || y >= N ? -2 : board[y * N + x])

// Free cells where player p could start a new shape (corner contact only).
function corners(p: number): number {
  let n = 0
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (board[y * N + x] !== -1) continue
      let side = false
      for (let d = 0; d < 4; d++) if (at(x + DX4[d], y + DY4[d]) === p) side = true
      if (side) continue
      for (let d = 0; d < 4; d++) {
        if (at(x + DXD[d], y + DYD[d]) === p) {
          n++
          break
        }
      }
    }
  }
  return n
}

let turn = 0
while (true) {
  const rows: string[] = []
  for (let r = 0; r < N; r++) rows.push(readline())
  const played = parseInt(readline())
  for (let i = 0; i < played; i++) readline()
  const count = parseInt(readline())
  const moves: [number, number, string][] = []
  for (let i = 0; i < count; i++) {
    const [c, r, code] = readline().trim().split(" ")
    moves.push([parseInt(c), parseInt(r), code])
  }
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const ch = rows[y][x]
      board[y * N + x] = ch >= "0" && ch <= "3" ? parseInt(ch) : -1
    }
  }
  // Sanity check of the geometry against the referee's list.
  const legalMove = ([c, r, code]: [number, number, string]) =>
    (moveCells(c, r, code) ?? [-1]).every(i => i >= 0 && board[i] === -1)
  if (!moves.every(legalMove)) console.error("desync: a listed move does not fit the board")
  turn++
  let best = moves[0]
  let bestScore = -Infinity
  const centre = (N - 1) / 2
  for (const m of moves) {
    const cells = moveCells(m[0], m[1], m[2])
    if (!cells) continue
    for (const i of cells) board[i] = myId
    let s = cells.length * 10 + corners(myId)
    for (let p = 0; p < nPlayers; p++) if (p !== myId) s -= BLOCK * corners(p)
    if (turn <= 6) {
      // Reach for the centre early.
      let d = 0
      for (const i of cells) d += Math.abs((i % N) - centre) + Math.abs(Math.floor(i / N) - centre)
      s -= (d / cells.length) * 2
    }
    for (const i of cells) board[i] = -1
    if (s > bestScore) {
      bestScore = s
      best = m
    }
  }
  console.log(`${best[0]} ${best[1]} ${best[2]}`)
}
