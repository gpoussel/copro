import { sieveOfEratosthene } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 49

export function solve() {
  const primes = new Set(sieveOfEratosthene(9999))
  primes.delete(1487)
  for (let i = 1001; i < 3333; i += 2) {
    if (!primes.has(i)) {
      continue
    }
    for (let progression = 2; progression < 3333; progression += 2) {
      const a = i
      const b = i + progression

      const digitsA = a.toString().split("").sort().join("")
      const digitsB = b.toString().split("").sort().join("")
      if (digitsA !== digitsB || !primes.has(b)) {
        continue
      }
      const c = i + 2 * progression
      if (c > 9999) {
        break
      }
      const digitsC = c.toString().split("").sort().join("")
      if (digitsA !== digitsC || !primes.has(c)) {
        continue
      }
      return `${a}${b}${c}`
    }
  }
}
