// 🎮 CodinGame Puzzle - 10101
// https://www.codingame.com/training/medium/10101

const W = Number(readline())
const H = Number(readline())
const grid: string[][] = []
for (let i = 0; i < H; i++) grid.push(readline().split(""))

const rowFull = (r: number) => grid[r].every(ch => ch === "#")
const colFull = (c: number) => grid.every(row => row[c] === "#")

let best = 0
for (let r = 0; r + 1 < H; r++) {
  for (let c = 0; c + 1 < W; c++) {
    const cells: [number, number][] = [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]]
    if (cells.some(([y, x]) => grid[y][x] !== ".")) continue
    for (const [y, x] of cells) grid[y][x] = "#"
    const completed = [r, r + 1].filter(rowFull).length + [c, c + 1].filter(colFull).length
    best = Math.max(best, completed)
    for (const [y, x] of cells) grid[y][x] = "."
  }
}
console.log(best)
