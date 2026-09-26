// 🎮 CodinGame Puzzle - bit-count-to-limit
// https://www.codingame.com/training/medium/bit-count-to-limit

const n = parseInt(readline())

// Bit b is set in exactly half of each block of 2^(b+1) consecutive integers
let total = 0
for (let half = 1; half <= n; half *= 2) {
  const block = 2 * half
  total += Math.floor((n + 1) / block) * half + Math.max(0, ((n + 1) % block) - half)
}
console.log(total)
