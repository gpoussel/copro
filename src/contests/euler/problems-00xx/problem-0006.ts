import { ProjectEulerProblem } from "../../../types/contest.js"

// 🧮 Project Euler - Problem 6

function sumOfSquares(n: number): number {
  return (n * (n + 1) * (2 * n + 1)) / 6
}

function squareOfSum(n: number): number {
  return ((n * (n + 1)) / 2) ** 2
}

export function solve() {
  return squareOfSum(100) - sumOfSquares(100)
}
