// 🎮 CodinGame Puzzle - heart-of-the-city
// https://www.codingame.com/training/expert/heart-of-the-city

// A building (x, y) is visible iff gcd(|x|, |y|) = 1. With m = (n - 1) / 2,
// the 8 axis/diagonal directions give 8 buildings and each octant contributes
// sum of phi(k) for k = 2..m. Euler's totient is computed with a linear sieve.

const cityN = parseInt(readline())
const half = (cityN - 1) / 2
const phi = new Int32Array(half + 1)
for (let i = 0; i <= half; i++) phi[i] = i
for (let i = 2; i <= half; i++) {
  if (phi[i] !== i) continue
  // i is prime: apply the (1 - 1/i) factor to its multiples
  for (let j = i; j <= half; j += i) phi[j] -= phi[j] / i
}
let visible = 8
for (let k = 2; k <= half; k++) visible += 8 * phi[k]
console.log(visible)
