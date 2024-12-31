import { sumOfDigits } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 20

export function solve() {
  let factorial = 1n
  for (let i = 1; i <= 100; i++) {
    factorial *= BigInt(i)
  }

  return sumOfDigits(factorial)
}
