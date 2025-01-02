// 🧮 Project Euler - Problem 71

export function solve() {
  let denominator = 1_000_000
  while (denominator > 1) {
    const numerator = (3 * denominator) / 7
    if (!Number.isInteger(numerator)) {
      denominator--
      continue
    }
    return numerator - 1
  }
}
