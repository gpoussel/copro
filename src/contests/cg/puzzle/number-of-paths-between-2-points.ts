// 🎮 CodinGame Puzzle - number-of-paths-between-2-points
// https://www.codingame.com/training/medium/number-of-paths-between-2-points

const rows = parseInt(readline())
const cols = parseInt(readline())
const grid: string[] = []
for (let i = 0; i < rows; i++) grid.push(readline())

const paths: number[][] = []
for (let r = 0; r < rows; r++) {
  paths.push([])
  for (let c = 0; c < cols; c++) {
    if (grid[r][c] === "1") paths[r].push(0)
    else if (r === 0 && c === 0) paths[r].push(1)
    else paths[r].push((r > 0 ? paths[r - 1][c] : 0) + (c > 0 ? paths[r][c - 1] : 0))
  }
}
console.log(paths[rows - 1][cols - 1])
