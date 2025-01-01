// 🧮 Project Euler - Problem 64

function getPeriod(n: number): number {
  let a0 = Math.floor(Math.sqrt(n))
  if (a0 * a0 === n) return 0
  let a = a0
  let d = 1
  let m = 0
  let period = new Set<string>()
  while (true) {
    m = d * a - m
    d = (n - m * m) / d
    a = Math.floor((a0 + m) / d)
    if (period.has([m, d, a].join(","))) {
      return period.size
    }
    period.add([m, d, a].join(","))
  }
}

export function solve() {
  // OEIS A013943
  // Period of continued fraction for sqrt(m), m = n-th nonsquare.
  let count = 0
  for (let i = 0; i < 10_000; ++i) {
    if (getPeriod(i) % 2 === 1) {
      count++
    }
  }
  return count
}
