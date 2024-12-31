import { ProjectEulerProblem } from "../../../types/contest.js"

// 🧮 Project Euler - Problem 2

function fibonacci(max: number) {
  const fib = [1, 2]
  while (fib[fib.length - 1] < max) {
    fib.push(fib[fib.length - 1] + fib[fib.length - 2])
  }
  return fib
}

export function solve() {
  const terms = fibonacci(4000000)
  return terms.filter(t => t % 2 === 0).reduce((a, b) => a + b, 0)
}
