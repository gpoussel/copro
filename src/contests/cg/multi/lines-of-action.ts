// 🎮 CodinGame Multiplayer - lines-of-action
// https://www.codingame.com/multiplayer/bot-programming/lines-of-action
//
// 8x8, connect all your pieces (8-neighbourhood). A piece moves exactly as
// many squares as there are pieces on its line, may jump its own pieces but
// not enemy ones, and captures by landing. Negamax alpha-beta; eval = group
// count + concentration around the centre of mass.

const FIRST_TURN_MS = 800
const TURN_MS = 120

// board[r * 8 + c], r = 0 top line (rank 8). 1 = us, -1 = them.
const board = new Int8Array(64)
const DR = [-1, -1, -1, 0, 0, 1, 1, 1]
const DC = [-1, 0, 1, -1, 1, -1, 0, 1]

function lineCount(b: Int8Array, r: number, c: number, dr: number, dc: number): number {
  let n = 1
  for (let rr = r + dr, cc = c + dc; rr >= 0 && rr < 8 && cc >= 0 && cc < 8; rr += dr, cc += dc) if (b[rr * 8 + cc]) n++
  for (let rr = r - dr, cc = c - dc; rr >= 0 && rr < 8 && cc >= 0 && cc < 8; rr -= dr, cc -= dc) if (b[rr * 8 + cc]) n++
  return n
}

// Moves packed as from * 64 + to.
function genMoves(b: Int8Array, side: number, out: number[]) {
  out.length = 0
  for (let i = 0; i < 64; i++) {
    if (b[i] !== side) continue
    const r = i >> 3
    const c = i & 7
    for (let d = 0; d < 8; d++) {
      const n = lineCount(b, r, c, DR[d], DC[d])
      const tr = r + DR[d] * n
      const tc = c + DC[d] * n
      if (tr < 0 || tr > 7 || tc < 0 || tc > 7) continue
      const t = tr * 8 + tc
      if (b[t] === side) continue
      let blocked = false
      for (let k = 1; k < n; k++) if (b[(r + DR[d] * k) * 8 + c + DC[d] * k] === -side) blocked = true
      if (!blocked) out.push(i * 64 + t)
    }
  }
}

const stack = new Int8Array(64)
const seen = new Uint8Array(64)
function groups(b: Int8Array, side: number): number {
  seen.fill(0)
  let g = 0
  for (let i = 0; i < 64; i++) {
    if (b[i] !== side || seen[i]) continue
    g++
    let top = 0
    stack[top++] = i
    seen[i] = 1
    while (top > 0) {
      const j = stack[--top]
      const r = j >> 3
      const c = j & 7
      for (let d = 0; d < 8; d++) {
        const rr = r + DR[d]
        const cc = c + DC[d]
        if (rr < 0 || rr > 7 || cc < 0 || cc > 7) continue
        const k = rr * 8 + cc
        if (b[k] === side && !seen[k]) {
          seen[k] = 1
          stack[top++] = k
        }
      }
    }
  }
  return g
}

function concentration(b: Int8Array, side: number): number {
  let n = 0
  let sr = 0
  let sc = 0
  for (let i = 0; i < 64; i++) {
    if (b[i] === side) {
      n++
      sr += i >> 3
      sc += i & 7
    }
  }
  if (n === 0) return 0
  const cr = sr / n
  const cc = sc / n
  let sum = 0
  for (let i = 0; i < 64; i++) if (b[i] === side) sum += Math.max(Math.abs((i >> 3) - cr), Math.abs((i & 7) - cc))
  return sum / n
}

// Centre squares are worth more (the usual LOA piece-square table).
const CENTRE = new Int8Array(64)
for (let i = 0; i < 64; i++) {
  const d = Math.max(Math.abs((i >> 3) - 3.5), Math.abs((i & 7) - 3.5))
  CENTRE[i] = Math.round((3.5 - d) * 4)
}
function evaluate(b: Int8Array): number {
  let centre = 0
  for (let i = 0; i < 64; i++) centre += b[i] * CENTRE[i]
  return 20 * (groups(b, -1) - groups(b, 1)) + 40 * (concentration(b, -1) - concentration(b, 1)) + centre
}

