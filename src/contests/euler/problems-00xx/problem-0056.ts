// 🧮 Project Euler - Problem 56

import { sumOfDigits } from "../../../utils/math.js"

export function solve() {
  let maxDigitalSum = 0
  for (let a = 1; a < 100; a++) {
    for (let b = 1; b < 100; b++) {
      const pow = BigInt(a) ** BigInt(b)
      const sod = sumOfDigits(pow)
      if (sod > maxDigitalSum) {
        maxDigitalSum = sod
      }
    }
  }
  return maxDigitalSum
}
