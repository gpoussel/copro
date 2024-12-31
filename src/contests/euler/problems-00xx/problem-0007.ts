import { ProjectEulerProblem } from "../../../types/contest.js"
import { sieveOfEratosthene } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 7

export function solve() {
  const primes = sieveOfEratosthene(1000000)
  return primes[10000]
}
