import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

// 🧮 Project Euler - Problem 67

export function solve() {
  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), "0067_triangle.txt")
  const lines = readFileSync(filePath, "utf-8")
    .trim()
    .split("\n")
    .map(line => line.split(" ").map(Number))
  for (let i = lines.length - 2; i >= 0; i--) {
    for (let j = 0; j < lines[i].length; j++) {
      lines[i][j] += Math.max(lines[i + 1][j], lines[i + 1][j + 1])
    }
  }
  return lines[0][0]
}
