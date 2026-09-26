// 🎮 CodinGame Puzzle - thermal-flying---episode-1
// https://www.codingame.com/training/medium/thermal-flying---episode-1

const width = Number(readline())
const height = Number(readline())
const t = Number(readline())

// thermal[y][x] with y = 0 at the bottom; cells are ".", "V" or a signed digit
const thermal: number[][] = []
let x = 0
let y = 0
for (let row = 0; row < height; row++) {
  const cells = readline().match(/-?\d|[^-\d]/g) || []
  const line: number[] = []
  cells.forEach((cell, col) => {
    if (cell === "V") {
      x = col
      y = height - 1 - row
    }
    line.push(/\d/.test(cell) ? Number(cell) : 0)
  })
  thermal[height - 1 - row] = line
}

for (let step = 0; step < t; step++) {
  const nx = x + 1
  let ny = y - 1
  if (nx >= width || ny < 0 || ny >= height) break
  ny += thermal[ny][nx] || 0
  if (ny < 0 || ny >= height) break
  x = nx
  y = ny
}
console.log(`${x} ${y}`)
