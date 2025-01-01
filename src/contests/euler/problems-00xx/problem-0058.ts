// 🧮 Project Euler - Problem 58

import { isPrime } from "../../../utils/math.js"

export function solve() {
  // OEIS A200975
  let d = 1
  let total = 0
  let primes = 0
  while (true) {
    const numbers = []
    numbers.push(4 * d * d - 4 * d + 1)
    numbers.push(4 * d * d - 4 * d + 1 + 1 * 2 * d)
    numbers.push(4 * d * d - 4 * d + 1 + 2 * 2 * d)
    numbers.push(4 * d * d - 4 * d + 1 + 3 * 2 * d)
    primes += numbers.filter(n => isPrime(n)).length
    total += 4
    if (primes / total < 0.1) {
      return d * 2 - 1
    }
    ++d
  }
}
