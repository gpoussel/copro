import { range } from "../../../utils/iterate.js"
import { digits, sieveOfEratosthene } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 51

export function solve() {
  const primes = sieveOfEratosthene(10_000_000)
  const primeSet = new Set(primes)
  const primesByLength = new Map<number, Set<number>>()
  range(1, 8).forEach(i => primesByLength.set(i, new Set()))
  for (const prime of primeSet) {
    const primeDigits = digits(prime)
    if (new Set(primeDigits).size >= primeDigits.length - 2) {
      continue
    }
    primesByLength.get(primeDigits.length)!.add(prime)
  }
  for (const [length, primes] of primesByLength) {
    if (primes.size < 8) {
      continue
    }
    for (const prime of primes) {
      const primeDigits = digits(prime)
      const primeUniqueDigits = new Set(primeDigits)
      for (const primeUniqueDigit of primeUniqueDigits) {
        const occurrences = primeDigits.filter(d => d === primeUniqueDigit)
        if (occurrences.length < 3) {
          continue
        }
        const positions = primeDigits.map((d, i) => (d === primeUniqueDigit ? i : -1)).filter(i => i !== -1)
        let familySize = 0
        for (let digit = 0; digit < 10 && 10 - digit + familySize >= 8; digit++) {
          const family = primeDigits.map((d, i) => (positions.includes(i) ? digit : d)).join("")
          if (primes.has(+family)) {
            familySize++
          }
        }
        if (familySize === 8) {
          return prime
        }
      }
    }
  }
}
