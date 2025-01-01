import { sieveOfEratosthene } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 50

export function solve() {
  const primes = sieveOfEratosthene(1_000_000)
  const primesSet = new Set(primes)
  let longestPrimeSequence = 0
  let longestPrimeSequenceSum = 0

  for (let i = 0; i < primes.length; i++) {
    let sum = primes[i]
    let j = i + 1
    while (sum < 1000000) {
      sum += primes[j]
      j++
      if (primesSet.has(sum) && j - i > longestPrimeSequence) {
        longestPrimeSequence = j - i
        longestPrimeSequenceSum = sum
      }
    }
  }
  return longestPrimeSequenceSum
}
