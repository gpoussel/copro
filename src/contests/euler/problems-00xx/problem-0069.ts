import { phi } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 69

export function solve() {
  let maxRatio = 0
  let maxN = 0
  const phis = phi(1_000_001)
  for (let i = 1; i < 1_000_001; ++i) {
    const ratio = i / phis[i]
    if (ratio > maxRatio) {
      maxRatio = ratio
      maxN = i
    }
  }
  return maxN
}
