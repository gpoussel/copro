// 🎮 CodinGame Multiplayer - mad-knights
// https://www.codingame.com/multiplayer/bot-programming/mad-knights
//
// Knight isolation for 3 (red, green, blue in turn): squares a knight has
// stood on are closed; a knight without a free knight move is out, the last
// one standing wins. Paranoid alpha-beta (both opponents minimise our value)
// with iterative deepening; eval = our mobility vs theirs.

const TURN_MS = 80
const FIRST_TURN_MS = 800
const JUMPS = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
]
const COLORS = ["r", "g", "b"]
const myColor = readline().trim()
const me = COLORS.indexOf(myColor)

// closed[i]: square unavailable (visited or occupied). pos[p]: knight square.
const closed = new Uint8Array(64)
const pos = [0, 0, 0]
const alive = [true, true, true]
const sqName = (i: number) => String.fromCharCode(97 + (i & 7)) + String(8 - (i >> 3))
const sq = (s: string) => (8 - parseInt(s[1])) * 8 + s.charCodeAt(0) - 97

function moves(p: number, out: number[]) {
  out.length = 0
  const r = pos[p] >> 3
  const c = pos[p] & 7
  for (const [dr, dc] of JUMPS) {
    const rr = r + dr
    const cc = c + dc
    if (rr < 0 || rr > 7 || cc < 0 || cc > 7) continue
    const t = rr * 8 + cc
    if (!closed[t]) out.push(t)
  }
}

const buf: number[] = []
function mobility(p: number): number {
  moves(p, buf)
  return buf.length
}

function evaluate(): number {
  if (!alive[me]) return -100000
  let s = 10 * mobility(me)
  let rivals = 0
  for (let p = 0; p < 3; p++) {
    if (p === me || !alive[p]) continue
    rivals++
    s -= 6 * mobility(p)
  }
  if (rivals === 0) return 100000
  return s
}

class Timeout extends Error {}
let deadline = 0
let nodes = 0
const bufs: number[][] = Array.from({ length: 64 }, () => [])

function nextPlayer(p: number): number {
  for (let k = 1; k <= 3; k++) if (alive[(p + k) % 3]) return (p + k) % 3
  return p
}

// Paranoid search: value for us, `p` to move.
function search(p: number, depth: number, alpha: number, beta: number, ply: number): number {
  if ((++nodes & 511) === 0 && Date.now() > deadline) throw new Timeout()
  const living = alive.filter(a => a).length
  if (!alive[me] || living === 1 || depth === 0) return evaluate()
  const list = bufs[ply]
  moves(p, list)
  if (list.length === 0) {
    alive[p] = false
    const v = search(nextPlayer(p), depth, alpha, beta, ply + 1)
    alive[p] = true
    return v
  }
  const maximise = p === me
  let best = maximise ? -Infinity : Infinity
  const from = pos[p]
  for (const t of list.slice()) {
    closed[t] = 1
    pos[p] = t
    const v = search(nextPlayer(p), depth - 1, alpha, beta, ply + 1)
    pos[p] = from
    closed[t] = 0
    if (maximise) {
      if (v > best) best = v
      if (v > alpha) alpha = v
    } else {
      if (v < best) best = v
      if (v < beta) beta = v
    }
    if (alpha >= beta) break
  }
  return best
}

let firstTurn = true
while (true) {
  for (let k = 0; k < 3; k++) {
    const [color, status] = readline().trim().split(" ")
    alive[COLORS.indexOf(color)] = status === "1"
  }
  closed.fill(0)
  for (let r = 0; r < 8; r++) {
    const line = readline()
    for (let c = 0; c < 8; c++) {
      const ch = line[c]
      if (ch !== ".") closed[r * 8 + c] = 1
      const p = COLORS.indexOf(ch)
      if (p >= 0) pos[p] = r * 8 + c
    }
  }
  deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  const n = parseInt(readline())
  const legal: number[] = []
  for (let i = 0; i < n; i++) legal.push(sq(readline().trim()))

  let best = legal[0]
  let reached = 0
  nodes = 0
  try {
    let order = legal
    for (let depth = 1; depth <= 40; depth++) {
      let alpha = -Infinity
      let depthBest = order[0]
      const from = pos[me]
      for (const t of order) {
        closed[t] = 1
        pos[me] = t
        const v = search(nextPlayer(me), depth - 1, alpha, Infinity, 1)
        pos[me] = from
        closed[t] = 0
        if (v > alpha) {
          alpha = v
          depthBest = t
        }
      }
      best = depthBest
      reached = depth
      order = [depthBest, ...order.filter(t => t !== depthBest)]
      if (Math.abs(alpha) >= 100000) break
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  console.log(sqName(best))
}
