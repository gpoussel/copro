import { sieveOfEratosthene } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 46

const MAX = 10_000

function squares(n: number): Set<number> {
  const result = new Set<number>()
  for (let i = 1; i * i <= n; i++) {
    result.add(i * i)
  }
  return result
}

export function solve() {
  const primesSet = new Set(sieveOfEratosthene(MAX))
  const squaresSet = squares(MAX)
  for (let i = 9; i < MAX; i += 2) {
    if (primesSet.has(i)) {
      continue
    }
    let found = false
    for (const square of squaresSet) {
      const diff = i - 2 * square
      if (diff <= 0) {
        break
      }
      if (primesSet.has(diff)) {
        found = true
        break
      }
    }
    if (!found) {
      return i
    }
  }

  return
}
