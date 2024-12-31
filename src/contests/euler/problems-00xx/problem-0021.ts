// 🧮 Project Euler - Problem 21

import { sumOfDivisors } from "../../../utils/math.js"

export function solve() {
  const sumsOfDivisors = new Map<number, number>()
  for (let i = 1; i < 10000; i++) {
    sumsOfDivisors.set(i, sumOfDivisors(i) - i)
  }
  let sum = 0
  for (let i = 1; i < 10000; i++) {
    const sumOfDivisorsI = sumsOfDivisors.get(i)!
    const sumOfDivisorsOfDivisorsI = sumsOfDivisors.get(sumOfDivisorsI)!
    if (sumOfDivisorsOfDivisorsI === i && sumOfDivisorsI !== i) {
      sum += i
    }
  }
  return sum
}
