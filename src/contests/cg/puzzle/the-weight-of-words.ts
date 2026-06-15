// 🎮 CodinGame Puzzle - the-weight-of-words
// https://www.codingame.com/training/easy/the-weight-of-words

const steps = parseInt(readline())
const h = parseInt(readline())
const w = parseInt(readline())
let grid: string[][] = []
for (let i = 0; i < h; i++) grid.push(readline().split(""))

function weight(chars: string[]): number {
  let s = 0
  for (const c of chars) s += c.charCodeAt(0)
  return s
}

for (let step = 0; step < steps; step++) {
  const newGrid: string[][] = Array.from({ length: h }, () => new Array<string>(w))
  for (let c = 0; c < w; c++) {
    const col: string[] = []
    for (let r = 0; r < h; r++) col.push(grid[r][c])
    const shift = weight(col) % h
    for (let r = 0; r < h; r++) {
      newGrid[(r + shift) % h][c] = col[r]
    }
  }
  grid = newGrid
  for (let r = 0; r < h; r++) {
    const row = grid[r]
    const shift = weight(row) % w
    const nr = new Array<string>(w)
    for (let c = 0; c < w; c++) {
      nr[(c + shift) % w] = row[c]
    }
    grid[r] = nr
  }
}

console.log(grid.map(r => r.join("")).join("\n"))
