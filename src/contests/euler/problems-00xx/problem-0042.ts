import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import utils from "../../../utils/index.js"
import { triangleNumbers } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 42

export function solve() {
  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), "0042_words.txt")
  const words = readFileSync(filePath, "utf-8")
    .split(",")
    .map(name => name.slice(1, -1))
    .sort()
  const triangleNumbersSet = triangleNumbers(utils.iterate.max(words.map(w => w.length)) * 26)
  const triangleWords = words.filter(word =>
    triangleNumbersSet.has(word.split("").reduce((sum, c) => sum + c.charCodeAt(0) - 64, 0))
  )
  return triangleWords.length
}
