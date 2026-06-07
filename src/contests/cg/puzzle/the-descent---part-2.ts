// 🎮 CodinGame Puzzle - the-descent---part-2
// https://www.codingame.com/training/easy/the-descent---part-2

const [w, h] = readline().split(" ").map(Number)
const grid: number[][] = []
for (let r = 0; r < h; r++) {
  grid.push(readline().split(" ").map(Number))
}
const [a, b] = readline().split(" ").map(Number)
const t = Number(readline())

// Compute the cost to level a rectangle of size rows x cols starting at (row, col)
// Cost = sum of (cell - min_in_rect) for all cells in the rect
// We need to try both orientations: a rows x b cols, and b rows x a cols
// For each valid position, cost = sum(cells) - min(cells) * (rows * cols)

function computeMinShots(rows: number, cols: number): number {
  if (rows > h || cols > w) return Infinity

  // Build 2D prefix sums for efficient rectangle sum queries
  const prefix: number[][] = Array.from({ length: h + 1 }, () => new Array(w + 1).fill(0))
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      prefix[r + 1][c + 1] = grid[r][c] + prefix[r][c + 1] + prefix[r + 1][c] - prefix[r][c]
    }
  }

  const rectSum = (r1: number, c1: number, r2: number, c2: number): number => {
    // Sum of [r1..r2-1][c1..c2-1]
    return prefix[r2][c2] - prefix[r1][c2] - prefix[r2][c1] + prefix[r1][c1]
  }

  let minShots = Infinity

  for (let r = 0; r <= h - rows; r++) {
    for (let c = 0; c <= w - cols; c++) {
      // Find min in this rectangle
      let minVal = Infinity
      for (let dr = 0; dr < rows; dr++) {
        for (let dc = 0; dc < cols; dc++) {
          minVal = Math.min(minVal, grid[r + dr][c + dc])
        }
      }
      const sum = rectSum(r, c, r + rows, c + cols)
      const shots = sum - minVal * (rows * cols)
      minShots = Math.min(minShots, shots)
    }
  }

  return minShots
}

// Try both orientations
let minShots = Math.min(computeMinShots(a, b), computeMinShots(b, a))

if (minShots <= t) {
  console.log(minShots)
} else {
  console.log("Not Possible")
}
