import utils from "../../../utils/index.js"
import { DIGIT_FACTORIALS } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 34

export function solve() {
  let sum = 0
  for (let i = 3; i < 100_000; ++i) {
    const digits = utils.math.digits(i)
    const factorialSum = digits.reduce((acc, cur) => acc + DIGIT_FACTORIALS[cur], 0)
    if (factorialSum === i) {
      sum += i
    }
  }
  return sum
}
