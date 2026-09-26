// 🎮 CodinGame Puzzle - pixel-polygons
// https://www.codingame.com/training/medium/pixel-polygons

const gridSize = parseInt(readline())
const grid: string[] = []
for (let i = 0; i < gridSize; i++) grid.push(readline())

const black = (r: number, c: number): number =>
  r >= 0 && r < gridSize && c >= 0 && c < gridSize && grid[r][c] === "#" ? 1 : 0

// A rectilinear polygon has as many sides as corners; inspect every lattice point's 2x2 window
let corners = 0
for (let r = 0; r <= gridSize; r++) {
  for (let c = 0; c <= gridSize; c++) {
    const a = black(r - 1, c - 1)
    const b = black(r - 1, c)
    const d = black(r, c - 1)
    const e = black(r, c)
    const sum = a + b + d + e
    if (sum === 1 || sum === 3) corners++
    else if (sum === 2 && a === e) corners += 2 // diagonal touch
  }
}
console.log(corners)
