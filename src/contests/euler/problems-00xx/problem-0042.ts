import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import utils from "../../../utils/index.js"

// 🧮 Project Euler - Problem 42

export function solve() {
  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), "0042_words.txt")
  const words = readFileSync(filePath, "utf-8")
    .split(",")
    .map(name => name.slice(1, -1))
    .sort()
  const triangleNumbers = new Set<number>()
  for (let i = 1; i < utils.iterate.max(words.map(w => w.length)) * 26; i++) {
    triangleNumbers.add((i * (i + 1)) / 2)
  }
  const triangleWords = words.filter(word =>
    triangleNumbers.has(word.split("").reduce((sum, c) => sum + c.charCodeAt(0) - 64, 0))
  )
  return triangleWords.length
}
