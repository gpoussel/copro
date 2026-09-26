// 🎮 CodinGame Multiplayer - checkers
// https://www.codingame.com/multiplayer/bot-programming/checkers
//
// 8x8 checkers: men move/jump diagonally forward, kings both ways (one step),
// captures are mandatory and chain. The statement leaves the rank numbering
// and the direction of play implicit, so on the first turn the bot picks the
// orientation whose generated moves match the referee's list exactly.
// Negamax alpha-beta with iterative deepening; eval = material + advance.

const TURN_MS = 80
const FIRST_TURN_MS = 800

// board[r * 8 + c], r = input line. +1 / +2 our man / king, -1 / -2 theirs.
const board = new Int8Array(64)
let myForward = -1 // row delta of our men (theirs is the opposite)
let topIsEight = true // does the first input line hold rank 8?

const sqName = (i: number) => String.fromCharCode(65 + (i & 7)) + String(topIsEight ? 8 - (i >> 3) : (i >> 3) + 1)

// Moves are squares lists: [from, (landing)...]; jumps capture the midpoints.
type Move = number[]

function genMoves(b: Int8Array, side: number): Move[] {
  const fwd = side > 0 ? myForward : -myForward
  const jumps: Move[] = []
  const steps: Move[] = []
  for (let i = 0; i < 64; i++) {
    const p = b[i] * side
    if (p <= 0) continue
    const king = p === 2
    const dirs = king ? [-1, 1] : [fwd]
    // Jump chains (a man reaching the far row stops there).
    const chain = (at: number, path: Move, taken: Set<number>) => {
      let extended = false
      const r = at >> 3
      const c = at & 7
      const lastRow = fwd > 0 ? 7 : 0
      if (!king && path.length > 1 && r === lastRow) {
        jumps.push(path)
        return
      }
      for (const dr of dirs) {
        for (const dc of [-1, 1]) {
          const mr = r + dr
          const mc = c + dc
          const tr = r + 2 * dr
          const tc = c + 2 * dc
          if (tr < 0 || tr > 7 || tc < 0 || tc > 7) continue
          const mid = mr * 8 + mc
          const to = tr * 8 + tc
          if (b[mid] * side >= 0 || taken.has(mid)) continue
          if (b[to] !== 0 && to !== path[0]) continue
          extended = true
          chain(to, [...path, to], new Set(taken).add(mid))
        }
      }
      if (!extended && path.length > 1) jumps.push(path)
    }
    chain(i, [i], new Set())
    if (jumps.length) continue
    for (const dr of dirs) {
      for (const dc of [-1, 1]) {
        const tr = (i >> 3) + dr
        const tc = (i & 7) + dc
        if (tr < 0 || tr > 7 || tc < 0 || tc > 7) continue
        if (b[tr * 8 + tc] === 0) steps.push([i, tr * 8 + tc])
      }
    }
  }
  return jumps.length ? jumps : steps
}

// Applies m for side; returns the undo record [square, previous value]...
function apply(b: Int8Array, m: Move, side: number): number[] {
  const undo: number[] = []
  const from = m[0]
  const to = m[m.length - 1]
  const piece = b[from]
  undo.push(from, piece)
  b[from] = 0
  for (let k = 1; k < m.length; k++) {
    const a = m[k - 1]
    const z = m[k]
    if (Math.abs((a >> 3) - (z >> 3)) === 2) {
      const mid = (a + z) >> 1
      undo.push(mid, b[mid])
      b[mid] = 0
    }
  }
  const fwd = side > 0 ? myForward : -myForward
  const lastRow = fwd > 0 ? 7 : 0
  undo.push(to, b[to])
  b[to] = to >> 3 === lastRow ? 2 * side : piece
  return undo
}
function revert(b: Int8Array, undo: number[]) {
  for (let k = undo.length - 2; k >= 0; k -= 2) b[undo[k]] = undo[k + 1]
}

