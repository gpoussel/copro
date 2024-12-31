import { ProjectEulerProblem } from "../../../types/contest.js"
import { lcm } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 5

export function solve() {
  return lcm(...Array.from({ length: 20 }, (_, i) => i + 1))
}
