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

  // Referee rules (github.com/CodinGame/WinterChallenge2026-Exotec): move
  // (grow when the new head is on energy), a head in a platform or a body is
  // cut off (a snake of ≤ 3 dies), then a snake with no cell resting on a
  // platform / energy / other snake falls until it does (dies below the map).
  const others = new Set<number>()
  const solidBelow = (x: number, y: number, self: Set<number>) =>
    platform(x, y + 1) || energy.has((y + 1) * W + x) || (others.has((y + 1) * W + x) && !self.has((y + 1) * W + x))
  // One simulated move; null = dead. Returns the new body and what happened.
  const step = (body: [number, number][], dx: number, dy: number, food: Set<number>) => {
    const head: [number, number] = [body[0][0] + dx, body[0][1] + dy]
    const eat = inside(head[0], head[1]) && food.has(head[1] * W + head[0])
    let nb: [number, number][] = [head, ...body.slice(0, eat ? body.length : body.length - 1)]
    let cut = false
    const hit =
      platform(head[0], head[1]) ||
      others.has(head[1] * W + head[0]) ||
      nb.slice(1).some(([x, y]) => x === head[0] && y === head[1])
    if (hit) {
      if (nb.length <= 3) return null
      nb = nb.slice(1)
      cut = true
    }
    // Fall.
    for (let k = 0; k < H + 2; k++) {
      const self = new Set(nb.map(([x, y]) => y * W + x))
      if (nb.some(([x, y]) => solidBelow(x, y, self))) break
      nb = nb.map(([x, y]) => [x, y + 1])
      if (nb.every(([, y]) => y >= H + 1)) return null
    }
    return { body: nb, eat, cut }
  }

  const commands: string[] = []
  const claimed = new Set<number>()
  const deadline = Date.now() + 30
  for (const snake of snakes) {
    if (!myIds.has(snake.id)) continue
    others.clear()
    for (const o of snakes) if (o.id !== snake.id) for (const [x, y] of o.body) if (inside(x, y)) others.add(y * W + x)
    for (const c of claimed) others.add(c)
    const neck = snake.body[1]
    let best = ""
    let bestScore = -Infinity
    for (const [name, dx, dy] of DIRS) {
      const [hx, hy] = snake.body[0]
      if (neck && neck[0] === hx + dx && neck[1] === hy + dy) continue
      const first = step(snake.body, dx, dy, energy)
      if (!first) continue
      let score = first.cut ? -30 : 0
      if (enemyHeads.some(([ex, ey]) => Math.abs(ex - first.body[0][0]) + Math.abs(ey - first.body[0][1]) === 1)) score -= 20
      if (first.eat) score += 100
      else {
        // Breadth-first search for the soonest energy (depth ≤ 7).
        let layer = [first.body]
        const seen = new Set([first.body.join(";")])
        let found = -1
        let nodes = 0
        for (let depth = 1; depth <= 8 && layer.length && found < 0 && Date.now() < deadline; depth++) {
          const next: [number, number][][] = []
          for (const body of layer) {
            for (const [, ex, ey] of DIRS) {
              const nk = body[1]
              if (nk && nk[0] === body[0][0] + ex && nk[1] === body[0][1] + ey) continue
              const r = step(body, ex, ey, energy)
              if (!r || r.cut) continue
              if (r.eat) {
                found = depth
                break
              }
              const key = r.body.join(";")
              if (seen.has(key)) continue
              seen.add(key)
              next.push(r.body)
            }
            if (found >= 0 || ++nodes > 600 || Date.now() > deadline) break
          }
          layer = next
        }
        if (found >= 0) score += 90 - found * 10
        else {
          const [x, y] = first.body[0]
          score -= inside(x, y) ? Math.min(dist[y * W + x], 200) : 300
          if (!layer.length && Date.now() < deadline) score -= 200 // dead end
        }
      }
      if (score > bestScore) {
        bestScore = score
        best = name
      }
    }
    if (!best) best = "UP"
    const [hx, hy] = snake.body[0]
    const d = DIRS.find(dd => dd[0] === best)!
    claimed.add((hy + d[2]) * W + hx + d[1])
    commands.push(`${snake.id} ${best}`)
  }
  console.log(commands.length ? commands.join(";") : "WAIT")
}
