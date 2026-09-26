// 🎮 CodinGame Puzzle - thomas-and-the-freight-cars
// https://www.codingame.com/training/hard/thomas-and-the-freight-cars

// Fix the first linked car i: later front additions form an increasing
// sequence starting at i, rear additions a decreasing one, independently.
// So answer = max over i of up[i] + down[i] - 1, both O(n²) suffix DPs.
const n = parseInt(readline())
const w = readline().trim().split(/\s+/).map(Number).slice(0, n)

const up = new Array<number>(n).fill(1)
const down = new Array<number>(n).fill(1)
let best = 0
for (let i = n - 1; i >= 0; i--) {
  for (let j = i + 1; j < n; j++) {
    if (w[j] > w[i]) up[i] = Math.max(up[i], up[j] + 1)
    else if (w[j] < w[i]) down[i] = Math.max(down[i], down[j] + 1)
  }
  best = Math.max(best, up[i] + down[i] - 1)
}
console.log(best)
