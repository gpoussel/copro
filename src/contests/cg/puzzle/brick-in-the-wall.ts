// 🎮 CodinGame Puzzle - brick-in-the-wall
// https://www.codingame.com/training/easy/brick-in-the-wall

const X = parseInt(readline())
const N = parseInt(readline())
const weights = readline().split(" ").map(Number)

// Sort bricks descending by weight — heaviest go in the lowest rows
weights.sort((a, b) => b - a)

// Assign each brick to its row (1-indexed from the floor).
// Fill row 1 with up to X bricks, row 2 with up to X bricks, etc.
// Since each row can have at most X and at most as many as the row below,
// the optimal strategy is to fill every row fully with X bricks
// (the last row may have fewer) and place the heaviest bricks at the bottom.
// This minimises total work because heavier bricks get the smallest (L-1) multiplier.

let totalWork = 0
const g = 10
const heightPerRow = 6.5 / 100 // in meters

for (let i = 0; i < N; i++) {
  const row = Math.floor(i / X) + 1 // row index, 1-based
  const m = weights[i]
  const work = (row - 1) * heightPerRow * g * m
  totalWork += work
}

console.log(totalWork.toFixed(3))
