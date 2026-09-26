// 🎮 CodinGame Puzzle - polydivisible-number
// https://www.codingame.com/training/medium/polydivisible-number
// The digits are read in some base b; the resulting value must be polydivisible in base 10.

const inputDigits = readline().trim().split(/\s+/).map(Number)
const maxDigit = Math.max(...inputDigits)

// Converts the digits (base b) to decimal digits, most significant first (arbitrary precision)
const toDecimal = (base: number): number[] => {
  const little: number[] = [0] // little-endian decimal digits
  for (const d of inputDigits) {
    let carry = d
    for (let i = 0; i < little.length; i++) {
      const v = little[i] * base + carry
      little[i] = v % 10
      carry = Math.floor(v / 10)
    }
    while (carry > 0) {
      little.push(carry % 10)
      carry = Math.floor(carry / 10)
    }
  }
  while (little.length > 1 && little[little.length - 1] === 0) little.pop()
  return little.reverse()
}

const isPolydivisible = (decimal: number[]): boolean => {
  if (decimal[0] === 0) return false
  for (let k = 1; k <= decimal.length; k++) {
    let remainder = 0
    for (let i = 0; i < k; i++) remainder = (remainder * 10 + decimal[i]) % k
    if (remainder !== 0) return false
  }
  return true
}

for (let base = Math.max(2, maxDigit + 1); base <= 36; base++) if (isPolydivisible(toDecimal(base))) console.log(base)
