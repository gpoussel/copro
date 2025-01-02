// 🧮 Project Euler - Problem 69

export function solve() {
  let maxRatio = 0
  let maxN = 0
  let phi = Array(1_000_001).fill(0)
  for (let i = 0; i < 1_000_001; ++i) {
    phi[i] = i % 2 === 1 ? i : i / 2
  }
  for (let i = 3; i < 1_000_001; i += 2) {
    if (phi[i] == i) {
      for (let j = i; j < 1_000_001; j += i) {
        phi[j] -= phi[j] / i
      }
    }
  }
  for (let i = 1; i < 1_000_001; ++i) {
    const ratio = i / phi[i]
    if (ratio > maxRatio) {
      maxRatio = ratio
      maxN = i
    }
  }
  return maxN
}
