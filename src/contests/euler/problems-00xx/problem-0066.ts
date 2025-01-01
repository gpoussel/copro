// 🧮 Project Euler - Problem 66

function getMinSolution(n: number) {
  let n1 = 0n
  let d1 = 1n
  let n2 = 1n
  let d2 = 0n
  let R = 0n
  let x = -1n
  while (R != 1n) {
    x = n1 + n2
    const y = d1 + d2
    R = x * x - BigInt(n) * y * y
    if (R > 0) {
      n2 = x
      d2 = y
    } else {
      n1 = x
      d1 = y
    }
  }
  return x
}

export function solve() {
  // OEIS A033313
  // Smallest positive integer x satisfying the Pell equation x^2 - D*y^2 = 1 for nonsquare D and positive y.

  let max = 0n
  let maxD = 0
  for (let d = 2; d <= 1000; ++d) {
    if (Number.isInteger(Math.sqrt(d))) {
      continue
    }
    const x = getMinSolution(d)
    if (x > max) {
      max = x
      maxD = d
    }
  }
  return maxD
}
