// 🎮 CodinGame Puzzle - find-the-shortest-path-home
// https://www.codingame.com/training/medium/find-the-shortest-path-home

const route = readline().trim()
const STEP: { [d: string]: [number, number] } = { N: [0, 1], E: [1, 0], S: [0, -1], W: [-1, 0] }

const key = (x: number, y: number) => `${x},${y}`
const edgeKey = (x1: number, y1: number, x2: number, y2: number) =>
  x1 < x2 || (x1 === x2 && y1 < y2) ? `${x1},${y1}|${x2},${y2}` : `${x2},${y2}|${x1},${y1}`

// Segments used by the original route (undirected)
const blocked = new Set<string>()
let x = 0
let y = 0
for (const d of route) {
  const [dx, dy] = STEP[d]
  blocked.add(edgeKey(x, y, x + dx, y + dy))
  x += dx
  y += dy
}

// Return moves never go north, so y stays within [0, current y]; x stays in a margin
const MOVES = ["E", "S", "W"]
const maxY = y
const minX = -route.length - 5
const maxX = route.length + 5
const inside = (px: number, py: number) => py >= 0 && py <= maxY && px >= minX && px <= maxX
const canMove = (px: number, py: number, d: string) => {
  const [dx, dy] = STEP[d]
  return inside(px + dx, py + dy) && !blocked.has(edgeKey(px, py, px + dx, py + dy))
}

// Reverse BFS from home: distance to home for every vertex
const dist = new Map<string, number>()
dist.set(key(0, 0), 0)
let frontier: [number, number][] = [[0, 0]]
while (frontier.length > 0) {
  const next: [number, number][] = []
  for (const [ux, uy] of frontier) {
    const du = dist.get(key(ux, uy))!
    for (const d of MOVES) {
      const [dx, dy] = STEP[d]
      const vx = ux - dx
      const vy = uy - dy
      if (!inside(vx, vy) || dist.has(key(vx, vy)) || !canMove(vx, vy, d)) continue
      dist.set(key(vx, vy), du + 1)
      next.push([vx, vy])
    }
  }
  frontier = next
}

// Enumerate shortest paths in alphabetical order (E < S < W)
const results: string[] = []
const walk = (px: number, py: number, path: string) => {
  const dp = dist.get(key(px, py))!
  if (dp === 0) {
    results.push(path)
    return
  }
  for (const d of MOVES) {
    if (!canMove(px, py, d)) continue
    const [dx, dy] = STEP[d]
    if (dist.get(key(px + dx, py + dy)) === dp - 1) walk(px + dx, py + dy, path + d)
  }
}
walk(x, y, "")
console.log(results.join("\n"))
