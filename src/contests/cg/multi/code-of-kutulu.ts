// 🎮 CodinGame Multiplayer - code-of-kutulu
// https://www.codingame.com/multiplayer/bot-programming/code-of-kutulu
//
// 4 explorers in a maze; sanity −3 per turn alone, −1 with another explorer
// within 2 (Manhattan), −20 when a wanderer reaches us. Last one standing
// wins. Bot: among staying and the 4 moves, maximise 10·(BFS distance to
// the nearest wanderer, capped at 6) + 15 when another explorer is within
// 2, minus a penalty for cells next to a spawning minion.

const W = parseInt(readline())
const H = parseInt(readline())
const map: string[] = []
for (let y = 0; y < H; y++) map.push(readline())
readline() // sanity loss / spawn constants
const free = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && map[y][x] !== "#"
const DIRS = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

function bfs(sx: number, sy: number): Int32Array {
  const d = new Int32Array(W * H).fill(-1)
  d[sy * W + sx] = 0
  const q = [sy * W + sx]
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    for (const [dx, dy] of DIRS.slice(1)) {
      const x = (c % W) + dx
      const y = Math.floor(c / W) + dy
      if (!free(x, y) || d[y * W + x] >= 0) continue
      d[y * W + x] = d[c] + 1
      q.push(y * W + x)
    }
  }
  return d
}

while (true) {
  const n = parseInt(readline())
  const ents: { type: string; x: number; y: number; p0: number; p1: number }[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    ents.push({ type: p[0], x: +p[2], y: +p[3], p0: +p[4], p1: +p[5] })
  }
  const me = ents[0]
  const others = ents.slice(1).filter(e => e.type === "EXPLORER")
  const minions = ents.filter(e => e.type !== "EXPLORER")
  const minionDist = minions.map(m => ({ m, d: bfs(m.x, m.y) }))
  let best = [me.x, me.y]
  let bestScore = -Infinity
  for (const [dx, dy] of DIRS) {
    const x = me.x + dx
    const y = me.y + dy
    if (!free(x, y)) continue
    const c = y * W + x
    let near = 99
    for (const { m, d } of minionDist) {
      if (d[c] < 0) continue
      // A spawning minion is not moving yet.
      near = Math.min(near, d[c] + (m.p1 === 0 ? m.p0 : 0))
    }
    let score = Math.min(near, 6) * 10
    if (near <= 1) score -= 50
    if (others.some(o => Math.abs(o.x - x) + Math.abs(o.y - y) <= 2)) score += 15
    else if (others.length) {
      // Drift towards the closest explorer.
      const closest = Math.min(...others.map(o => Math.abs(o.x - x) + Math.abs(o.y - y)))
      score -= closest * 0.5
    }
    if (score > bestScore) {
      bestScore = score
      best = [x, y]
    }
  }
  console.log(best[0] === me.x && best[1] === me.y ? "WAIT" : `MOVE ${best[0]} ${best[1]}`)
}
