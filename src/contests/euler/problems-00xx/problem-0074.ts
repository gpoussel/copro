import { DIGIT_FACTORIALS, digits } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 74

function getNumberOfNonRepeatingTerms(n: number): number {
  let current = n
  const seen = new Set<number>()
  while (!seen.has(current)) {
    seen.add(current)
    current = digits(current).reduce((acc, cur) => acc + DIGIT_FACTORIALS[cur], 0)
  }
  return seen.size
}

export function solve() {
  let count = 0
  for (let i = 1; i < 1_000_000; ++i) {
    if (getNumberOfNonRepeatingTerms(i) === 60) {
      ++count
    }
  }
  return count
}
