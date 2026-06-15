// 🎮 CodinGame Puzzle - longest-coast
// https://www.codingame.com/training/easy/longest-coast

const n: number = parseInt(readline(), 10)
const grid: string[] = []
for (let i = 0; i < n; i++) {
  grid.push(readline())
}

const visited: boolean[][] = Array.from({ length: n }, () => new Array<boolean>(n).fill(false))
const dirs: number[][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

let bestIndex: number = 0
let bestCoast: number = -1
let islandIndex: number = 0

for (let r = 0; r < n; r++) {
  for (let c = 0; c < n; c++) {
    if (grid[r][c] !== "#" || visited[r][c]) {
      continue
    }
    islandIndex++
    const water: Set<string> = new Set<string>()
    const stack: number[][] = [[r, c]]
    visited[r][c] = true
    while (stack.length > 0) {
      const cell: number[] = stack.pop() as number[]
      const cr: number = cell[0]
      const cc: number = cell[1]
      for (const d of dirs) {
        const nr: number = cr + d[0]
        const nc: number = cc + d[1]
        if (nr < 0 || nr >= n || nc < 0 || nc >= n) {
          continue
        }
        if (grid[nr][nc] === "~") {
          water.add(nr + "," + nc)
        } else if (!visited[nr][nc]) {
          visited[nr][nc] = true
          stack.push([nr, nc])
        }
      }
    }
    const coast: number = water.size
    if (coast > bestCoast) {
      bestCoast = coast
      bestIndex = islandIndex
    }
  }
}

console.log(bestIndex + " " + bestCoast)
