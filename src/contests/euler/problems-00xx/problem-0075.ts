import { gcd } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 75

export function solve() {
  const countsByPerimeter = new Array<number>(1_500_001).fill(0)
  for (let m = 2; m < Math.floor(Math.sqrt(1_500_000)); ++m) {
    for (let n = 1 + (m % 2 === 1 ? 1 : 0); n < m; n += 2) {
      if (gcd(m, n) === 1) {
        const perimeter = 2 * (m * (m + n))
        for (let k = 1; k * perimeter <= countsByPerimeter.length; ++k) {
          countsByPerimeter[k * perimeter]++
        }
      }
    }
  }
  let count = 0
  for (let i = 0; i < countsByPerimeter.length; ++i) {
    if (countsByPerimeter[i] === 1) {
      count++
    }
  }
  return count
}
