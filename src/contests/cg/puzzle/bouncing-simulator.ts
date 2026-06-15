// 🎮 CodinGame Puzzle - bouncing-simulator
// https://www.codingame.com/

const w: number = parseInt(readline(), 10)
const h: number = parseInt(readline(), 10)
const n: number = parseInt(readline(), 10)

const grid: number[][] = Array.from({ length: h }, () => new Array<number>(w).fill(0))

let r = 0
let c = 0
let dr = 1
let dc = 1
grid[r][c]++

let hits = 0
while (hits < n) {
  let bounce = false
  if (c + dc < 0 || c + dc >= w) {
    dc = -dc
    bounce = true
  }
  if (r + dr < 0 || r + dr >= h) {
    dr = -dr
    bounce = true
  }

  if (bounce) {
    hits++
    if (hits >= n) break
  }

  let nc = c + dc
  let nr = r + dr
  if (nc < 0 || nc >= w) nc = c
  if (nr < 0 || nr >= h) nr = r
  c = nc
  r = nr
  grid[r][c]++
}

const border: string = "#".repeat(w + 2)
const lines: string[] = [border]
for (let i = 0; i < h; i++) {
  let line = "#"
  for (let j = 0; j < w; j++) {
    line += grid[i][j] > 0 ? String(grid[i][j]) : " "
  }
  line += "#"
  lines.push(line)
}
lines.push(border)
console.log(lines.join("\n"))
