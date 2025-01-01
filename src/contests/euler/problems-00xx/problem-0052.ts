import { arrayEquals } from "../../../utils/iterate.js"
import { digits } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 52

export function solve() {
  for (let length = 3; ; length++) {
    for (let n = 10 ** (length - 1); n < 10 ** length / 6; n++) {
      const nDigits = digits(n).sort()
      let factor = 2
      while (factor <= 6 && arrayEquals(nDigits, digits(n * factor).sort())) {
        factor++
      }
      if (factor === 7) {
        return n
      }
    }
  }
}
