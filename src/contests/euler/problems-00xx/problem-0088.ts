import { range } from "../../../utils/iterate.js"

// 🧮 Project Euler - Problem 88

const MAX = 12_000

function factorization(num: number, current: number): number[][] {
  if (num < current) {
    return []
  }
  const factors = [[num]]
  for (const divider of range(current, Math.floor(Math.sqrt(num)) + 1)) {
    if (num % divider === 0) {
      for (const otherDividers of factorization(Math.floor(num / divider), divider)) {
        factors.push([divider, ...otherDividers])
      }
    }
  }
  return factors
}

export function solve() {
  // OEIS A104173
  // a(n) is the smallest integer equal to the sum and the product of the same n positive integers: a(n) = i(1) + i(2) +
  // ... + i(n) = i(1)*i(2)*...*i(n).
  const solutions = new Map<number, number>()
  for (let product = 2; product <= MAX * 2; ++product) {
    for (const factors of factorization(product, 2).slice(1)) {
      const k = product - factors.reduce((a, b) => a + b, 0) + factors.length
      if (k >= 2 && k <= MAX) {
        if (!solutions.has(k) || solutions.get(k)! > product) {
          solutions.set(k, product)
        }
      }
    }
  }
  return [...new Set(solutions.values())].reduce((a, b) => a + b, 0)
}
