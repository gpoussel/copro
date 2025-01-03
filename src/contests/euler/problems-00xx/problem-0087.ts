// 🧮 Project Euler - Problem 87

import { sieveOfEratosthene } from "../../../utils/math.js"

const MAX = 50_000_000

function squaresBelow(primes: number[]) {
  const squares = new Set<number>()
  for (const prime of primes) {
    squares.add(prime * prime)
  }
  return squares
}

function cubesBelow(primes: number[]) {
  const cubes = new Set<number>()
  for (const prime of primes) {
    cubes.add(prime * prime * prime)
  }
  return cubes
}

function fourthsBelow(primes: number[]) {
  const fourths = new Set<number>()
  for (const prime of primes) {
    const fourth = prime * prime * prime * prime
    fourths.add(fourth)
  }
  return fourths
}

export function solve() {
  const primes = sieveOfEratosthene(Math.ceil(Math.sqrt(MAX)))
  const squares = squaresBelow(primes)
  const cubes = cubesBelow(primes.filter(p => p * p * p < MAX))
  const fourths = fourthsBelow(primes.filter(p => p * p * p * p < MAX))
  const numbers = new Set<number>()
  for (const s of squares) {
    for (const c of cubes) {
      if (s + c >= MAX) {
        break
      }
      for (const f of fourths) {
        const sum = s + c + f
        if (sum >= MAX) {
          break
        }
        numbers.add(sum)
      }
    }
  }
  return numbers.size
}
