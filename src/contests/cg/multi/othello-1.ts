// 🎮 CodinGame Multiplayer - othello-1
// https://www.codingame.com/multiplayer/bot-programming/othello-1
//
// Negamax alpha-beta with iterative deepening on a 10x10 mailbox board.
// Evaluation: classic square weights + mobility, exact disc count once the
// game is over. Legal moves come from the referee; the engine recomputes them
// for the search (a mismatch is logged).

const FIRST_TURN_MS = 1500
const TURN_MS = 120
const EMPTY = 0
const BORDER = 3
const DIRS = [-11, -10, -9, -1, 1, 9, 10, 11]

// Square weights (row-major 8x8), a standard table.
const WEIGHTS8 = [
  100, -20, 10, 5, 5, 10, -20, 100, -20, -50, -2, -2, -2, -2, -50, -20, 10, -2, 1, 1, 1, 1, -2, 10, 5, -2, 1, 0, 0, 1,
  -2, 5, 5, -2, 1, 0, 0, 1, -2, 5, 10, -2, 1, 1, 1, 1, -2, 10, -20, -50, -2, -2, -2, -2, -50, -20, 100, -20, 10, 5, 5,
  10, -20, 100,
]
const WEIGHTS = new Int16Array(100)
for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) WEIGHTS[(r + 1) * 10 + c + 1] = WEIGHTS8[r * 8 + c]

// cells: 1 = player 0 (black), 2 = player 1 (white), 0 empty, 3 border.
const board = new Int8Array(100)
const sq = (r: number, c: number) => (r + 1) * 10 + c + 1

function flipsIn(b: Int8Array, s: number, me: number, dir: number): number {
  const opp = 3 - me
  let t = s + dir
  let n = 0
  while (b[t] === opp) {
    t += dir
    n++
  }
  return n > 0 && b[t] === me ? n : 0
}

function isLegal(b: Int8Array, s: number, me: number): boolean {
  if (b[s] !== EMPTY) return false
  for (const d of DIRS) if (flipsIn(b, s, me, d)) return true
  return false
}

function genMoves(b: Int8Array, me: number, out: Int8Array): number {
  let n = 0
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const s = sq(r, c)
      if (isLegal(b, s, me)) out[n++] = s
    }
  }
  return n
}

// Plays s for me; the flipped squares are pushed on undo (returns their count).
const undoStack = new Int8Array(64 * 64)
let undoTop = 0
function play(b: Int8Array, s: number, me: number): number {
  let flipped = 0
  for (const d of DIRS) {
    const n = flipsIn(b, s, me, d)
    for (let k = 1; k <= n; k++) {
      b[s + d * k] = me
      undoStack[undoTop++] = s + d * k
    }
    flipped += n
  }
  b[s] = me
  return flipped
}
function undo(b: Int8Array, s: number, me: number, flipped: number) {
  const opp = 3 - me
  for (let k = 0; k < flipped; k++) b[undoStack[--undoTop]] = opp
  b[s] = EMPTY
}

// --- Search -----------------------------------------------------------------

class Timeout extends Error {}
let deadline = 0
let nodes = 0
const moveBuf: Int8Array[] = Array.from({ length: 64 }, () => new Int8Array(32))

function evaluate(b: Int8Array, me: number): number {
  const opp = 3 - me
  let score = 0
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const s = sq(r, c)
      if (b[s] === me) score += WEIGHTS[s]
      else if (b[s] === opp) score -= WEIGHTS[s]
    }
  }
  const myMob = genMoves(b, me, moveBuf[63])
  const oppMob = genMoves(b, opp, moveBuf[63])
  return score + 8 * (myMob - oppMob)
}

function discDiff(b: Int8Array, me: number): number {
  let d = 0
  for (let s = 11; s < 89; s++) {
    if (b[s] === me) d++
    else if (b[s] === 3 - me) d--
  }
  return d
}

function negamax(
  b: Int8Array,
  me: number,
  depth: number,
  alpha: number,
  beta: number,
  passed: boolean,
  ply: number
): number {
  if ((++nodes & 1023) === 0 && Date.now() > deadline) throw new Timeout()
  const moves = moveBuf[ply]
  const n = genMoves(b, me, moves)
  if (n === 0) {
    if (passed) return discDiff(b, me) * 10000 // game over: exact result
    return -negamax(b, 3 - me, depth, -beta, -alpha, true, ply + 1)
  }
  if (depth === 0) return evaluate(b, me)
  // Order moves by square weight (corners first).
  const order = Array.from(moves.subarray(0, n)).sort((x, y) => WEIGHTS[y] - WEIGHTS[x])
  let best = -Infinity
  for (const s of order) {
    const flipped = play(b, s, me)
    const v = -negamax(b, 3 - me, depth - 1, -beta, -alpha, false, ply + 1)
    undo(b, s, me, flipped)
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best
}

function think(me: number, legal: number[]): number {
  let bestMove = legal[0]
  let reached = 0
  nodes = 0
  let order = [...legal].sort((x, y) => WEIGHTS[y] - WEIGHTS[x])
  try {
    for (let depth = 1; depth <= 64; depth++) {
      let alpha = -Infinity
      let depthBest = order[0]
      for (const s of order) {
        const flipped = play(board, s, me)
        const v = -negamax(board, 3 - me, depth - 1, -Infinity, -alpha, false, 1)
        undo(board, s, me, flipped)
        if (v > alpha) {
          alpha = v
          depthBest = s
        }
      }
      bestMove = depthBest
      reached = depth
      order = [depthBest, ...order.filter(s => s !== depthBest)]
      if (Math.abs(alpha) >= 10000) break // solved
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
    undoTop = 0
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  return bestMove
}

// --- Game loop ----------------------------------------------------------------

const myId = parseInt(readline())
const size = parseInt(readline())
const me = myId + 1
let firstTurn = true
const engineMoves = new Int8Array(32)

while (true) {
  const rows: string[] = []
  for (let r = 0; r < size; r++) rows.push(readline())
  deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  const count = parseInt(readline())
  const actions: string[] = []
  for (let i = 0; i < count; i++) actions.push(readline())

  board.fill(BORDER)
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const ch = rows[r][c]
      board[sq(r, c)] = ch === "0" ? 1 : ch === "1" ? 2 : EMPTY
    }
  }
  // "d3" = column d, row 3 from the top.
  const toSq = (a: string) => sq(parseInt(a.slice(1)) - 1, a.charCodeAt(0) - 97)
  const legal = actions.map(toSq)
  if (genMoves(board, me, engineMoves) !== count) console.error("desync: move count")

  const s = think(me, legal)
  console.log(actions[legal.indexOf(s)])
}
