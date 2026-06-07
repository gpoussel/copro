// 🎮 CodinGame Puzzle - a-bunny-and-carrots
// https://www.codingame.com/training/easy/a-bunny-and-carrots

const [M, N] = readline().split(" ").map(Number)
const T = parseInt(readline())
const choices = readline().split(" ").map(Number)

// heights[i] = number of carrots remaining in column i (0-indexed)
const heights: number[] = new Array(N).fill(M)

function computePerimeter(h: number[], n: number): number {
  // Count columns with at least one carrot
  let filledCols = 0
  for (let i = 0; i < n; i++) {
    if (h[i] > 0) filledCols++
  }

  // Top + Bottom edges
  const topBottom = 2 * filledCols

  // Vertical edges: left boundary + transitions + right boundary
  let vertical = h[0] + h[n - 1]
  for (let i = 1; i < n; i++) {
    vertical += Math.abs(h[i] - h[i - 1])
  }

  return topBottom + vertical
}

for (let t = 0; t < T; t++) {
  const col = choices[t] - 1 // convert to 0-indexed
  heights[col]--
  console.log(computePerimeter(heights, N))
}
