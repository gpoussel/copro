// 🧮 Project Euler - Problem 16

import { sumOfDigits } from "../../../utils/math.js"

export function solve() {
  return sumOfDigits(2n ** 1000n)
}
