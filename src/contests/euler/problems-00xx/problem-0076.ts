import { range } from "../../../utils/iterate.js"

// 🧮 Project Euler - Problem 76

const MAX = 100

export function solve() {
  // OEIS A000041
  // a(n) is the number of partitions of n (the partition numbers).
  const dp = new Array<number>(MAX + 1).fill(0)
  const coins = range(1, MAX)
  dp[0] = 1
  for (const coin of coins) {
    for (const amount of range(coin, MAX + 1)) {
      dp[amount] += dp[amount - coin]
    }
  }
  return dp[MAX]
}
