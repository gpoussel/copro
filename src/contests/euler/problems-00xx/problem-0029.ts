// 🧮 Project Euler - Problem 29

export function solve() {
  const terms = new Set<BigInt>()
  for (let a = 2n; a <= 100n; a++) {
    for (let b = 2n; b <= 100n; b++) {
      terms.add(a ** b)
    }
  }
  return terms.size
}
