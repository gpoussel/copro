// 🎮 CodinGame Puzzle - ulam-spiral
// https://www.codingame.com/training/easy/ulam-spiral

const n: number = parseInt(readline())

const isPrime = (x: number): boolean => {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) {
    if (x % d === 0) return false
  }
  return true
}

const grid: string[][] = []
for (let i = 0; i < n; i++) {
  const row: string[] = []
  for (let j = 0; j < n; j++) row.push(" ")
  grid.push(row)
}

const c: number = (n - 1) / 2
let x: number = c
let y: number = c
const dx: number[] = [1, 0, -1, 0]
const dy: number[] = [0, -1, 0, 1]
let dir: number = 0
let stepLen: number = 1
let value: number = 1

if (isPrime(value)) grid[y][x] = "#"

while (value < n * n) {
  for (let rep = 0; rep < 2; rep++) {
    for (let s = 0; s < stepLen; s++) {
      x += dx[dir]
      y += dy[dir]
      value++
      if (value > n * n) break
      if (x >= 0 && x < n && y >= 0 && y < n && isPrime(value)) grid[y][x] = "#"
    }
    dir = (dir + 1) % 4
    if (value >= n * n) break
  }
  stepLen++
}

const lines: string[] = grid.map((row: string[]) => row.join(" "))
console.log(lines.join("\n"))
