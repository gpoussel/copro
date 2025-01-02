import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

// 🧮 Project Euler - Problem 79

export function solve() {
  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), "0079_keylog.txt")
  const trials = readFileSync(filePath, "utf-8")
    .trim()
    .split("\n")
    .map(name => name.split("").map(Number))
  const result = []
  let currentTrials = trials
  while (currentTrials.length > 0) {
    const startingDigits = new Set(currentTrials.map(trial => trial[0]))
    const possibleStartingDigit = [...startingDigits].filter(startingDigit =>
      currentTrials.every(trial => trial.slice(1).indexOf(startingDigit) === -1)
    )
    if (possibleStartingDigit.length !== 1) {
      throw new Error("The starting digit is not unique")
    }
    const startingDigit = possibleStartingDigit[0]
    result.push(startingDigit)
    currentTrials = currentTrials
      .map(trial => (trial[0] === startingDigit ? trial.slice(1) : trial))
      .filter(trial => trial.length > 0)
  }
  return result.join("")
}
