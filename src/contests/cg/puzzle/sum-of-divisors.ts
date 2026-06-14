// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

// d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
// of divisors is sum over d of d * floor(n/d).
const n: number = parseInt(readline())
let sum = 0
for (let d = 1; d <= n; d++) {
  sum += d * Math.floor(n / d)
}
console.log(sum)
