// 🎮 CodinGame Multiplayer - breakthrough
// https://www.codingame.com/multiplayer/bot-programming/breakthrough
//
// 8x8, pawns move one step forward (straight to an empty square, diagonally
// to an empty or enemy square); reaching the last rank or taking every enemy
// pawn wins. The board is tracked from the moves. Negamax alpha-beta with
// iterative deepening; eval = material + advancement.

const FIRST_TURN_MS = 800
const TURN_MS = 80

// board[rank * 8 + file], rank 0 = "1". 1 = white (moves up), 2 = black.
const board = new Int8Array(64)
for (let f = 0; f < 8; f++) {
  board[f] = board[8 + f] = 1
  board[48 + f] = board[56 + f] = 2
}

const parseSq = (s: string) => (s.charCodeAt(1) - 49) * 8 + (s.charCodeAt(0) - 97)
const sqName = (i: number) => String.fromCharCode(97 + (i & 7)) + String.fromCharCode(49 + (i >> 3))

// Moves packed as from * 64 + to.
function genMoves(b: Int8Array, side: number, out: Int16Array): number {
  const dir = side === 1 ? 8 : -8
  let n = 0
  for (let i = 0; i < 64; i++) {
    if (b[i] !== side) continue
    const t = i + dir
    if (t < 0 || t >= 64) continue
    const f = i & 7
    if (b[t] === 0) out[n++] = i * 64 + t
    if (f > 0 && b[t - 1] !== side) out[n++] = i * 64 + t - 1
    if (f < 7 && b[t + 1] !== side) out[n++] = i * 64 + t + 1
  }
  return n
}

class Timeout extends Error {}
let deadline = 0
let nodes = 0
const WIN = 100000
const moveBufs: Int16Array[] = Array.from({ length: 64 }, () => new Int16Array(64))

// Static eval for `side`: material, advancement, and pawns about to promote.
function evaluate(b: Int8Array, side: number): number {
  let score = 0
  for (let i = 0; i < 64; i++) {
    const p = b[i]
    if (p === 0) continue
    const adv = p === 1 ? i >> 3 : 7 - (i >> 3)
    const v = 100 + adv * adv * 3 + (adv === 6 ? 200 : 0)
    score += p === side ? v : -v
  }
  return score
}

function negamax(b: Int8Array, side: number, depth: number, alpha: number, beta: number, ply: number): number {
  if ((++nodes & 1023) === 0 && Date.now() > deadline) throw new Timeout()
  const moves = moveBufs[ply]
  const n = genMoves(b, side, moves)
  if (n === 0) return -WIN + ply // no pawn left (or blocked): lost
  // A pawn one step from the goal with a free square wins now.
  const goal = side === 1 ? 7 : 0
  for (let k = 0; k < n; k++) if ((moves[k] & 63) >> 3 === goal) return WIN - ply
  if (depth === 0) return evaluate(b, side)
  // Captures first.
  const order = Array.from(moves.subarray(0, n)).sort((x, y) => (b[y & 63] !== 0 ? 1 : 0) - (b[x & 63] !== 0 ? 1 : 0))
  let best = -Infinity
  const opp = 3 - side
  for (const m of order) {
    const from = m >> 6
    const to = m & 63
    const captured = b[to]
    b[to] = side
    b[from] = 0
    const v = -negamax(b, opp, depth - 1, -beta, -alpha, ply + 1)
    b[from] = side
    b[to] = captured
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best
}

function think(side: number, legal: number[]): number {
  const goal = side === 1 ? 7 : 0
  const winning = legal.find(m => (m & 63) >> 3 === goal)
  if (winning !== undefined) return winning
  let bestMove = legal[0]
  let order = legal
  let reached = 0
  nodes = 0
  const work = new Int8Array(board)
  try {
    for (let depth = 1; depth <= 40; depth++) {
      let alpha = -Infinity
      let depthBest = order[0]
      for (const m of order) {
        const from = m >> 6
        const to = m & 63
        const captured = work[to]
        work[to] = side
        work[from] = 0
        const v = -negamax(work, 3 - side, depth - 1, -Infinity, -alpha, 1)
        work[from] = side
        work[to] = captured
        if (v > alpha) {
          alpha = v
          depthBest = m
        }
      }
      bestMove = depthBest
      reached = depth
      order = [depthBest, ...order.filter(m => m !== depthBest)]
      if (Math.abs(alpha) > WIN / 2) break
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  return bestMove
}

// --- Game loop ----------------------------------------------------------------

let side = 0
let firstTurn = true
const engine = new Int16Array(64)

while (true) {
  const oppMove = readline().trim()
  deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  if (firstTurn) side = oppMove === "None" ? 1 : 2
  firstTurn = false
  if (oppMove !== "None") {
    const from = parseSq(oppMove.slice(0, 2))
    const to = parseSq(oppMove.slice(2, 4))
    board[to] = board[from]
    board[from] = 0
  }
  const count = parseInt(readline())
  const legal: number[] = []
  for (let i = 0; i < count; i++) {
    const s = readline().trim()
    legal.push(parseSq(s.slice(0, 2)) * 64 + parseSq(s.slice(2, 4)))
  }
  if (genMoves(board, side, engine) !== count) console.error("desync: move count")

  const m = think(side, legal)
  board[m & 63] = side
  board[m >> 6] = 0
  console.log(sqName(m >> 6) + sqName(m & 63))
}
