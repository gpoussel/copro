// 🎮 CodinGame Puzzle - shape-outline
// https://www.codingame.com/training/medium/shape-outline

const H = parseInt(readline())
const W = parseInt(readline())
const S = parseInt(readline())
const grid: string[] = []
for (let i = 0; i < H; i++) grid.push(readline())
const filled = (r: number, c: number): boolean => r >= 0 && c >= 0 && r < H && c < W && grid[r][c] === "#"

// Clockwise boundary edges: from vertex (x, y) to the next vertex
const next = new Map<string, [number, number]>()
const key = (x: number, y: number): string => `${x},${y}`
for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    if (!filled(r, c)) continue
    if (!filled(r - 1, c)) next.set(key(c, r), [c + 1, r])
    if (!filled(r, c + 1)) next.set(key(c + 1, r), [c + 1, r + 1])
    if (!filled(r + 1, c)) next.set(key(c + 1, r + 1), [c, r + 1])
    if (!filled(r, c - 1)) next.set(key(c, r + 1), [c, r])
  }
}

let startRow = 0
while (grid[startRow].indexOf("#") < 0) startRow++
const start: [number, number] = [grid[startRow].indexOf("#"), startRow]

// Walk the outline, keeping only the vertices where the direction changes
const path: [number, number][] = [start]
let current = next.get(key(start[0], start[1]))!
while (current[0] !== start[0] || current[1] !== start[1]) {
  path.push(current)
  current = next.get(key(current[0], current[1]))!
}
const m = path.length
for (let i = 0; i < m; i++) {
  const [px, py] = path[(i + m - 1) % m]
  const [x, y] = path[i]
  const [nx, ny] = path[(i + 1) % m]
  if ((x - px) * (ny - y) - (y - py) * (nx - x) !== 0) console.log(`${x * S} ${y * S}`)
}
