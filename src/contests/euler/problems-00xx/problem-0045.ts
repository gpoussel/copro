import { hexagonalNumbers, pentagonalNumbers, triangleNumbers } from "../../../utils/math.js"

// 🧮 Project Euler - Problem 45

export function solve() {
  const n = 100_000
  const triangles = triangleNumbers(n)
  const pentagonals = pentagonalNumbers(n)
  const hexagonals = hexagonalNumbers(n)
  for (const hexagonal of hexagonals) {
    if (hexagonal > 40755 && triangles.has(hexagonal) && pentagonals.has(hexagonal)) {
      return hexagonal
    }
  }
}
