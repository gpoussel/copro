import { phi } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 70

function isPermutation(a: number, b: number) {
  const aStr = a.toString().split("").sort().join("")
  const bStr = b.toString().split("").sort().join("")
  return aStr === bStr
}

export function solve() {
  let minRatio = Infinity
  let minN = 0
  const phis = phi(10_000_001)
  for (let i = 2; i < 1e7; ++i) {
    const ratio = i / phis[i]
    if (ratio < minRatio && isPermutation(i, phis[i])) {
      minRatio = ratio
      minN = i
    }
  }
  return minN
}
