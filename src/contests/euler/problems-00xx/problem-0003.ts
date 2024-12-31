import { sieveOfEratosthene } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 3

export function solve() {
  const num = 600_851_475_143
  let biggestPrime = 0
  const primes = sieveOfEratosthene(Math.round(Math.sqrt(num)))
  for (const prime of primes) {
    if (num % prime === 0) {
      biggestPrime = prime
    }
  }
  return biggestPrime
}
