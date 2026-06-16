// 🎮 CodinGame Puzzle - peaks-and-valleys-in-2d-grid
// https://www.codingame.com/training/easy/peaks-and-valleys-in-2d-grid

const h: number = parseInt(readline(), 10)
const grid: number[][] = []
for (let i = 0; i < h; i++) {
  grid.push(readline().trim().split(/\s+/).map(Number))
}

const peaks: string[] = []
const valleys: string[] = []

for (let y = 0; y < h; y++) {
  for (let x = 0; x < grid[y].length; x++) {
    const v: number = grid[y][x]
    let isPeak: boolean = true
    let isValley: boolean = true
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const ny: number = y + dy
        const nx: number = x + dx
        if (ny < 0 || ny >= h || nx < 0 || nx >= grid[ny].length) continue
        const n: number = grid[ny][nx]
        if (n >= v) isPeak = false
        if (n <= v) isValley = false
      }
    }
    if (isPeak) peaks.push(`(${x}, ${y})`)
    if (isValley) valleys.push(`(${x}, ${y})`)
  }
}

console.log(peaks.length ? peaks.join(", ") : "NONE")
console.log(valleys.length ? valleys.join(", ") : "NONE")
