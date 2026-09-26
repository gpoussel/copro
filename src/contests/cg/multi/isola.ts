// 🎮 CodinGame Multiplayer - isola
// https://www.codingame.com/multiplayer/bot-programming/isola
//
// 9x9: move the pawn one step (8 directions), then remove a free tile; a
// player who cannot move loses. Negamax alpha-beta with iterative deepening;
// removals are limited to tiles near the opponent's pawn; eval = mobility
// (ours − 2·theirs) + Voronoi territory.

const N = 9
const TURN_MS = 80
const FIRST_TURN_MS = 800
const removed = new Uint8Array(N * N)
const pos = [0, 0] // [us, them]
const DIRS: [number, number][] = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
]
const neighbours: number[][] = []
for (let i = 0; i < N * N; i++) {
  const x = i % N
  const y = Math.floor(i / N)
  neighbours.push(
    DIRS.filter(([dx, dy]) => x + dx >= 0 && x + dx < N && y + dy >= 0 && y + dy < N).map(
      ([dx, dy]) => (y + dy) * N + x + dx
    )
  )
}
const free = (i: number) => !removed[i] && i !== pos[0] && i !== pos[1]
const mobility = (p: number) => neighbours[pos[p]].filter(free).length

// Territory: cells strictly closer (king steps over free tiles) to p.
const dist = [new Int16Array(N * N), new Int16Array(N * N)]
function territory(p: number): number {
  for (const s of [0, 1]) {
    const d = dist[s]
    d.fill(999)
    d[pos[s]] = 0
    const q = [pos[s]]
    for (let h = 0; h < q.length; h++) {
      for (const n of neighbours[q[h]]) {
        if (removed[n] || n === pos[1 - s] || d[n] <= d[q[h]] + 1) continue
        d[n] = d[q[h]] + 1
        q.push(n)
      }
    }
  }
  let s = 0
  for (let i = 0; i < N * N; i++) {
    if (removed[i]) continue
    if (dist[p][i] < dist[1 - p][i]) s++
    else if (dist[1 - p][i] < dist[p][i]) s--
  }
  return s
}

const evaluate = (p: number) => mobility(p) * 3 - mobility(1 - p) * 6 + territory(p)

class Timeout extends Error {}
let deadline = 0
let nodes = 0
const WIN = 100000

function candidates(p: number): [number, number][] {
  const out: [number, number][] = []
  const from = pos[p]
  for (const m of neighbours[from]) {
    if (!free(m)) continue
    pos[p] = m
    const opp = pos[1 - p]
    // Removals next to the opponent first, then at distance 2.
    const near = new Set<number>()
    for (const a of neighbours[opp]) {
      if (free(a)) near.add(a)
      for (const b of neighbours[a]) if (free(b)) near.add(b)
    }
    for (const r of near) out.push([m, r])
    pos[p] = from
  }
  return out
}

function negamax(p: number, depth: number, alpha: number, beta: number, ply: number): number {
  if ((++nodes & 255) === 0 && Date.now() > deadline) throw new Timeout()
  if (mobility(p) === 0) return -WIN + ply
  if (depth === 0) return evaluate(p)
  let best = -Infinity
  const from = pos[p]
  for (const [m, r] of candidates(p)) {
    pos[p] = m
    removed[r] = 1
    const v = -negamax(1 - p, depth - 1, -beta, -alpha, ply + 1)
    removed[r] = 0
    pos[p] = from
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best === -Infinity ? -WIN + ply : best
}

{
  const x = parseInt(readline())
  const y = parseInt(readline())
  pos[0] = y * N + x
}
let firstTurn = true
while (true) {
  const ox = parseInt(readline())
  const oy = parseInt(readline())
  const rx = parseInt(readline())
  const ry = parseInt(readline())
  deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  pos[1] = oy * N + ox
  if (rx >= 0) removed[ry * N + rx] = 1
  const snapshot = new Uint8Array(removed) // to restore after a timeout

  let best = candidates(0)[0]
  let order = candidates(0)
  let reached = 0
  nodes = 0
  const from = pos[0]
  try {
    for (let depth = 1; depth <= 20; depth++) {
      let alpha = -Infinity
      let depthBest = order[0]
      const scored: [number, [number, number]][] = []
      for (const c of order) {
        pos[0] = c[0]
        removed[c[1]] = 1
        const v = -negamax(1, depth - 1, -Infinity, -alpha, 1)
        removed[c[1]] = 0
        pos[0] = from
        scored.push([v, c])
        if (v > alpha) {
          alpha = v
          depthBest = c
        }
      }
      best = depthBest
      reached = depth
      order = scored.sort((a, b) => b[0] - a[0]).map(([, c]) => c)
      if (Math.abs(alpha) > WIN / 2) break
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
    pos[0] = from
    removed.set(snapshot) // the interrupted search may have left a removal
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  pos[0] = best[0]
  removed[best[1]] = 1
  console.log(`${best[0] % N} ${Math.floor(best[0] / N)} ${best[1] % N} ${Math.floor(best[1] / N)}`)
}
