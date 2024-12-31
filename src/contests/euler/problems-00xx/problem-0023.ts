import { sumOfDivisors } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 23

const LIMIT = 28123

function getAbundantNumbers(limit: number): number[] {
  const abundantNumbers = []
  for (let i = 1; i <= limit; i++) {
    if (sumOfDivisors(i) > i * 2) {
      abundantNumbers.push(i)
    }
  }
  return abundantNumbers
}

export function solve() {
  const abundantNumbers = getAbundantNumbers(LIMIT)
  const abundantSums = new Set<number>()
  for (let i = 0; i < abundantNumbers.length; i++) {
    for (let j = i; j < abundantNumbers.length; j++) {
      abundantSums.add(abundantNumbers[i] + abundantNumbers[j])
    }
  }
  let sum = 0
  for (let i = 1; i <= LIMIT; i++) {
    if (!abundantSums.has(i)) {
      sum += i
    }
  }
  return sum
}
