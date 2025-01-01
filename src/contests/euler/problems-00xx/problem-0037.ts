import { sieveOfEratosthene } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 37

function isTruncatablePrime(prime: number, primes: Set<number>) {
  for (let i = 0; i < prime.toString().length - 1; i++) {
    const left = parseInt(prime.toString().slice(i + 1))
    const right = parseInt(prime.toString().slice(0, -i - 1))
    if (!primes.has(left) || !primes.has(right)) {
      return false
    }
  }
  return true
}

export function solve() {
  const primes = new Set<number>(sieveOfEratosthene(1_000_000))
  let sum = 0
  for (const prime of primes) {
    if (prime < 10) continue
    const str = prime.toString()
    if ([0, 4, 6, 8].some(ed => str.includes(ed.toString()))) continue
    if (isTruncatablePrime(prime, primes)) {
      sum += prime
    }
  }
  return sum
}
