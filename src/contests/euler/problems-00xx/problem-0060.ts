import { sieveOfEratosthene, isPrime } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 60

function areRemarkable(a: number, b: number) {
  return isPrime(Number(`${a}${b}`)) && isPrime(Number(`${b}${a}`))
}

export function solve() {
  const primes = sieveOfEratosthene(10_000)
  for (let i = 0; i < primes.length; ++i) {
    const a = primes[i]
    for (let j = i + 1; j < primes.length; ++j) {
      const b = primes[j]
      if (!areRemarkable(a, b)) {
        continue
      }
      for (let k = j + 1; k < primes.length; ++k) {
        const c = primes[k]
        if (!areRemarkable(a, c) || !areRemarkable(b, c)) {
          continue
        }
        for (let m = k + 1; m < primes.length; ++m) {
          const d = primes[m]
          if (!areRemarkable(a, d) || !areRemarkable(b, d) || !areRemarkable(c, d)) {
            continue
          }
          for (let n = m + 1; n < primes.length; ++n) {
            const e = primes[n]
            if (!areRemarkable(a, e) || !areRemarkable(b, e) || !areRemarkable(c, e) || !areRemarkable(d, e)) {
              continue
            }
            return a + b + c + d + e
          }
        }
      }
    }
  }
}
