// 🎮 CodinGame Puzzle - ascii-art-the-drunken-bishop-algorithm
// https://www.codingame.com/training/easy/ascii-art-the-drunken-bishop-algorithm

const fingerprint: string = readline()
const bytes: number[] = fingerprint.split(":").map(h => parseInt(h, 16))

const W = 17
const H = 9
const counts: number[][] = Array.from({ length: H }, () => new Array<number>(W).fill(0))

let x = 8
let y = 4

for (const byte of bytes) {
  for (let i = 0; i < 4; i++) {
    const pair = (byte >> (i * 2)) & 3
    const up = (pair & 2) === 0
    const left = (pair & 1) === 0
    let nx = x + (left ? -1 : 1)
    let ny = y + (up ? -1 : 1)
    if (nx < 0) nx = 0
    if (nx > W - 1) nx = W - 1
    if (ny < 0) ny = 0
    if (ny > H - 1) ny = H - 1
    x = nx
    y = ny
    counts[y][x]++
  }
}

const symbols = " .o+=*BOX@%&#/^"

const grid: string[][] = []
for (let r = 0; r < H; r++) {
  const row: string[] = []
  for (let c = 0; c < W; c++) {
    const v = counts[r][c]
    row.push(symbols[v % symbols.length])
  }
  grid.push(row)
}

grid[4][8] = "S"
grid[y][x] = "E"

const header = "+---[CODINGAME]---+"
const footer = "+-----------------+"

const lines: string[] = [header]
for (let r = 0; r < H; r++) {
  lines.push("|" + grid[r].join("") + "|")
}
lines.push(footer)
console.log(lines.join("\n"))
