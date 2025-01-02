import { logEvery } from "../../../utils/log.js"
import { gcd } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 73

export function solve() {
  const min = 1 / 3
  const max = 1 / 2
  let count = 0
  for (let denominator = 3; denominator <= 12000; denominator++) {
    for (
      let numerator = Math.floor(denominator * min) + 1;
      numerator < Math.floor(denominator * max) + 1;
      numerator++
    ) {
      if (gcd(numerator, denominator) === 1) {
        count++
      }
    }
    logEvery(denominator, 1_000)
  }
  return count
}
