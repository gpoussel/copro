import { divisors } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 12

export function solve() {
  let triangleNumber = 0
  let i = 1
  while (true) {
    triangleNumber += i
    if (divisors(triangleNumber).length > 500) {
      return triangleNumber
    }
    ++i
  }
}
