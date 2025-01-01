// 🧮 Project Euler - Problem 40

function nthDigit(n: number) {
  if (n < 10) {
    return n
  }
  n -= 10
  for (let digitCount = 2; ; digitCount++) {
    const start = 10 ** (digitCount - 1)
    const end = 10 ** digitCount - 1
    const count = end - start + 1
    const digitsCount = digitCount * count
    if (n < digitsCount) {
      const number = start + Math.floor(n / digitCount)
      return +`${number}`[n % digitCount]
    }
    n -= digitsCount
  }
}

export function solve() {
  // OEIS A033307
  // Decimal expansion of Champernowne constant
  return (
    nthDigit(1) *
    nthDigit(10) *
    nthDigit(100) *
    nthDigit(1_000) *
    nthDigit(10_000) *
    nthDigit(100_000) *
    nthDigit(1_000_000)
  )
}
