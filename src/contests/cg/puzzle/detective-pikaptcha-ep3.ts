// 🎮 CodinGame Puzzle - detective-pikaptcha-ep3
// https://www.codingame.com/training/medium/detective-pikaptcha-ep3

let first = readline().trim().split(/\s+/)
// Some harnesses prefix the input with a question number: skip it
if (first.length < 2) first = readline().trim().split(/\s+/)
const [width, height] = first.map(Number)
const grid: string[][] = []
for (let i = 0; i < height; i++) grid.push(readline().split(""))
const side = readline().trim()

// Directions: 0 up, 1 right, 2 down, 3 left
const DR = [-1, 0, 1, 0]
const DC = [0, 1, 0, -1]
const ARROWS = "^>v<"

let sr = 0
let sc = 0
let dir = 0
const counts: number[][] = grid.map(row => row.map(() => 0))
for (let r = 0; r < height; r++) {
  for (let c = 0; c < width; c++) {
    const k = ARROWS.indexOf(grid[r][c])
    if (k >= 0) {
      sr = r
      sc = c
      dir = k
      grid[r][c] = "0"
    }
  }
}

// Möbius strip: horizontal wrap is plain; crossing the top/bottom border lands
// on the other half of the grid (shifted by width/2), on the opposite border.
const half = Math.floor(width / 2)
const step = (r: number, c: number, d: number): [number, number] => {
  let nr = r + DR[d]
  let nc = (c + DC[d] + width) % width
  if (nr < 0) {
    nr = height - 1
    nc = (nc + half) % width
  } else if (nr >= height) {
    nr = 0
    nc = (nc + half) % width
  }
  return [nr, nc]
}

const turns = side === "L" ? [3, 0, 1, 2] : [1, 0, 3, 2]
let r = sr
let c = sc
for (;;) {
  let moved = false
  for (const t of turns) {
    const nd = (dir + t) % 4
    const [nr, nc] = step(r, c, nd)
    if (grid[nr][nc] !== "#") {
      r = nr
      c = nc
      dir = nd
      counts[r][c]++
      moved = true
      break
    }
  }
  if (!moved || (r === sr && c === sc)) break
}

for (let i = 0; i < height; i++) {
  console.log(grid[i].map((ch, j) => (ch === "#" ? "#" : String(counts[i][j]))).join(""))
}
