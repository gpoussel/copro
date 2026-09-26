// 🎮 CodinGame Puzzle - count-of-primes-in-a-number-grid
// https://www.codingame.com/training/medium/count-of-primes-in-a-number-grid

const [R, C] = readline().split(" ").map(Number)
const grid: string[][] = []
for (let i = 0; i < R; i++) grid.push(readline().trim().split(/\s+/))

const isPrime = (x: number) => {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

// All contiguous substrings of every row (across) and column (down)
const sequences: string[] = []
for (let r = 0; r < R; r++) sequences.push(grid[r].join(""))
for (let c = 0; c < C; c++) sequences.push(grid.map(row => row[c]).join(""))

const primes = new Set<number>()
for (const s of sequences) {
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) {
      const v = parseInt(s.slice(i, j), 10)
      if (isPrime(v)) primes.add(v)
    }
  }
}
console.log(primes.size)
