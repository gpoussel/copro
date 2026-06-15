// 🎮 CodinGame Puzzle - diagonal-achoo
// https://www.codingame.com/training/easy/diagonal-achoo

const n: number = parseInt(readline(), 10)
const g: number = parseInt(readline(), 10)

const diagonals: [number, number][] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
]

let bestIndex: number = 0
let bestCount: number = -1
let bestGrid: string[] = []

for (let k = 0; k < g; k++) {
  const grid: string[][] = []
  for (let i = 0; i < n; i++) {
    grid.push(readline().split(""))
  }

  let frontier: [number, number][] = []
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === "C") {
        frontier.push([i, j])
      }
    }
  }

  while (frontier.length > 0) {
    const next: [number, number][] = []
    for (const [i, j] of frontier) {
      for (const [di, dj] of diagonals) {
        const ni = i + di
        const nj = j + dj
        if (ni < 0 || ni >= n || nj < 0 || nj >= n) {
          continue
        }
        if (grid[ni][nj] === ".") {
          grid[ni][nj] = "C"
          next.push([ni, nj])
        }
      }
    }
    frontier = next
  }

  let count: number = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === "C") {
        count++
      }
    }
  }

  if (count > bestCount) {
    bestCount = count
    bestIndex = k
    bestGrid = grid.map(row => row.join(""))
  }
}

console.log(bestIndex)
console.log(bestGrid.join("\n"))
