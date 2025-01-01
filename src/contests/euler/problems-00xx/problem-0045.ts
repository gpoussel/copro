// 🧮 Project Euler - Problem 45

function triangleNumbers(n: number): Set<number> {
  const triangleNumbers = new Set<number>()
  for (let i = 1; i <= n; i++) {
    triangleNumbers.add((i * (i + 1)) / 2)
  }
  return triangleNumbers
}

function pentagonalNumbers(n: number): Set<number> {
  const pentagonalNumbers = new Set<number>()
  for (let i = 1; i <= n; i++) {
    pentagonalNumbers.add((i * (3 * i - 1)) / 2)
  }
  return pentagonalNumbers
}

function hexagonalNumbers(n: number): Set<number> {
  const hexagonalNumbers = new Set<number>()
  for (let i = 1; i <= n; i++) {
    hexagonalNumbers.add(i * (2 * i - 1))
  }
  return hexagonalNumbers
}

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
