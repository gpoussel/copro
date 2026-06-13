// 🎮 CodinGame Puzzle - island-escape
// https://www.codingame.com/

const N = Number(readline())
const grid: number[][] = []
for (let i = 0; i < N; i++) grid.push(readline().split(" ").map(Number))

const mid = (N - 1) / 2
const seen: boolean[][] = Array.from({ length: N }, () => new Array(N).fill(false))
const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

// Flood from the middle; a step is allowed only when the elevation change is
// at most one. Reaching any ocean (elevation 0) plot means escape is possible.
const stack: [number, number][] = [[mid, mid]]
seen[mid][mid] = true
let escaped = grid[mid][mid] === 0
while (stack.length > 0 && !escaped) {
  const [y, x] = stack.pop()!
  for (const [dy, dx] of dirs) {
    const ny = y + dy
    const nx = x + dx
    if (ny < 0 || ny >= N || nx < 0 || nx >= N || seen[ny][nx]) continue
    if (Math.abs(grid[ny][nx] - grid[y][x]) > 1) continue
    seen[ny][nx] = true
    if (grid[ny][nx] === 0) {
      escaped = true
      break
    }
    stack.push([ny, nx])
  }
}

console.log(escaped ? "yes" : "no")
