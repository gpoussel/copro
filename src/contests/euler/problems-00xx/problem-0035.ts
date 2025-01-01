import { digits, sieveOfEratosthene } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 35

function rotations(n: number): number[] {
  const str = n.toString()
  const rotations = []
  for (let i = 0; i < str.length; i++) {
    const rotation = parseInt(str.slice(i) + str.slice(0, i), 10)
    rotations.push(rotation)
  }
  return rotations
}

export function solve() {
  const primes = sieveOfEratosthene(1_000_000)
  let circularPrimes = 0
  for (const prime of primes) {
    const primeDigits = digits(prime)
    if (primeDigits.length > 1 && [0, 2, 4, 6, 8].some(digit => primeDigits.includes(digit))) {
      continue
    }
    const rotationsOfPrime = rotations(prime)
    if (rotationsOfPrime.every(rotation => primes.includes(rotation))) {
      circularPrimes++
    }
  }
  return circularPrimes
}
