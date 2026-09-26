// 🎮 CodinGame Puzzle - halting-sequences
// https://www.codingame.com/training/medium/halting-sequences

// a + b is invariant and the gcd only scales the sequence. Working modulo s = (a+b)/g,
// every step doubles a, so the pair reaches (s/2, s/2) iff s is a power of two.
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const n = parseInt(readline())
for (let i = 0; i < n; i++) {
  const [a, b] = readline().split(" ").map(Number)
  const s = (a + b) / gcd(a, b)
  console.log((s & (s - 1)) === 0 ? "halts" : "loops")
}
