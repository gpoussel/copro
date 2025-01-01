// 🧮 Project Euler - Problem 53

const FACTORIALS = [1n]

export function solve() {
  for (let n = 1; n <= 100; n++) {
    FACTORIALS[n] = FACTORIALS[n - 1] * BigInt(n)
  }
  let count = 0
  for (let n = 1; n <= 100; ++n) {
    for (let r = 1; r <= n; ++r) {
      if (FACTORIALS[n] / (FACTORIALS[r] * FACTORIALS[n - r]) > 1_000_000n) {
        count++
      }
    }
  }
  return count
}
