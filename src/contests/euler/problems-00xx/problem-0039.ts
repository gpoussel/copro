// 🧮 Project Euler - Problem 39

export function solve() {
  const squares = new Map<number, number>()
  for (let i = 1; i <= 500; i++) {
    squares.set(i * i, i)
  }
  const perimeters = new Map<number, number>()
  for (const [square1, n1] of squares) {
    for (const [square2, n2] of squares) {
      const sum = square1 + square2
      if (squares.has(sum)) {
        const n3 = squares.get(sum)!
        const perimeter = n1 + n2 + n3
        perimeters.set(perimeter, (perimeters.get(perimeter) || 0) + 1)
      }
    }
  }
  return Array.from(perimeters.entries()).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
}
