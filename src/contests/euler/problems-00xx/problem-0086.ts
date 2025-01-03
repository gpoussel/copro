// 🧮 Project Euler - Problem 86

const MAX = 10

function shortestPath(a: number, b: number, c: number) {
  return Math.sqrt((a + b) ** 2 + c ** 2)
}

export function solve() {
  let max = 2_000
  let dp = new Array(max).fill(0)
  for (let a = 1; a < max; ++a) {
    for (let b = a; b < max; ++b) {
      for (let c = b; c < max; ++c) {
        const s = shortestPath(a, b, c)
        if (Number.isInteger(s)) {
          dp[c]++
        }
      }
    }
  }
  let sum = 0
  for (let i = 0; i < max; ++i) {
    sum += dp[i]
    if (sum > 1_000_000) {
      return i
    }
  }
}
