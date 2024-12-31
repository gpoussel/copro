import { sieveOfEratosthene } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 10

export function solve() {
  return sieveOfEratosthene(2000000).reduce((sum, prime) => sum + prime, 0)
}
