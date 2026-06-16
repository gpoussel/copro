// 🎮 CodinGame Puzzle - cubic-bezier-curves
// https://www.codingame.com/training/easy/cubic-bezier-curves

const [width, height] = readline().split(" ").map(Number)
const steps = Number(readline())
const [ax, ay] = readline().split(" ").map(Number)
const [bx, by] = readline().split(" ").map(Number)
const [cx, cy] = readline().split(" ").map(Number)
const [dx, dy] = readline().split(" ").map(Number)

const lerp = (p: number, q: number, t: number): number => p * (1 - t) + q * t

const grid: string[][] = []
for (let y = 0; y < height; y++) {
  const row: string[] = new Array<string>(width).fill(" ")
  row[0] = "."
  grid.push(row)
}

for (let i = 0; i < steps; i++) {
  const t = i / (steps - 1)
  const abx = lerp(ax, bx, t)
  const aby = lerp(ay, by, t)
  const bcx = lerp(bx, cx, t)
  const bcy = lerp(by, cy, t)
  const cdx = lerp(cx, dx, t)
  const cdy = lerp(cy, dy, t)
  const abcx = lerp(abx, bcx, t)
  const abcy = lerp(aby, bcy, t)
  const bcdx = lerp(bcx, cdx, t)
  const bcdy = lerp(bcy, cdy, t)
  const px = lerp(abcx, bcdx, t)
  const py = lerp(abcy, bcdy, t)
  const rx = Math.floor(px + 0.5)
  const ry = Math.floor(py + 0.5)
  if (rx >= 0 && rx < width && ry >= 0 && ry < height) {
    grid[ry][rx] = "#"
  }
}

const lines: string[] = []
for (let y = height - 1; y >= 0; y--) {
  lines.push(grid[y].join("").replace(/\s+$/, ""))
}
console.log(lines.join("\n"))
