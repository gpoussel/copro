import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

// 🧮 Project Euler - Problem 99

export function solve() {
  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), "0099_base_exp.txt")
  const numbers = readFileSync(filePath, "utf-8")
    .trim()
    .split("\n")
    .map(line => {
      const [base, exponent] = line.split(",").map(Number)
      return exponent * Math.log(base)
    })
  let maxValue = 0
  let maxValueIndex = -1
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] > maxValue) {
      maxValue = numbers[i]
      maxValueIndex = i
    }
  }
  return maxValueIndex + 1
}
