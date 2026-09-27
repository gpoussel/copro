// 🎮 CodinGame Multiplayer - spring-challenge-2020
// https://www.codingame.com/multiplayer/bot-programming/spring-challenge-2020
//
// Pac-Man duel. League 1: one pac each, everything visible; pellets 1,
// super pellets 10; the map wraps horizontally. Each pac goes for the pellet
// with the best value / BFS distance, pacs claiming different targets.

const [W, H] = readline().split(" ").map(Number)
const grid: string[] = []
for (let y = 0; y < H; y++) grid.push(readline())
const floor = (x: number, y: number) => y >= 0 && y < H && grid[y][((x % W) + W) % W] !== "#"

function bfs(sx: number, sy: number): Int32Array {
  const d = new Int32Array(W * H).fill(-1)
  d[sy * W + sx] = 0
  const q = [sy * W + sx]
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    const x = c % W
    const y = Math.floor(c / W)
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = (((x + dx) % W) + W) % W
      const ny = y + dy
      if (!floor(nx, ny)) continue
      const n = ny * W + nx
      if (d[n] >= 0) continue
      d[n] = d[c] + 1
      q.push(n)
    }
  }
  return d
}

while (true) {
  readline() // scores
  const pc = parseInt(readline())
  const pacs: { id: number; x: number; y: number }[] = []
  for (let i = 0; i < pc; i++) {
    const [id, mine, x, y] = readline().trim().split(" ")
    if (mine === "1") pacs.push({ id: +id, x: +x, y: +y })
  }
  const n = parseInt(readline())
  const pellets: { x: number; y: number; v: number }[] = []
  for (let i = 0; i < n; i++) {
    const [x, y, v] = readline().split(" ").map(Number)
    pellets.push({ x, y, v })
  }
  const claimed = new Set<number>()
  const out: string[] = []
  for (const p of pacs) {
    const d = bfs(p.x, p.y)
    let best: (typeof pellets)[0] | null = null
    let bestValue = -1
    for (const pl of pellets) {
      const k = pl.y * W + pl.x
      if (claimed.has(k) || d[k] < 0) continue
      const value = pl.v / (d[k] + 1)
      if (value > bestValue) {
        bestValue = value
        best = pl
      }
    }
    if (best) {
      claimed.add(best.y * W + best.x)
      out.push(`MOVE ${p.id} ${best.x} ${best.y}`)
    } else out.push(`MOVE ${p.id} ${p.x} ${p.y}`)
  }
  console.log(out.join(" | "))
}
