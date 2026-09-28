// 🎮 CodinGame Multiplayer - chess
// https://www.codingame.com/multiplayer/bot-programming/chess
//
// Chess960, 2 games (one per colour), 50 ms per move. We ask for "fen moves":
// the root plays only the referee's legal UCI moves (castling = king onto its
// rook, as in 960); the search uses a pseudo-legal generator (no castling or
// en passant, queen promotions, king capture ends a line) with alpha-beta,
// capture quiescence and MVV-LVA ordering. Eval: material + piece-square.

const TURN_MS = 30
const VAL = [0, 100, 320, 330, 500, 900, 20000]
const PIECES = " PNBRQK"

// board[sq], sq = rank * 8 + file (a1 = 0). +type white, -type black.
const board = new Int8Array(64)
const KN = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
]
const KG = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, 1],
  [0, -1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
]
const DIAG = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]
const ORTH = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

// Moves packed: from | to << 6 | promo << 12.
function genMoves(side: number, capturesOnly: boolean, out: number[]) {
  out.length = 0
  for (let s = 0; s < 64; s++) {
    const p = board[s] * side
    if (p <= 0) continue
    const r = s >> 3
    const f = s & 7
    const push = (t: number) => {
      const tr = t >> 3
      if (p === 1 && (tr === 7 || tr === 0)) out.push(s | (t << 6) | (5 << 12))
      else out.push(s | (t << 6))
    }
    if (p === 1) {
      const dir = side
      const r1 = r + dir
      if (r1 < 0 || r1 > 7) continue
      if (!capturesOnly && board[r1 * 8 + f] === 0) {
        push(r1 * 8 + f)
        const start = side > 0 ? 1 : 6
        if (r === start && board[(r + 2 * dir) * 8 + f] === 0) push((r + 2 * dir) * 8 + f)
      }
      for (const df of [-1, 1]) {
        const ff = f + df
        if (ff < 0 || ff > 7) continue
        const t = r1 * 8 + ff
        if (board[t] * side < 0) push(t)
      }
      continue
    }
    const steps = p === 2 ? KN : p === 6 ? KG : null
    if (steps) {
      for (const [dr, df] of steps) {
        const rr = r + dr
        const ff = f + df
        if (rr < 0 || rr > 7 || ff < 0 || ff > 7) continue
        const t = rr * 8 + ff
        if (board[t] * side > 0) continue
        if (capturesOnly && board[t] === 0) continue
        out.push(s | (t << 6))
      }
      continue
    }
    const dirs = p === 3 ? DIAG : p === 4 ? ORTH : [...DIAG, ...ORTH]
    for (const [dr, df] of dirs) {
      let rr = r + dr
      let ff = f + df
      while (rr >= 0 && rr <= 7 && ff >= 0 && ff <= 7) {
        const t = rr * 8 + ff
        if (board[t] * side > 0) break
        if (board[t] !== 0 || !capturesOnly) out.push(s | (t << 6))
        if (board[t] !== 0) break
        rr += dr
        ff += df
      }
    }
  }
}

// Piece-square bonus (white's view; mirrored for black).
function pst(type: number, sq: number, side: number): number {
  const r = side > 0 ? sq >> 3 : 7 - (sq >> 3)
  const f = sq & 7
  const centre = 3.5 - Math.max(Math.abs(f - 3.5), Math.abs((sq >> 3) - 3.5))
  if (type === 1) return r * 8 + (f >= 2 && f <= 5 ? r * 2 : 0)
  if (type === 2 || type === 3) return centre * 10
  if (type === 5) return centre * 3
  if (type === 6) return r === 0 ? 10 : -r * 10
  return 0
}

function evaluate(side: number): number {
  let s = 0
  for (let i = 0; i < 64; i++) {
    const v = board[i]
    if (v === 0) continue
    const t = Math.abs(v)
    const sd = v > 0 ? 1 : -1
    s += sd * (VAL[t] + pst(t, i, sd))
  }
  return s * side
}

class Timeout extends Error {}
let deadline = 0
let nodes = 0
const MATE = 100000
const bufs: number[][] = Array.from({ length: 64 }, () => [])

function makeMove(m: number, side: number): number {
  const from = m & 63
  const to = (m >> 6) & 63
  const promo = m >> 12
  const captured = board[to]
  board[to] = promo ? promo * side : board[from]
  board[from] = 0
  return captured
}
function unmakeMove(m: number, side: number, captured: number) {
  const from = m & 63
  const to = (m >> 6) & 63
  const promo = m >> 12
  board[from] = promo ? side : board[to]
  board[to] = captured
}

function order(moves: number[]) {
  const score = (m: number) => {
    const c = board[(m >> 6) & 63]
    return c ? VAL[Math.abs(c)] * 10 - VAL[Math.abs(board[m & 63])] : 0
  }
  moves.sort((a, b) => score(b) - score(a))
}

