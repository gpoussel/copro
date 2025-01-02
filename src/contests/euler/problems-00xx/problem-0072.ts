import { phi } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 72

export function solve() {
  // OEIS A015614
  // a(n) = -1 + Sum_{i=1..n} phi(i).
  const phis = phi(1_000_001)
  return phis.reduce((acc, phi) => acc + phi, 0) - 1
}
