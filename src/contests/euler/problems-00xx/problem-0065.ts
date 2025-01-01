// 🧮 Project Euler - Problem 65

import { sumOfDigits } from "../../../utils/math.js"

export function solve() {
  // OEIS A007676
  // Numerators of convergents to e.
  const coefficients = [2n]
  for (let i = 1; i < 34; ++i) {
    coefficients.push(1n)
    coefficients.push(BigInt(i * 2))
    coefficients.push(1n)
  }

  const numerators = []
  numerators.push(coefficients[0])
  numerators.push(coefficients[0] * coefficients[1] + 1n)
  for (let i = 2; i < coefficients.length; ++i) {
    numerators.push(coefficients[i] * numerators[i - 1] + numerators[i - 2])
  }
  return sumOfDigits(numerators[99])
}
