import { readFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

// 🧮 Project Euler - Problem 22

export function solve() {
  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), "0022_names.txt")
  const names = readFileSync(filePath, "utf-8")
    .split(",")
    .map(name => name.slice(1, -1))
    .sort()
  const scores = names.map(
    (name, index) => (index + 1) * name.split("").reduce((acc, char) => acc + char.charCodeAt(0) - 64, 0)
  )
  return scores.reduce((acc, value) => acc + value, 0)
}
