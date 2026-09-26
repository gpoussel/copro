// 🎮 CodinGame Puzzle - solid-integer
// https://www.codingame.com/training/medium/solid-integer

// The n-th solid integer is n written in bijective base 9 (digits 1..9).
// n can reach 2^63, so arithmetic is done on arrays of decimal digits.

// Divides a big number (most significant digit first) by a small divisor
function divideBig(digits: number[], divisor: number): [number[], number] {
  const quotient: number[] = []
  let remainder = 0
  for (const d of digits) {
    const current = remainder * 10 + d
    const q = Math.floor(current / divisor)
    remainder = current % divisor
    if (quotient.length > 0 || q > 0) quotient.push(q)
  }
  return [quotient, remainder]
}

function decrementBig(digits: number[]): number[] {
  const result = digits.slice()
  let i = result.length - 1
  while (result[i] === 0) {
    result[i] = 9
    i--
  }
  result[i]--
  while (result.length > 0 && result[0] === 0) result.shift()
  return result
}

let bigN = readline()
  .trim()
  .split("")
  .map(Number)
const solidDigits: number[] = []
while (bigN.length > 0) {
  const [quotient, remainder] = divideBig(bigN, 9)
  if (remainder === 0) {
    solidDigits.push(9)
    bigN = decrementBig(quotient)
  } else {
    solidDigits.push(remainder)
    bigN = quotient
  }
}
console.log(solidDigits.reverse().join(""))
