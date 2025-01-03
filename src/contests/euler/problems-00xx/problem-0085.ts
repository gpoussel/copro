// 🧮 Project Euler - Problem 85

function countRectangles(n: number, m: number) {
  return (n * (n + 1) * m * (m + 1)) / 4
}

export function solve() {
  const target = 2_000_000
  let closestCount = 0
  let closestArea = 0
  for (let m = 0; m < 100; ++m) {
    for (let n = 0; n < 100; ++n) {
      const c = countRectangles(n, m)
      if (c >= target) {
        if (Math.abs(c - target) < Math.abs(closestCount - target)) {
          closestCount = c
          closestArea = n * m
        }
        break
      }
    }
  }
  return closestArea
}
