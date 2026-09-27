// 🎮 CodinGame Multiplayer - tron-battle
// https://www.codingame.com/multiplayer/bot-programming/tron-battle
//
// Light cycles on 30x20 for 2-4 players; a dead player's trail disappears.
// Each safe move is scored by Voronoi territory (cells we reach strictly
// first) when still in contact with an opponent, or by the reachable area
// (then hugging walls) once we are alone in our region. With exactly two
// players alive: iterative-deepening alpha-beta (our move, then theirs),
// Voronoi evaluation (×4 once the regions are separated).

const W = 30
const H = 20
const DIRS: [string, number, number][] = [
  ["UP", 0, -1],
  ["DOWN", 0, 1],
  ["LEFT", -1, 0],
  ["RIGHT", 1, 0],
]
const owner = new Int8Array(W * H).fill(-1)
const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H

function bfs(starts: number[], dist: Int16Array) {
  dist.fill(10000)
  const q: number[] = []
  for (const s of starts) {
    dist[s] = 0
    q.push(s)
  }
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    const x = c % W
    const y = Math.floor(c / W)
    for (const [, dx, dy] of DIRS) {
      const nx = x + dx
      const ny = y + dy
      if (!inside(nx, ny)) continue
      const n = ny * W + nx
      if (owner[n] >= 0 || dist[n] <= dist[c] + 1) continue
      dist[n] = dist[c] + 1
      q.push(n)
    }
  }
}

const mineDist = new Int16Array(W * H)
const theirDist = new Int16Array(W * H)

// --- 1v1: alpha-beta (we move, then the opponent), Voronoi evaluation ----
const dA = new Int16Array(W * H)
const dB = new Int16Array(W * H)
let deadline = 0
let aborted = false
let nodes = 0
function voronoi(a: number, b: number): number {
  bfs([a], dA)
  bfs([b], dB)
  let sa = 0
  let sb = 0
  let contact = false
  for (let i = 0; i < W * H; i++) {
    if (owner[i] >= 0 && i !== a && i !== b) continue
    if (dA[i] < dB[i]) sa++
    else if (dB[i] < dA[i]) sb++
    if (dA[i] < 10000 && dB[i] < 10000) contact = true
  }
  // Separated: the bigger region wins outright (weight it heavily).
  return contact ? sa - sb : (sa - sb) * 4
}
function moves(h: number): number[] {
  const x = h % W
  const y = Math.floor(h / W)
  const out: number[] = []
  for (const [, dx, dy] of DIRS) if (inside(x + dx, y + dy) && owner[(y + dy) * W + x + dx] < 0) out.push((y + dy) * W + x + dx)
  return out
}
// Value for "me" to move from (a) with the opponent at (b); ply counts both.
function search(a: number, b: number, depth: number, alpha: number, beta: number, meId: number, oppId: number): number {
  if ((++nodes & 255) === 0 && Date.now() > deadline) aborted = true
  if (aborted) return 0
  const ma = moves(a)
  if (!ma.length) return -100000 - depth
  if (depth === 0) return voronoi(a, b)
  let best = -Infinity
  for (const na of ma) {
    owner[na] = meId
    // Opponent reply (minimising).
    const mb = moves(b)
    let worst = Infinity
    if (!mb.length) worst = 100000 + depth
    else
      for (const nb of mb) {
        if (nb === na) {
          worst = Math.min(worst, 0) // head-on: both die
          continue
        }
        owner[nb] = oppId
        const v = search(na, nb, depth - 1, alpha, Math.min(beta, worst), meId, oppId)
        owner[nb] = -1
        if (v < worst) worst = v
        if (worst <= alpha || aborted) break
      }
    owner[na] = -1
    if (worst > best) best = worst
    if (best > alpha) alpha = best
    if (alpha >= beta || aborted) break
  }
  return best
}

while (true) {
  const [n, me] = readline().split(" ").map(Number)
  const heads: number[] = []
  for (let p = 0; p < n; p++) {
    const [x0, y0, x1, y1] = readline().split(" ").map(Number)
    if (x0 < 0) {
      // Dead: its trail vanishes.
      for (let i = 0; i < W * H; i++) if (owner[i] === p) owner[i] = -1
      heads.push(-1)
      continue
    }
    owner[y0 * W + x0] = p
    owner[y1 * W + x1] = p
    heads.push(y1 * W + x1)
  }
  const head = heads[me]
  const alive = heads.filter(h => h >= 0).length
  if (alive === 2) {
    // 1v1: iterative deepening alpha-beta.
    const opp = heads.findIndex((h, p) => p !== me && h >= 0)
    deadline = Date.now() + 70
    aborted = false
    let bestMove = -1
    for (let depth = 1; depth <= 20; depth++) {
      let alpha = -Infinity
      let choice = -1
      for (const na of moves(head)) {
        owner[na] = me
        const mb = moves(heads[opp])
        let worst = Infinity
        if (!mb.length) worst = 100000 + depth
        else
          for (const nb of mb) {
            if (nb === na) {
              worst = Math.min(worst, 0)
              continue
            }
            owner[nb] = opp
            const v = search(na, nb, depth - 1, alpha, worst, me, opp)
            owner[nb] = -1
            if (v < worst) worst = v
            if (worst <= alpha || aborted) break
          }
        owner[na] = -1
        if (aborted) break
        if (worst > alpha) {
          alpha = worst
          choice = na
        }
      }
      if (aborted) break
      if (choice >= 0) bestMove = choice
    }
    if (bestMove >= 0) {
      const dx = (bestMove % W) - (head % W)
      const dy = Math.floor(bestMove / W) - Math.floor(head / W)
      console.log(DIRS.find(d => d[1] === dx && d[2] === dy)![0])
      continue
    }
  }
  const hx = head % W
  const hy = Math.floor(head / W)
  const others = heads.filter((h, p) => p !== me && h >= 0)
  let best = "UP"
  let bestScore = -Infinity
  for (const [name, dx, dy] of DIRS) {
    const nx = hx + dx
    const ny = hy + dy
    if (!inside(nx, ny) || owner[ny * W + nx] >= 0) continue
    const cell = ny * W + nx
    owner[cell] = me
    bfs([cell], mineDist)
    // Opponents' next heads (they move before we do again).
    const starts: number[] = []
    for (const o of others) {
      const ox = o % W
      const oy = Math.floor(o / W)
      for (const [, ex, ey] of DIRS)
        if (inside(ox + ex, oy + ey) && owner[(oy + ey) * W + ox + ex] < 0) starts.push((oy + ey) * W + ox + ex)
    }
    bfs(starts, theirDist)
    let mineArea = 0
    let theirArea = 0
    let contact = false
    let reachable = 0
    for (let i = 0; i < W * H; i++) {
      if (owner[i] >= 0) continue
      if (mineDist[i] < 10000) reachable++
      if (mineDist[i] < 10000 && theirDist[i] < 10000) contact = true
      if (mineDist[i] < theirDist[i]) mineArea++
      else if (theirDist[i] < mineDist[i]) theirArea++
    }
    // Wall hugging: fewer free neighbours keeps the space compact.
    let freeNeighbours = 0
    for (const [, ex, ey] of DIRS) if (inside(nx + ex, ny + ey) && owner[(ny + ey) * W + nx + ex] < 0) freeNeighbours++
    const score = contact ? (mineArea - theirArea) * 10 + reachable : reachable * 10 - freeNeighbours
    owner[cell] = -1
    if (score > bestScore) {
      bestScore = score
      best = name
    }
  }
  console.log(best)
}
