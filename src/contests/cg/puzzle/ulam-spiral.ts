// 🎮 CodinGame Puzzle - ulam-spiral
// https://www.codingame.com/training/easy/ulam-spiral

const N = parseInt(readline())
function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false
  return true
}
const grid: number[][] = Array.from({ length: N }, () => new Array(N).fill(0))
let r = (N - 1) / 2
let c = (N - 1) / 2
grid[r][c] = 1
// Counterclockwise spiral starting toward the right: right, up, left, down.
const dirs: [number, number][] = [
  [0, 1],
  [-1, 0],
  [0, -1],
  [1, 0],
]
let d = 0
let steps = 1
let num = 2
while (num <= N * N) {
  for (let twice = 0; twice < 2; twice++) {
    for (let s = 0; s < steps; s++) {
      r += dirs[d][0]
      c += dirs[d][1]
      if (r >= 0 && r < N && c >= 0 && c < N) grid[r][c] = num
      num++
      if (num > N * N) break
    }
    d = (d + 1) % 4
    if (num > N * N) break
  }
  steps++
}
const lines: string[] = []
for (let i = 0; i < N; i++) {
  lines.push(grid[i].map(v => (isPrime(v) ? "#" : " ")).join(" "))
}
console.log(lines.join("\n"))
