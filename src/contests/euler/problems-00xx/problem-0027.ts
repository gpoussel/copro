// 🧮 Project Euler - Problem 27

import { isPrime } from "../../../utils/math.js"

export function solve() {
  let maxN = 0
  let maxNProduct = 0
  for (let a = -1000; a < 1000; ++a) {
    for (let b = 0; b < 1000; ++b) {
      if (!isPrime(b)) {
        continue
      }
      let n = 0
      while (isPrime(n * n + a * n + b)) {
        ++n
      }
      if (n > maxN) {
        maxN = n
        maxNProduct = a * b
      }
    }
  }
  return maxNProduct
}
