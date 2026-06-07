// 🎮 CodinGame Puzzle - there-is-no-spoon-episode-1
// https://www.codingame.com/training/medium/there-is-no-spoon-episode-1

const width: number = parseInt(readline())
const height: number = parseInt(readline())
const grid: string[] = []

for (let i = 0; i < height; i++) {
  grid.push(readline())
}

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (grid[y][x] === "0") {
      // Find right neighbor
      let rx = -1
      let ry = -1
      for (let nx = x + 1; nx < width; nx++) {
        if (grid[y][nx] === "0") {
          rx = nx
          ry = y
          break
        }
      }

      // Find bottom neighbor
      let bx = -1
      let by = -1
      for (let ny = y + 1; ny < height; ny++) {
        if (grid[ny][x] === "0") {
          bx = x
          by = ny
          break
        }
      }

      console.log(`${x} ${y} ${rx} ${ry} ${bx} ${by}`)
    }
  }
}
