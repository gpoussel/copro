import { ProjectEulerProblem } from "../../../types/contest.js"

// 🧮 Project Euler - Problem 1

function getAllMultiples(mult: number, max: number) {
  const multiples = []
  for (let i = mult; i < max; i += mult) {
    multiples.push(i)
  }
  return multiples
}

export function solve() {
  const multiples = new Set<number>()
  getAllMultiples(3, 1000).forEach(m => multiples.add(m))
  getAllMultiples(5, 1000).forEach(m => multiples.add(m))
  return Array.from(multiples).reduce((acc, m) => acc + m, 0)
}
