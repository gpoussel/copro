// 🎮 CodinGame Puzzle - largest-binary-rectangle
// https://www.codingame.com/training/medium/largest-binary-rectangle

const [width, height] = readline().split(" ").map(Number)

// For each row, heights[c] = number of consecutive 1s ending at this row in column c;
// the best rectangle with its bottom on this row is the largest rectangle in that histogram.
const heights: number[] = new Array(width).fill(0)
let best = 0
for (let r = 0; r < height; r++) {
  const row = readline().trim().split(/\s+/).map(Number)
  for (let c = 0; c < width; c++) heights[c] = row[c] === 1 ? heights[c] + 1 : 0
  for (let left = 0; left < width; left++) {
    let minHeight = Infinity
    for (let right = left; right < width && heights[right] > 0; right++) {
      minHeight = Math.min(minHeight, heights[right])
      best = Math.max(best, minHeight * (right - left + 1))
    }
  }
}
console.log(best)
