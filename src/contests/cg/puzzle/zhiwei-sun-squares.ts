// 🎮 CodinGame Puzzle - zhiwei-sun-squares
// https://www.codingame.com/training/medium/zhiwei-sun-squares

const n: number = parseInt(readline())

// Precompute perfect squares up to n (for checking a²)
// and squares map for checking e
const sqrtN: number = Math.floor(Math.sqrt(n))

// isSquare: check if a number is a perfect square
function isSquare(x: number): boolean {
  if (x < 0) return false
  const r: number = Math.round(Math.sqrt(x))
  return r * r === x
}

let count: number = 0

// Iterate over b, c, d with b² + c² + d² <= n
for (let b: number = 0; b * b <= n; b++) {
  const rem1: number = n - b * b
  for (let c: number = 0; c * c <= rem1; c++) {
    const rem2: number = rem1 - c * c
    for (let d: number = 0; d * d <= rem2; d++) {
      const rem3: number = rem2 - d * d
      // rem3 must be a perfect square (= a²)
      if (!isSquare(rem3)) continue
      // b + 3c + 5d must be a perfect square (= e²)
      const eSquared: number = b + 3 * c + 5 * d
      if (!isSquare(eSquared)) continue
      count++
    }
  }
}

console.log(count)
