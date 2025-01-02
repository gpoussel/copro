import { isqrt } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 80

export function solve() {
  let sum = 0
  for (let i = 1; i <= 100; i++) {
    if (Number.isInteger(Math.sqrt(i))) {
      continue
    }
    const sumOfDigits = isqrt(BigInt(i) * 10n ** 202n)
      .toString()
      .split("")
      .slice(0, 100)
      .map(Number)
      .reduce((acc, cur) => acc + cur, 0)
    sum += sumOfDigits
  }
  return sum
}
