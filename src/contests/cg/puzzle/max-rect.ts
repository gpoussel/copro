// 🎮 CodinGame Puzzle - max-rect
// https://www.codingame.com/training/hard/max-rect

// Classic O(H²·W): fix the top and bottom rows, accumulate column sums between
// them and run Kadane's maximum subarray on those sums.

const [w, h] = readline().split(" ").map(Number)
const grid: number[][] = []
for (let i = 0; i < h; i++) grid.push(readline().trim().split(/\s+/).map(Number))

let best = -Infinity
const col = new Array<number>(w)
for (let top = 0; top < h; top++) {
  col.fill(0)
  for (let bottom = top; bottom < h; bottom++) {
    let run = 0
    for (let x = 0; x < w; x++) {
      col[x] += grid[bottom][x]
      run = Math.max(run + col[x], col[x])
      if (run > best) best = run
    }
  }
}
console.log(best)
