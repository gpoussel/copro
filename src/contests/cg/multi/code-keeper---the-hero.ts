// 🎮 CodinGame Multiplayer - code-keeper---the-hero
// https://www.codingame.com/multiplayer/bot-programming/code-keeper---the-hero
// Referee: https://github.com/acatai/CodeKeeper-TheHero
//
// 16x12 maze under fog (we see range 3). Reaching the exit is +10000, dying
// −1000, killed monsters give their health, treasures 100. Heuristic: remember
// the map, sword adjacent monsters, bow dangerous ones in range, drink when
// low, go to the exit once seen, else pick nearby items and explore the
// nearest frontier.

const W = 16
const H = 12
const UNKNOWN = 0
const FREE = 1
const WALL = 2
const map = new Uint8Array(W * H)
const EXIT = 0
const OBSTACLE = 1
const TREASURE = 2
const POTION = 3
const CHESTS = [4, 5, 6]
const MONSTERS = [7, 8, 9, 10, 11]
const DANGEROUS = [9, 10, 11] // gargoyle, orc, vampire

interface Entity {
  x: number
  y: number
  type: number
  value: number
}
const items = new Map<number, Entity>() // remembered items by cell

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

// BFS over known free cells; returns the first step towards the nearest goal.
function route(sx: number, sy: number, goal: (i: number) => boolean, blocked: Set<number>): [number, number] | null {
  const prev = new Int16Array(W * H).fill(-1)
  const start = sy * W + sx
  prev[start] = start
  const q = [start]
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    if (c !== start && goal(c)) {
      let step = c
      while (prev[step] !== start) step = prev[step]
      return [step % W, Math.floor(step / W)]
    }
    const x = c % W
    const y = Math.floor(c / W)
    for (const [dx, dy] of DIRS) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const n = ny * W + nx
      if (prev[n] >= 0 || map[n] !== FREE || (blocked.has(n) && !goal(n))) continue
      prev[n] = c
      q.push(n)
    }
  }
  return null
}

while (true) {
  const [x, y, health, , , , bow] = readline().split(" ").map(Number)
  const n = parseInt(readline())
  const entities: Entity[] = []
  for (let i = 0; i < n; i++) {
    const [ex, ey, type, value] = readline().split(" ").map(Number)
    entities.push({ x: ex, y: ey, type, value })
  }
  // Everything within range 3 is seen: free unless listed as an obstacle.
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const cx = x + dx
      const cy = y + dy
      if (cx < 0 || cy < 0 || cx >= W || cy >= H) continue
      const i = cy * W + cx
      if (map[i] === UNKNOWN) map[i] = FREE
      items.delete(i)
    }
  }
  const monsters: Entity[] = []
  for (const e of entities) {
    const i = e.y * W + e.x
    if (e.type === OBSTACLE) map[i] = WALL
    else if (MONSTERS.includes(e.type)) monsters.push(e)
    else items.set(i, e)
  }
  const blocked = new Set(monsters.map(m => m.y * W + m.x))

  let order = ""
  // Fight: adjacent monster first (sword), else a dangerous one with the bow.
  const adjacent = monsters.find(m => Math.abs(m.x - x) + Math.abs(m.y - y) === 1)
  const threat = monsters
    .filter(m => DANGEROUS.includes(m.type) && Math.max(Math.abs(m.x - x), Math.abs(m.y - y)) <= 3)
    .sort((a, b) => a.value - b.value)[0]
  if (adjacent) order = `ATTACK 0 ${adjacent.x} ${adjacent.y}`
  else if (threat && bow > 0) order = `ATTACK 3 ${threat.x} ${threat.y}`

  if (!order) {
    const itemAt = (type: number[]) => (i: number) => {
      const it = items.get(i)
      return it !== undefined && type.includes(it.type)
    }
    const frontier = (i: number) => {
      const cx = i % W
      const cy = Math.floor(i / W)
      return DIRS.some(([dx, dy]) => {
        const nx = cx + dx
        const ny = cy + dy
        return nx >= 0 && ny >= 0 && nx < W && ny < H && map[ny * W + nx] === UNKNOWN
      })
    }
    const plans = [
      health <= 10 ? itemAt([POTION]) : null,
      itemAt([EXIT]),
      itemAt([TREASURE, POTION, ...CHESTS]),
      frontier,
    ]
    for (const goal of plans) {
      if (!goal) continue
      const step = route(x, y, goal, blocked)
      if (step) {
        order = `MOVE ${step[0]} ${step[1]}`
        break
      }
    }
  }
  console.log(order || `MOVE ${x} ${y}`)
}
