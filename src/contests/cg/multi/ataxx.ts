// 🎮 CodinGame Multiplayer - ataxx
// https://www.codingame.com/multiplayer/bot-programming/ataxx
//
// 7x7 with walls. Spawn (clone to an adjacent empty square) or jump (move two
// squares away); the adjacent enemy pieces then turn to the mover's colour.
// Negamax alpha-beta with iterative deepening, eval = piece difference.

const FIRST_TURN_MS = 800
const TURN_MS = 80
const W = 11 // mailbox width: 7 + 2 border squares on each side
const WALL = 3
const EMPTY = 0
const NEAR = [-12, -11, -10, -1, 1, 10, 11, 12]
const FAR = [-24, -23, -22, -21, -20, -13, -9, -2, 2, 9, 13, 20, 21, 22, 23, 24]
const SPAWN = 0 // "from" of a spawn move

const board = new Int8Array(W * W)
const sq = (r: number, c: number) => (r + 2) * W + c + 2
const sqName = (s: number) => String.fromCharCode(97 + (s % W) - 2) + String(Math.floor(s / W) - 1)

// Moves packed as from * 128 + to (from = 0 for a spawn).
function genMoves(b: Int8Array, me: number, out: Int32Array): number {
  let n = 0
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const t = sq(r, c)
      if (b[t] !== EMPTY) continue
      let spawn = false
      for (const d of NEAR) if (b[t + d] === me) spawn = true
      if (spawn) out[n++] = SPAWN * 128 + t
      for (const d of FAR) if (b[t + d] === me) out[n++] = (t + d) * 128 + t
    }
  }
  return n
}

// Applies m; returns a bit list of converted squares for undo (on the stack).
// Pieces per player (index 1 / 2), kept up to date by play/undo.
const pieces = [0, 0, 0]
const undoStack = new Int32Array(4096)
let undoTop = 0
function play(b: Int8Array, m: number, me: number): number {
  const from = m >> 7
  const to = m & 127
  const opp = 3 - me
  if (from !== SPAWN) b[from] = EMPTY
  else pieces[me]++
  b[to] = me
  let n = 0
  for (const d of NEAR) {
    if (b[to + d] === opp) {
      b[to + d] = me
      undoStack[undoTop++] = to + d
      n++
    }
  }
  pieces[me] += n
  pieces[opp] -= n
  return n
}
function undo(b: Int8Array, m: number, me: number, n: number) {
  const from = m >> 7
  const to = m & 127
  for (let k = 0; k < n; k++) b[undoStack[--undoTop]] = 3 - me
  pieces[me] -= n
  pieces[3 - me] += n
  b[to] = EMPTY
  if (from !== SPAWN) b[from] = me
  else pieces[me]--
}

class Timeout extends Error {}
let deadline = 0
let nodes = 0
const WIN = 100000
const bufs: Int32Array[] = Array.from({ length: 64 }, () => new Int32Array(512))

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
  const diff = pieces[me] - pieces[3 - me]
  if (pieces[3 - me] === 0) return WIN + diff
  if (depth === 0) return diff
  const moves = bufs[ply]
  const n = genMoves(b, me, moves)
  if (n === 0) {
    if (passed || ply > 60) return diff > 0 ? WIN + diff : diff < 0 ? -WIN + diff : 0
    return -negamax(b, 3 - me, depth, -beta, -alpha, true, ply + 1)
  }
  // Spawns first (they never lose material), then jumps.
  let best = -Infinity
  for (let pass = 0; pass < 2; pass++) {
    for (let k = 0; k < n; k++) {
      const m = moves[k]
      if ((m >> 7 === SPAWN) !== (pass === 0)) continue
      const flips = play(b, m, me)
      const v = -negamax(b, 3 - me, depth - 1, -beta, -alpha, false, ply + 1)
      undo(b, m, me, flips)
      if (v > best) best = v
      if (v > alpha) alpha = v
      if (alpha >= beta) return best
    }
  }
  return best
}

function think(me: number, legal: number[]): number {
  let bestMove = legal[0]
  let order = [...legal].sort((x, y) => (x >> 7 === SPAWN ? 0 : 1) - (y >> 7 === SPAWN ? 0 : 1))
  let reached = 0
  nodes = 0
  const work = new Int8Array(board)
  pieces[1] = pieces[2] = 0
  for (const v of work) if (v === 1 || v === 2) pieces[v]++
  try {
    for (let depth = 1; depth <= 30; depth++) {
      let alpha = -Infinity
      let depthBest = order[0]
      for (const m of order) {
        const flips = play(work, m, me)
        const v = -negamax(work, 3 - me, depth - 1, -Infinity, -alpha, false, 1)
        undo(work, m, me, flips)
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
    undoTop = 0
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  return bestMove
}

// --- Game loop ----------------------------------------------------------------

const myId = parseInt(readline())
const me = myId + 1
let firstTurn = true
const parse = (s: string) => sq(s.charCodeAt(1) - 49, s.charCodeAt(0) - 97)
const engine = new Int32Array(512)
let flipRows = false

while (true) {
  const rows: string[] = []
  for (let r = 0; r < 7; r++) rows.push(readline()) // bottom row first
  const deadline0 = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  readline() // last action
  const n = parseInt(readline())
  const actions: string[] = []
  for (let i = 0; i < n; i++) actions.push(readline().trim())

  // The statement says bottom row first; check it against the legal moves
  // (a mirrored board has the same move count, so compare the moves).
  const load = (flip: boolean) => {
    board.fill(WALL)
    for (let r = 0; r < 7; r++) {
      const row = rows[flip ? 6 - r : r]
      for (let c = 0; c < 7; c++) {
        const ch = row[c]
        board[sq(r, c)] = ch === "." ? EMPTY : ch === "#" ? WALL : ch === "0" ? 1 : 2
      }
    }
  }
  deadline = deadline0
  // Actions: "b7" spawn or "a7c7" jump.
  const legal = actions.map(a =>
    a.length === 2 ? SPAWN * 128 + parse(a) : parse(a.slice(0, 2)) * 128 + parse(a.slice(2, 4))
  )
  if (legal.length === 0) {
    console.log("random")
    continue
  }
  const consistent = () => {
    const k = genMoves(board, me, engine)
    const set = new Set(engine.subarray(0, k))
    return legal.every(m => set.has(m))
  }
  load(flipRows)
  if (!consistent()) {
    flipRows = !flipRows
    load(flipRows)
    console.error(`rows flipped: ${flipRows} consistent=${consistent()}`)
  }
  const m = think(me, legal)
  const from = m >> 7
  console.log(from === SPAWN ? sqName(m & 127) : sqName(from) + sqName(m & 127))
}
