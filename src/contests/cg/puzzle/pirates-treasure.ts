// 🎮 CodinGame Puzzle - pirates-treasure
// https://www.codingame.com/training/easy/pirates-treasure

const W = parseInt(readline())
const H = parseInt(readline())

const grid: number[][] = []
for (let y = 0; y < H; y++) {
  grid.push(readline().split(" ").map(Number))
}

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (grid[y][x] !== 0) continue

    // Check all 8 neighbors (only those within bounds)
    let allObstacles = true
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dy === 0 && dx === 0) continue
        const ny = y + dy
        const nx = x + dx
        if (ny < 0 || ny >= H || nx < 0 || nx >= W) continue
        if (grid[ny][nx] !== 1) {
          allObstacles = false
          break
        }
      }
      if (!allObstacles) break
    }

    if (allObstacles) {
      console.log(`${x} ${y}`)
    }
  }
}
