// 🎮 CodinGame Puzzle - moves-in-maze
// https://www.codingame.com/

const [w, h] = readline().split(" ").map(Number)
const grid: string[] = []
for (let i = 0; i < h; i++) grid.push(readline())

const dist: number[][] = Array.from({ length: h }, () => new Array(w).fill(-1))

let sx = 0
let sy = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (grid[y][x] === "S") {
      sx = x
      sy = y
    }
  }
}

// BFS on a periodic (toroidal) grid.
dist[sy][sx] = 0
let frontier: [number, number][] = [[sx, sy]]
const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
while (frontier.length > 0) {
  const next: [number, number][] = []
  for (const [x, y] of frontier) {
    for (const [dx, dy] of dirs) {
      const nx = (x + dx + w) % w
      const ny = (y + dy + h) % h
      if (grid[ny][nx] !== "#" && dist[ny][nx] === -1) {
        dist[ny][nx] = dist[y][x] + 1
        next.push([nx, ny])
      }
    }
  }
  frontier = next
}

const out: string[] = []
for (let y = 0; y < h; y++) {
  let line = ""
  for (let x = 0; x < w; x++) {
    if (grid[y][x] === "#") line += "#"
    else if (dist[y][x] === -1) line += "."
    else line += dist[y][x].toString(36).toUpperCase()
  }
  out.push(line)
}

console.log(out.join("\n"))
