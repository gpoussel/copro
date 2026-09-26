// 🎮 CodinGame Puzzle - various-number-spirals
// https://www.codingame.com/training/medium/various-number-spirals

const n = parseInt(readline())
const [v, h] = readline().split(" ")
const [order, direction] = readline().split(" ")
const clockwise = direction === "c"

// Directions in clockwise order: right, down, left, up
const DR = [0, 1, 0, -1]
const DC = [1, 0, -1, 0]
// Initial direction when walking clockwise from each corner
const CW_START: { [corner: string]: number } = { tl: 0, tr: 1, br: 2, bl: 3 }
const corner = v + h
let dir = clockwise ? CW_START[corner] : (CW_START[corner] + 1) % 4
const turn = clockwise ? 1 : 3

const grid: number[][] = []
for (let i = 0; i < n; i++) grid.push(new Array<number>(n).fill(0))
let r = v === "t" ? 0 : n - 1
let c = h === "l" ? 0 : n - 1
for (let k = 0; k < n * n; k++) {
  grid[r][c] = order === "+" ? k + 1 : n * n - k
  if (k === n * n - 1) break
  let nr = r + DR[dir]
  let nc = c + DC[dir]
  if (nr < 0 || nr >= n || nc < 0 || nc >= n || grid[nr][nc]) {
    dir = (dir + turn) % 4
    nr = r + DR[dir]
    nc = c + DC[dir]
  }
  r = nr
  c = nc
}

for (const row of grid) console.log(row.join("\t"))
