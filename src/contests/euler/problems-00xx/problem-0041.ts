import utils from "../../../utils/index.js"
import { isPrime } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 41

function getPandigitalPrimeNumbers(length: number) {
  const digits = Array.from({ length }, (_, i) => i + 1)
  const primePandigitalNumbers = []
  const permutations = utils.iterate.permutations(digits)
  for (const permutation of permutations) {
    const number = +permutation.join("")
    if (isPrime(number)) {
      primePandigitalNumbers.push(number)
    }
  }
  return primePandigitalNumbers
}

export function solve() {
  for (let i = 9; i > 0; i--) {
    const pandigitalPrimes = getPandigitalPrimeNumbers(i)
    if (pandigitalPrimes.length > 0) {
      return utils.iterate.max(pandigitalPrimes)
    }
  }
}
