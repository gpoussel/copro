// 🎮 CodinGame Puzzle - treasure-hunt
// https://www.codingame.com/training/easy/treasure-hunt

const [H, W] = readline().split(" ").map(Number)
const grid: string[] = []
let startR = 0,
  startC = 0

for (let r = 0; r < H; r++) {
  const row = readline()
  grid.push(row)
  for (let c = 0; c < W; c++) {
    if (row[c] === "X") {
      startR = r
      startC = c
    }
  }
}

// Maximum gold collection via DFS with backtracking
// Each cell can only be visited once
// Grid is at most 100x100, but walls create smaller reachable areas

const visited = Array.from({ length: H }, () => new Array(W).fill(false))
const dirs = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

let maxGold = 0

function dfs(r: number, c: number, gold: number) {
  if (gold > maxGold) maxGold = gold

  for (const [dr, dc] of dirs) {
    const nr = r + dr
    const nc = c + dc
    if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue
    if (visited[nr][nc]) continue
    const cell = grid[nr][nc]
    if (cell === "#") continue

    const cellGold = cell >= "1" && cell <= "9" ? parseInt(cell) : 0
    visited[nr][nc] = true
    dfs(nr, nc, gold + cellGold)
    visited[nr][nc] = false
  }
}

visited[startR][startC] = true
dfs(startR, startC, 0)

console.log(maxGold)
