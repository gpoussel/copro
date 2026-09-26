// 🎮 CodinGame Puzzle - chained-matrix-products
// https://www.codingame.com/training/medium/chained-matrix-products

const n = parseInt(readline())
// Matrix i has dimensions dims[i] x dims[i + 1]
const dims: number[] = []
for (let i = 0; i < n; i++) {
  const [row, col] = readline().split(" ").map(Number)
  if (i === 0) dims.push(row)
  dims.push(col)
}

// cost[i][j] = least multiplications to compute the product of matrices i..j
const cost: number[][] = []
for (let i = 0; i < n; i++) cost.push(new Array<number>(n).fill(0))
for (let length = 2; length <= n; length++) {
  for (let i = 0; i + length - 1 < n; i++) {
    const j = i + length - 1
    let best = Infinity
    for (let k = i; k < j; k++) {
      best = Math.min(best, cost[i][k] + cost[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1])
    }
    cost[i][j] = best
  }
}
console.log(cost[0][n - 1])