function evaluate(b: Int8Array): number {
  let s = 0
  for (let i = 0; i < 64; i++) {
    const p = b[i]
    if (p === 0) continue
    const side = p > 0 ? 1 : -1
    const fwd = side > 0 ? myForward : -myForward
    const r = i >> 3
    const advance = fwd > 0 ? r : 7 - r
    s += side * (Math.abs(p) === 2 ? 160 : 100 + advance * 3)
  }
  return s
}

class Timeout extends Error {}
let deadline = 0
let nodes = 0
const WIN = 100000

function negamax(b: Int8Array, side: number, depth: number, alpha: number, beta: number, ply: number): number {
  if ((++nodes & 255) === 0 && Date.now() > deadline) throw new Timeout()
  const moves = genMoves(b, side)
  if (moves.length === 0) return -WIN + ply
  if (depth <= 0 && moves[0].length === 2) return side * evaluate(b) // quiet
  if (ply > 40) return side * evaluate(b)
  let best = -Infinity
  for (const m of moves) {
    const u = apply(b, m, side)
    const v = -negamax(b, -side, depth - 1, -beta, -alpha, ply + 1)
    revert(b, u)
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best
}

function think(legal: Move[]): number {
  let bestIndex = 0
  let order = legal.map((_, k) => k)
  let reached = 0
  nodes = 0
  try {
    for (let depth = 1; depth <= 30; depth++) {
      let alpha = -Infinity
      let depthBest = order[0]
      for (const k of order) {
        const u = apply(board, legal[k], 1)
        const v = -negamax(board, -1, depth - 1, -Infinity, -alpha, 1)
        revert(board, u)
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

// The statement says "r" or "b" but the referee may send "w": the colour is
// re-derived on the first turn from the piece on a legal move's start square.
let myColor = readline().trim().toLowerCase()
let firstTurn = true

while (true) {
  const rows: string[] = []
  for (let r = 0; r < 8; r++) rows.push(readline())
  deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  const count = parseInt(readline())
  const moves: string[] = []
  for (let i = 0; i < count; i++) moves.push(readline().trim())
  if (firstTurn && moves.length) {
    // Both rank numberings put the start square on one of two rows.
    const c = moves[0].charCodeAt(0) - 65
    const n = parseInt(moves[0][1])
    for (const r of [8 - n, n - 1]) {
      const ch = rows[r][c].toLowerCase()
      if (ch === "r" || ch === "b") {
        myColor = ch
        break
      }
    }
  }
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const ch = rows[r][c]
      const lower = ch.toLowerCase()
      const v = ch === "." ? 0 : ch === lower ? 1 : 2
      board[r * 8 + c] = lower === myColor ? v : -v
    }
  }
  const parseMove = (s: string): Move => {
    const out: Move = []
    for (let k = 0; k + 1 < s.length; k += 2) {
      const c = s.charCodeAt(k) - 65
      const n = parseInt(s[k + 1])
      out.push((topIsEight ? 8 - n : n - 1) * 8 + c)
    }
    return out
  }
  if (firstTurn) {
    // Pick the orientation that reproduces the referee's moves.
    const want = new Set(moves)
    let found = false
    for (const top of [true, false]) {
      for (const fwd of [-1, 1]) {
        topIsEight = top
        myForward = fwd
        const mine = genMoves(board, 1).map(m => m.map(sqName).join(""))
        if (mine.length === want.size && mine.every(s => want.has(s))) found = true
        if (found) break
      }
      if (found) break
    }
    console.error(`orientation topIsEight=${topIsEight} forward=${myForward} found=${found}`)
    if (!found) console.error(`color=${JSON.stringify(myColor)} referee: ${moves.join(" ")}`)
  }
  firstTurn = false
  const legal = moves.map(parseMove)
  const mine = new Set(genMoves(board, 1).map(m => m.map(sqName).join("")))
  if (!moves.every(s => mine.has(s))) console.error("desync: referee move unknown to the engine")
  const k = legal.length === 1 ? 0 : think(legal)
  console.log(moves[k])
}
