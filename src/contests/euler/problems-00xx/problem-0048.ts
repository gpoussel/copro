import { modPow } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 48

export function solve() {
  let sum = 0n
  let tenDigits = 10000000000n
  for (let i = 1; i < 1000; ++i) {
    sum += modPow(BigInt(i), BigInt(i), tenDigits)
  }
  return sum % tenDigits
}
