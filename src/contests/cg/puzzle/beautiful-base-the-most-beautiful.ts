// 🎮 CodinGame Puzzle - beautiful-base-the-most-beautiful
// https://www.codingame.com/training/medium/beautiful-base-the-most-beautiful

const text = readline().trim()
const n = BigInt(text)
const approx = Number(text)

function power(base: bigint, exponent: number): bigint {
  let result = BigInt(1)
  for (let i = 0; i < exponent; i++) result *= base
  return result
}

// Try the largest exponents first: the base is the (rounded) k-th root, checked exactly
let answer = "NONE"
for (let k = 60; k >= 2 && answer === "NONE"; k--) {
  const root = Math.round(Math.pow(approx, 1 / k))
  for (let b = Math.max(2, root - 1); b <= root + 1; b++) {
    if (power(BigInt(b), k) === n) {
      answer = String(b)
      break
    }
  }
}
console.log(answer)
