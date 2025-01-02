import { range } from "../../../utils/iterate.js"
import { sieveOfEratosthene } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 77

const MAX = 100

export function solve() {
  const dp = new Array<number>(MAX + 1).fill(0)
  const primes = sieveOfEratosthene(MAX)
  dp[0] = 1
  for (const coin of primes) {
    for (const amount of range(coin, MAX + 1)) {
      dp[amount] += dp[amount - coin]
    }
  }
  for (const [index, count] of dp.entries()) {
    if (count > 5000) {
      return index
    }
  }
}
