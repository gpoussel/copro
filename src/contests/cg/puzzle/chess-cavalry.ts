// 🎮 CodinGame Puzzle - chess-cavalry
// https://www.codingame.com/training/hard/chess-cavalry

const [W, H] = readline().split(" ").map(Number)
const grid: string[] = []
for (let i = 0; i < H; i++) {
  grid.push(readline())
}
let bx = 0,
  by = 0,
  ex = 0,
  ey = 0
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const c = grid[y][x]
    if (c === "B") {
      bx = x
      by = y
    } else if (c === "E") {
      ex = x
      ey = y
    }
  }
}

const moves: [number, number][] = [
  [1, 2],
  [2, 1],
  [-1, 2],
  [-2, 1],
  [1, -2],
  [2, -1],
  [-1, -2],
  [-2, -1],
]

const dist: number[][] = Array.from({ length: H }, () => new Array(W).fill(-1))
dist[by][bx] = 0
let queue: [number, number][] = [[bx, by]]
while (queue.length > 0) {
  const next: [number, number][] = []
  for (const [x, y] of queue) {
    for (const [dx, dy] of moves) {
      const nx = x + dx,
        ny = y + dy
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue
      if (grid[ny][nx] === "#") continue
      if (dist[ny][nx] !== -1) continue
      dist[ny][nx] = dist[y][x] + 1
      next.push([nx, ny])
    }
  }
  queue = next
}

const r = dist[ey][ex]
console.log(r === -1 ? "Impossible" : String(r))
