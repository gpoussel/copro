// 🎮 CodinGame Multiplayer - winter-challenge-2026-snakebyte
// https://www.codingame.com/multiplayer/bot-programming/winter-challenge-2026-snakebyte
//
// Side-view grid with platforms and gravity; snakebots keep moving in their
// last direction, eat energy to grow; the most body parts wins. Heuristic per
// snake: never reverse into the neck nor hit a platform/body, stay off cells
// next to enemy heads, head (BFS over free cells) to the nearest energy, and
// prefer moves that keep the head supported.

const myId = parseInt(readline())
void myId
const W = parseInt(readline())
const H = parseInt(readline())
const grid: string[] = []
for (let y = 0; y < H; y++) grid.push(readline())
const per = parseInt(readline())
const myIds = new Set<number>()
for (let i = 0; i < per; i++) myIds.add(parseInt(readline()))
for (let i = 0; i < per; i++) readline()

const DIRS: [string, number, number][] = [
  ["UP", 0, -1],
  ["DOWN", 0, 1],
  ["LEFT", -1, 0],
  ["RIGHT", 1, 0],
]
const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H
const platform = (x: number, y: number) => inside(x, y) && grid[y][x] === "#"

while (true) {
  const pc = parseInt(readline())
  const energy = new Set<number>()
  for (let i = 0; i < pc; i++) {
    const [x, y] = readline().split(" ").map(Number)
    energy.add(y * W + x)
  }
  const sc = parseInt(readline())
  const snakes: { id: number; body: [number, number][] }[] = []
  for (let i = 0; i < sc; i++) {
    const [id, body] = readline().trim().split(" ")
    snakes.push({ id: parseInt(id), body: body.split(":").map(c => c.split(",").map(Number) as [number, number]) })
  }
  const occupied = new Set<number>()
  for (const s of snakes) for (const [x, y] of s.body) if (inside(x, y)) occupied.add(y * W + x)
  const enemyHeads = snakes.filter(s => !myIds.has(s.id)).map(s => s.body[0])

  // BFS distance to the nearest energy from every free cell.
  const dist = new Int32Array(W * H).fill(1 << 20)
  const q: number[] = []
  for (const e of energy) {
    dist[e] = 0
    q.push(e)
  }
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    const cx = c % W
    const cy = Math.floor(c / W)
    for (const [, dx, dy] of DIRS) {
      const nx = cx + dx
      const ny = cy + dy
      if (!inside(nx, ny) || platform(nx, ny) || occupied.has(ny * W + nx)) continue
      const n = ny * W + nx
      if (dist[n] > dist[c] + 1) {
        dist[n] = dist[c] + 1
        q.push(n)
      }
    }
  }

  const commands: string[] = []
  const claimed = new Set<number>()
  for (const s of snakes) {
    if (!myIds.has(s.id)) continue
    const [hx, hy] = s.body[0]
    const neck = s.body[1]
    let best = ""
    let bestScore = -Infinity
    for (const [name, dx, dy] of DIRS) {
      const nx = hx + dx
      const ny = hy + dy
      if (neck && neck[0] === nx && neck[1] === ny) continue
      const k = ny * W + nx
      let score = 0
      if (platform(nx, ny) || (inside(nx, ny) && occupied.has(k) && !energy.has(k)) || claimed.has(k)) score -= 1000
      if (enemyHeads.some(([ex, ey]) => Math.abs(ex - nx) + Math.abs(ey - ny) === 1)) score -= 50
      if (energy.has(k)) score += 100
      score -= inside(nx, ny) ? Math.min(dist[k], 200) : 300
      // Support: something solid right below the new head.
      const below = (ny + 1) * W + nx
      if (platform(nx, ny + 1) || occupied.has(below) || energy.has(below)) score += 3
      if (score > bestScore) {
        bestScore = score
        best = name
      }
    }
    claimed.add(
      (hy + (best === "DOWN" ? 1 : best === "UP" ? -1 : 0)) * W + hx + (best === "RIGHT" ? 1 : best === "LEFT" ? -1 : 0)
    )
    if (best) commands.push(`${s.id} ${best}`)
  }
  console.log(commands.length ? commands.join(";") : "WAIT")
}