class Timeout extends Error {}
let deadline = 0
let nodes = 0
const WIN = 100000
const bufs: number[][] = Array.from({ length: 64 }, () => [])

// Value after `mover` played: connected mover wins (even if both are). The
// opponent can only become connected through a capture of one of its pieces.
function terminal(b: Int8Array, mover: number, captured: number): number {
  if (groups(b, mover) === 1) return 1
  if (captured !== 0 && groups(b, -mover) === 1) return -1
  return 0
}

function negamax(b: Int8Array, side: number, depth: number, alpha: number, beta: number, ply: number): number {
  if ((++nodes & 255) === 0 && Date.now() > deadline) throw new Timeout()
  if (depth === 0) return side * evaluate(b)
  const moves = bufs[ply]
  genMoves(b, side, moves)
  if (moves.length === 0) return -negamax(b, -side, depth - 1, -beta, -alpha, ply + 1)
  const key = (m: number) => (b[m & 63] !== 0 ? 100 : 0) + CENTRE[m & 63] - CENTRE[m >> 6]
  const ordered = moves.slice().sort((x, y) => key(y) - key(x))
  let best = -Infinity
  for (const m of ordered) {
    const from = m >> 6
    const to = m & 63
    const captured = b[to]
    b[to] = side
    b[from] = 0
    const t = terminal(b, side, captured)
    const v = t !== 0 ? t * (WIN - ply) : -negamax(b, -side, depth - 1, -beta, -alpha, ply + 1)
    b[from] = side
    b[to] = captured
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best
}

function think(legal: number[]): number {
  let bestIndex = 0
  let order = legal.map((_, k) => k)
  let reached = 0
  nodes = 0
  try {
    for (let depth = 1; depth <= 20; depth++) {
      let alpha = -Infinity
      let depthBest = order[0]
      for (const k of order) {
        const from = legal[k] >> 6
        const to = legal[k] & 63
        const captured = board[to]
        board[to] = 1
        board[from] = 0
        const t = terminal(board, 1, captured)
        const v = t !== 0 ? t * WIN : -negamax(board, -1, depth - 1, -Infinity, -alpha, 1)
        board[from] = 1
        board[to] = captured
        if (v > alpha) {
          alpha = v
          depthBest = k
        }
      }
      bestIndex = depthBest
      reached = depth
      order = [depthBest, ...order.filter(k => k !== depthBest)]
      if (Math.abs(alpha) > WIN / 2) break
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  return bestIndex
}

// --- Game loop ----------------------------------------------------------------

const myColor = readline().trim()
let firstTurn = true
// "e2": file letter, rank from the bottom; the first input line is rank 8.
const parseSq = (s: string) => (8 - parseInt(s[1])) * 8 + s.charCodeAt(0) - 97

while (true) {
  const rows: string[] = []
  for (let r = 0; r < 8; r++) rows.push(readline())
  const deadline0 = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  readline() // last move
  const n = parseInt(readline())
  const moves: string[] = []
  for (let i = 0; i < n; i++) moves.push(readline().trim())
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const ch = rows[r][c]
      board[r * 8 + c] = ch === "." ? 0 : ch === myColor ? 1 : -1
    }
  }
  deadline = deadline0
  if (n === 0) {
    console.log("pass")
    continue
  }
  const legal = moves.map(s => parseSq(s.slice(0, 2)) * 64 + parseSq(s.slice(2, 4)))
  const engine: number[] = []
  genMoves(board, 1, engine)
  const set = new Set(engine)
  if (engine.length !== n || !legal.every(m => set.has(m))) console.error("desync: move lists differ")
  console.log(moves[n === 1 ? 0 : think(legal)])
}
