// 🎮 CodinGame Puzzle - next-growing-number
// https://www.codingame.com/training/easy/next-growing-number

const n = readline()

// A growing number has each digit >= the previous digit (non-decreasing).
// We need the first growing number strictly greater than n.
//
// Algorithm (string-based, handles numbers up to 10^19 without BigInt):
// 1. Add 1 to n to get the candidate (must be strictly greater).
// 2. Scan digits left to right. Whenever digits[i] < digits[i-1],
//    fill digits[i..end] with digits[i-1].
//    Restart the scan from the beginning after each fix (a fix can't break
//    earlier non-decreasing pairs since we only fill with existing values).
//    Actually we can just restart from i-1 since digits[i-1] didn't change.
// 3. This gives the smallest number >= candidate that is growing.

function addOne(s: string) {
  const digits = s.split("").map(Number)
  let carry = 1
  for (let i = digits.length - 1; i >= 0 && carry; i--) {
    digits[i] += carry
    carry = Math.floor(digits[i] / 10)
    digits[i] %= 10
  }
  if (carry) digits.unshift(1)
  return digits
}

function nextGrowing(s: string) {
  const digits = addOne(s)

  let i = 1
  while (i < digits.length) {
    if (digits[i] < digits[i - 1]) {
      // Fill from i to end with digits[i-1]
      const fill = digits[i - 1]
      for (let j = i; j < digits.length; j++) {
        digits[j] = fill
      }
      // No need to restart from 0: digits[i-1] didn't change, so all pairs
      // before i are still valid. Continue from i+1.
      // Actually the fill made all following digits equal to fill, so they
      // are already non-decreasing. We can jump to the end.
      break
    }
    i++
  }

  return digits.join("")
}

console.log(nextGrowing(n))
