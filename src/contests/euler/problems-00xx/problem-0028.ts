// 🧮 Project Euler - Problem 28

function valueAt(n: number) {
  return 1 + 10 * n ** 2 + (16 * n ** 3 + 26 * n) / 3
}

export function solve() {
  // OEIS A114254
  // Sum of all terms on the two principal diagonals of a 2n+1 X 2n+1 square spiral.
  return valueAt(500)
}
