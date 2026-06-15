// 🎮 CodinGame Puzzle - snake-encoding
// https://www.codingame.com/training/medium/snake-encoding

const n: number = parseInt(readline())
const x: number = parseInt(readline())
let grid: string[][] = []
for (let i = 0; i < n; i++) grid.push(readline().split(""))

// Snake path: column by column. Even columns go upward (bottom->top),
// odd columns go downward (top->bottom), starting at the bottom-left corner.
const path: [number, number][] = []
for (let col = 0; col < n; col++) {
  if (col % 2 === 0) {
    for (let row = n - 1; row >= 0; row--) path.push([row, col])
  } else {
    for (let row = 0; row < n; row++) path.push([row, col])
  }
}

// Each round is a cyclic shift along the path, so the period is path length.
const L = path.length
const rounds = x % L
for (let t = 0; t < rounds; t++) {
  const next: string[][] = grid.map(r => r.slice())
  for (let i = 0; i < L; i++) {
    const [r, c] = path[i]
    const [pr, pc] = path[(i - 1 + L) % L]
    next[r][c] = grid[pr][pc]
  }
  grid = next
}

console.log(grid.map(r => r.join("")).join("\n"))
