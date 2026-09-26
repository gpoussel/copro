// 🎮 CodinGame Puzzle - primitive-pythagorean-triples
// https://www.codingame.com/training/medium/primitive-pythagorean-triples

// Euclid's formula: primitive triples are (m²-n², 2mn, m²+n²) for coprime m > n > 0
// of opposite parity, each produced exactly once. Count those with c = m²+n² <= N.
const limit = parseInt(readline())
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
let count = 0
for (let m = 2; m * m + 1 <= limit; m++) {
  for (let n = m % 2 === 0 ? 1 : 2; n < m && m * m + n * n <= limit; n += 2) {
    if (gcd(m, n) === 1) count++
  }
}
console.log(count)
