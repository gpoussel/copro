// 🎮 CodinGame Multiplayer - domain-expansion
// https://www.codingame.com/multiplayer/bot-programming/domain-expansion
//
// 7x7. Move up to 3 steps (walls and the enemy token block), then build a
// wall on one side of the token. Once the tokens are separated, the larger
// reachable domain wins. Negamax alpha-beta with iterative deepening; eval =
// Voronoi territory, exact domain sizes once separated.

const TURN_MS = 80
const FIRST_TURN_MS = 800
const [W, H] = readline().split(" ").map(Number)
const CELLS = W * H
const DX = [0, 0, -1, 1]
const DY = [-1, 1, 0, 0]
const DIR = "UDLR"

// wall[c * 4 + d]: side d of cell c is closed (borders start closed).
const wall = new Uint8Array(CELLS * 4)
for (let c = 0; c < CELLS; c++) {
  const x = c % W
  const y = Math.floor(c / W)
  for (let d = 0; d < 4; d++) {
    const nx = x + DX[d]
    const ny = y + DY[d]
    if (nx < 0 || nx >= W || ny < 0 || ny >= H) wall[c * 4 + d] = 1
  }
}
const opposite = [1, 0, 3, 2]
const step = (c: number, d: number) => c + DX[d] + DY[d] * W
function setWall(c: number, d: number, v: number) {
  wall[c * 4 + d] = v
  const n = step(c, d)
  if (n >= 0 && n < CELLS && !(DX[d] !== 0 && Math.floor(n / W) !== Math.floor(c / W))) wall[n * 4 + opposite[d]] = v
}

const pos = [0, 0] // [us, them]
{
  const [x, y] = readline().split(" ").map(Number)
  const [ox, oy] = readline().split(" ").map(Number)
  pos[0] = y * W + x
  pos[1] = oy * W + ox
}

// BFS distances from `from`, not entering `blocker`.
function bfs(from: number, blocker: number, dist: Uint8Array, limit = 255) {
  dist.fill(255)
  const q = [from]
  dist[from] = 0
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    if (dist[c] >= limit) continue
    for (let d = 0; d < 4; d++) {
      if (wall[c * 4 + d]) continue
      const n = step(c, d)
      if (n === blocker || dist[n] !== 255) continue
      dist[n] = dist[c] + 1
      q.push(n)
    }
  }
}

const dA = new Uint8Array(CELLS)
const dB = new Uint8Array(CELLS)
// From the point of view of side p (0 us, 1 them). Separated => exact.
function evaluate(p: number): number {
  bfs(pos[p], -1, dA)
  bfs(pos[1 - p], -1, dB)
  if (dA[pos[1 - p]] === 255) {
    let a = 0
    let b = 0
    for (let c = 0; c < CELLS; c++) {
      if (dA[c] !== 255) a++
      if (dB[c] !== 255) b++
    }
    return a > b ? 10000 + a - b : a < b ? -10000 + a - b : 0
  }
  let s = 0
  for (let c = 0; c < CELLS; c++) {
    if (dA[c] < dB[c]) s++
    else if (dB[c] < dA[c]) s--
  }
  return s
}
const separated = () => {
  bfs(pos[0], -1, dA)
  return dA[pos[1]] === 255
}

// Moves for side p: [cell, wall dir].
const reach = new Uint8Array(CELLS)
function genMoves(p: number): number[] {
  bfs(pos[p], pos[1 - p], reach, 3)
  const out: number[] = []
  for (let c = 0; c < CELLS; c++) {
    if (reach[c] === 255) continue
    for (let d = 0; d < 4; d++) if (!wall[c * 4 + d]) out.push(c * 4 + d)
  }
  return out
}

class Timeout extends Error {}
let deadline = 0
let nodes = 0

function negamax(p: number, depth: number, alpha: number, beta: number): number {
  if ((++nodes & 255) === 0 && Date.now() > deadline) throw new Timeout()
  if (depth === 0 || separated()) return evaluate(p)
  const moves = genMoves(p)
  if (moves.length === 0) return evaluate(p)
  let best = -Infinity
  const from = pos[p]
  for (const m of moves) {
    const c = m >> 2
    const d = m & 3
    pos[p] = c
    setWall(c, d, 1)
    const v = -negamax(1 - p, depth - 1, -beta, -alpha)
    setWall(c, d, 0)
    pos[p] = from
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best
}

// Every wall built so far (to undo an interrupted search).
const history: [number, number][] = []
let firstTurn = true
while (true) {
  const [ax, ay, ad] = readline().trim().split(" ")
  const deadline0 = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  if (ax !== "-1") {
    pos[1] = parseInt(ay) * W + parseInt(ax)
    setWall(pos[1], DIR.indexOf(ad), 1)
    history.push([pos[1], DIR.indexOf(ad)])
  }
  deadline = deadline0
  const moves = genMoves(0)
  let best = moves[0]
  let reached = 0
  nodes = 0
  const from = pos[0]
  try {
    let order = moves
    for (let depth = 1; depth <= 20; depth++) {
      let alpha = -Infinity
      let depthBest = order[0]
      for (const m of order) {
        pos[0] = m >> 2
        setWall(m >> 2, m & 3, 1)
        const v = -negamax(1, depth - 1, -Infinity, -alpha)
        setWall(m >> 2, m & 3, 0)
        pos[0] = from
        if (v > alpha) {
          alpha = v
          depthBest = m
        }
      }
      best = depthBest
      reached = depth
      order = [depthBest, ...order.filter(m => m !== depthBest)]
      if (Math.abs(alpha) >= 10000) break
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
    pos[0] = from
    // An interrupted search may leave one wall set: rebuild from history.
    rebuildWalls()
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  const c = best >> 2
  const d = best & 3
  pos[0] = c
  setWall(c, d, 1)
  history.push([c, d])
  console.log(`${c % W} ${Math.floor(c / W)} ${DIR[d]}`)
}

function rebuildWalls() {
  for (let c = 0; c < CELLS; c++)
    for (let d = 0; d < 4; d++) {
      const x = (c % W) + DX[d]
      const y = Math.floor(c / W) + DY[d]
      wall[c * 4 + d] = x < 0 || x >= W || y < 0 || y >= H ? 1 : 0
    }
  for (const [c, d] of history) setWall(c, d, 1)
}
