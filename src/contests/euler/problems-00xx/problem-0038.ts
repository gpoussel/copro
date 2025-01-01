// 🧮 Project Euler - Problem 38

export function solve() {
  let bestPandigital = 0
  for (let numberOfDigits = 1; numberOfDigits <= 4; ++numberOfDigits) {
    for (let i = 9 * 10 ** numberOfDigits; i < 10 ** (numberOfDigits + 1); ++i) {
      let concatenated = ""
      let nb = 1
      while (concatenated.length < 9) {
        concatenated += (i * nb).toString()
        ++nb
      }
      if (concatenated.length === 9) {
        const digits = new Set(concatenated.split("").map(d => +d))
        if (digits.size === 9 && !digits.has(0)) {
          bestPandigital = Math.max(bestPandigital, +concatenated)
        }
      }
    }
  }
  return bestPandigital
}
