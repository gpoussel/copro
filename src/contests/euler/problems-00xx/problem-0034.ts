import utils from "../../../utils/index.js"

// 🧮 Project Euler - Problem 34

const DIGIT_FACTORIALS = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880]

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
