import { factorization } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 47

export function solve() {
  for (let i = 2; i < 1_000_000; i++) {
    const factors1 = factorization(i)
    if (new Set(factors1).size !== 4) {
      continue
    }
    const factors2 = factorization(i + 1)
    if (new Set(factors2).size !== 4) {
      i += 1
      continue
    }
    const factors3 = factorization(i + 2)
    if (new Set(factors3).size !== 4) {
      i += 2
      continue
    }
    const factors4 = factorization(i + 3)
    if (new Set(factors4).size !== 4) {
      i += 3
      continue
    }
    return i
  }
}
