// 🎮 CodinGame Multiplayer - code-of-kutulu
// https://www.codingame.com/multiplayer/bot-programming/code-of-kutulu
//
// 4 explorers in a maze; sanity −3 per turn alone, −1 with another explorer
// within 2 (Manhattan), −20 when a wanderer reaches us. Last one standing
// wins. Bot: among staying and the 4 moves, maximise 10·(BFS distance to
// the nearest wanderer, capped at 6) + 15 when another explorer is within
// 2, minus a penalty for cells next to a spawning minion.
// Wood 1: slashers (rush along rows/columns in sight: stay out of their
// lines), PLAN (heal with company), LIGHT (when a wanderer hunts us),
// shelters (+5/turn while energy lasts).

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

// Line of sight along a row / column without walls.
function sight(ax: number, ay: number, bx: number, by: number): boolean {
  if (ax !== bx && ay !== by) return false
  const sx = Math.sign(bx - ax)
  const sy = Math.sign(by - ay)
  for (let x = ax, y = ay; x !== bx || y !== by; x += sx, y += sy) if (!free(x, y)) return false
  return true
}

while (true) {
  const n = parseInt(readline())
  const ents: { type: string; id: number; x: number; y: number; p0: number; p1: number; p2: number }[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    ents.push({ type: p[0], id: +p[1], x: +p[2], y: +p[3], p0: +p[4], p1: +p[5], p2: +p[6] })
  }
  const me = ents[0]
  const others = ents.slice(1).filter(e => e.type === "EXPLORER")
  const minions = ents.filter(e => e.type === "WANDERER" || e.type === "SLASHER")
  const slashers = minions.filter(m => m.type === "SLASHER" && m.p1 !== 4)
  const effects = ents.filter(e => e.type.startsWith("EFFECT"))
  const minionDist = minions.map(m => ({ m, d: bfs(m.x, m.y) }))
  const myEffect = effects.some(e => e.p1 === me.id)
  const nearOthers = others.filter(o => Math.abs(o.x - me.x) + Math.abs(o.y - me.y) <= 2).length
  const closestMinion = Math.min(99, ...minionDist.map(({ m, d }) => d[me.y * W + me.x] + (m.p1 === 0 ? m.p0 : 0)))
  // Effects: PLAN when sane-ish company is around and nothing is close.
  if (!myEffect && me.p1 > 0 && me.p0 < 200 && nearOthers >= 1 && closestMinion > 2) {
    console.log("PLAN")
    continue
  }
  // LIGHT when a wanderer targets us from close.
  if (!myEffect && me.p2 > 0 && minions.some(m => m.type === "WANDERER" && m.p2 === me.id && Math.abs(m.x - me.x) + Math.abs(m.y - me.y) <= 3)) {
    console.log("LIGHT")
    continue
  }
  let best = [me.x, me.y]
  let bestScore = -Infinity
  for (const [dx, dy] of DIRS) {
    const x = me.x + dx
    const y = me.y + dy
    if (!free(x, y)) continue
    const c = y * W + x
    let near = 99
    for (const { m, d } of minionDist) {
      if (d[c] < 0 || m.type === "SLASHER") continue
      // A spawning minion is not moving yet.
      near = Math.min(near, d[c] + (m.p1 === 0 ? m.p0 : 0))
    }
    let score = Math.min(near, 6) * 10
    if (near <= 1) score -= 50
    // Slashers rush along rows / columns in sight: stay out of their lines.
    for (const sl of slashers) if (sight(sl.x, sl.y, x, y)) score -= sl.p1 === 2 || sl.p1 === 3 ? 60 : 30
    // Shelters heal while they have energy.
    if (effects.some(e => e.type === "EFFECT_SHELTER" && e.x === x && e.y === y && e.p0 > 0) && me.p0 < 220) score += 12
    // Company: −1 sanity instead of −3, and PLANs heal more with it.
    if (others.some(o => Math.abs(o.x - x) + Math.abs(o.y - y) <= 2)) score += 25
    else if (others.length) {
      // Walk towards the closest explorer (maze distance).
      const dc = bfs(x, y)
      const closest = Math.min(...others.map(o => (dc[o.y * W + o.x] < 0 ? 99 : dc[o.y * W + o.x])))
      score -= Math.min(closest, 30) * 2
    }
    if (score > bestScore) {
      bestScore = score
      best = [x, y]
    }
  }
  console.log(best[0] === me.x && best[1] === me.y ? "WAIT" : `MOVE ${best[0]} ${best[1]}`)
}
