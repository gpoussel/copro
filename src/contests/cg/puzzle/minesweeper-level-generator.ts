// 🎮 CodinGame Puzzle - minesweeper-level-generator
// https://www.codingame.com/training/easy/minesweeper-level-generator

const line: string = readline()
const parts = line.split(/\s+/).map(s => parseInt(s, 10))
const [width, height, n, fx, fy, seed] = parts

let r = seed >>> 0
function next(): number {
  const mul = Math.imul(214013, r) >>> 0
  r = (mul + 2531011) >>> 0
  r = (r / 65536) >>> 0
  return r
}

const grid: boolean[][] = []
for (let y = 0; y < height; y++) {
  grid.push(new Array<boolean>(width).fill(false))
}

function isFree(x: number, y: number): boolean {
  return Math.abs(x - fx) <= 1 && Math.abs(y - fy) <= 1
}

let placed = 0
while (placed < n) {
  const x = next() % width
  const y = next() % height
  if (grid[y][x]) continue
  if (isFree(x, y)) continue
  grid[y][x] = true
  placed++
}

const out: string[] = []
for (let y = 0; y < height; y++) {
  let row = ""
  for (let x = 0; x < width; x++) {
    if (grid[y][x]) {
      row += "#"
    } else {
      let c = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          const ny = y + dy,
            nx = x + dx
          if (ny >= 0 && ny < height && nx >= 0 && nx < width && grid[ny][nx]) c++
        }
      }
      row += c === 0 ? "." : String(c)
    }
  }
  out.push(row)
}
console.log(out.join("\n"))
