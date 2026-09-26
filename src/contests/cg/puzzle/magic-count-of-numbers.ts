// 🎮 CodinGame Puzzle - magic-count-of-numbers
// https://www.codingame.com/training/hard/magic-count-of-numbers

// Inclusion-exclusion over the subsets of (distinct) primes. n <= 1e13 stays
// well inside the exact integer range of doubles.
const [n] = readline().split(" ").map(Number)
const primes = [...new Set(readline().trim().split(/\s+/).map(Number))]

let count = 0
const rec = (i: number, prod: number, size: number): void => {
  if (prod > n) return
  if (i === primes.length) {
    if (size > 0) count += (size % 2 ? 1 : -1) * Math.floor(n / prod)
    return
  }
  rec(i + 1, prod, size)
  rec(i + 1, prod * primes[i], size + 1)
}
rec(0, 1, 0)
console.log(String(count))