function quiesce(side: number, alpha: number, beta: number, ply: number): number {
  if ((++nodes & 127) === 0 && Date.now() > deadline) throw new Timeout()
  const stand = evaluate(side)
  if (stand >= beta) return stand
  if (stand > alpha) alpha = stand
  if (ply > 40) return stand
  const moves = bufs[ply]
  genMoves(side, true, moves)
  order(moves)
  for (const m of moves.slice()) {
    const captured = makeMove(m, side)
    const v = Math.abs(captured) === 6 ? MATE - ply : -quiesce(-side, -beta, -alpha, ply + 1)
    unmakeMove(m, side, captured)
    if (v >= beta) return v
    if (v > alpha) alpha = v
  }
  return alpha
}

function negamax(side: number, depth: number, alpha: number, beta: number, ply: number): number {
  if (depth <= 0) return quiesce(side, alpha, beta, ply)
  if ((++nodes & 127) === 0 && Date.now() > deadline) throw new Timeout()
  const moves = bufs[ply]
  genMoves(side, false, moves)
  order(moves)
  let best = -Infinity
  for (const m of moves.slice()) {
    const captured = makeMove(m, side)
    const v = Math.abs(captured) === 6 ? MATE - ply : -negamax(-side, depth - 1, -beta, -alpha, ply + 1)
    unmakeMove(m, side, captured)
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best === -Infinity ? 0 : best
}

// Applies a referee UCI move (castling: king onto own rook; en passant).
function applyUci(uci: string, side: number): () => void {
  const sq = (s: string) => (parseInt(s[1]) - 1) * 8 + (s.charCodeAt(0) - 97)
  const from = sq(uci.slice(0, 2))
  const to = sq(uci.slice(2, 4))
  const saved = new Int8Array(board)
  const moving = board[from]
  if (Math.abs(moving) === 6 && board[to] === 4 * side) {
    // Castling: king to g/c file, rook to f/d file of the home rank.
    const rank = from >> 3
    const kingSide = (to & 7) > (from & 7)
    board[from] = 0
    board[to] = 0
    board[rank * 8 + (kingSide ? 6 : 2)] = 6 * side
    board[rank * 8 + (kingSide ? 5 : 3)] = 4 * side
  } else {
    if (Math.abs(moving) === 1 && (from & 7) !== (to & 7) && board[to] === 0) board[(from & ~7) | (to & 7)] = 0 // en passant
    const promo = uci.length > 4 ? PIECES.indexOf(uci[4].toUpperCase()) : 0
    board[to] = promo ? promo * side : moving
    board[from] = 0
  }
  return () => board.set(saved)
}

// --- Protocol -------------------------------------------------------------

const constants = parseInt(readline())
for (let i = 0; i < constants; i++) readline()
// Warm the JIT up during the 1 s constants turn (the first real move only
// gets 50 ms): search the classical start position for a while.
{
  const start = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  board.fill(0)
  start.split("/").forEach((row, k) => {
    let f = 0
    for (const ch of row) {
      if (ch >= "1" && ch <= "8") f += parseInt(ch)
      else {
        const tp = PIECES.indexOf(ch.toUpperCase())
        board[(7 - k) * 8 + f++] = ch === ch.toUpperCase() ? tp : -tp
      }
    }
  })
  deadline = Date.now() + 400
  try {
    for (let depth = 1; depth < 30; depth++) negamax(1, depth, -Infinity, Infinity, 0)
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
  }
}
console.log("fen moves")

while (true) {
  const fen = readline().trim().split(" ")
  const n = parseInt(readline())
  const legal: string[] = []
  for (let i = 0; i < n; i++) legal.push(readline().trim())
  deadline = Date.now() + TURN_MS
  board.fill(0)
  const rows = fen[0].split("/")
  for (let k = 0; k < 8; k++) {
    let f = 0
    for (const ch of rows[k]) {
      if (ch >= "1" && ch <= "8") {
        f += parseInt(ch)
        continue
      }
      const t = PIECES.indexOf(ch.toUpperCase())
      board[(7 - k) * 8 + f] = ch === ch.toUpperCase() ? t : -t
      f++
    }
  }
  const side = fen[1] === "w" ? 1 : -1
  let best = legal[0]
  let reached = 0
  nodes = 0
  try {
    let orderRoot = legal.slice()
    for (let depth = 1; depth <= 30; depth++) {
      let alpha = -Infinity
      let depthBest = orderRoot[0]
      for (const uci of orderRoot) {
        const undo = applyUci(uci, side)
        let v: number
        try {
          v = -negamax(-side, depth - 1, -Infinity, -alpha, 1)
        } finally {
          undo()
        }
        if (v > alpha) {
          alpha = v
          depthBest = uci
        }
      }
      best = depthBest
      reached = depth
      orderRoot = [depthBest, ...orderRoot.filter(m => m !== depthBest)]
      if (Math.abs(alpha) > MATE / 2) break
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  console.log(best)
}
