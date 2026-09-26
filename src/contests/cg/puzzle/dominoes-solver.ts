// 🎮 CodinGame Puzzle - dominoes-solver
// https://www.codingame.com/training/hard/dominoes-solver

// Backtracking: the first free cell (row-major order) must be covered by a
// domino going right or down; each domino value pair can be used only once.
const n = Number(readline())
const [h, w] = readline().split(" ").map(Number)
const grid: number[][] = []
for (let i = 0; i < h; i++) grid.push(readline().trim().split("").map(Number))

const out: string[][] = Array.from({ length: h }, () => new Array<string>(w).fill(""))
const used = new Uint8Array((n + 1) * (n + 1))
const key = (a: number, b: number) => Math.min(a, b) * (n + 1) + Math.max(a, b)

const solve = (pos: number): boolean => {
  while (pos < h * w && out[Math.floor(pos / w)][pos % w] !== "") pos++
  if (pos === h * w) return true
  const r = Math.floor(pos / w)
  const c = pos % w
  // Horizontal
  if (c + 1 < w && out[r][c + 1] === "") {
    const k = key(grid[r][c], grid[r][c + 1])
    if (!used[k]) {
      used[k] = 1
      out[r][c] = out[r][c + 1] = "="
      if (solve(pos + 2)) return true
      out[r][c] = out[r][c + 1] = ""
      used[k] = 0
    }
  }
  // Vertical
  if (r + 1 < h) {
    const k = key(grid[r][c], grid[r + 1][c])
    if (!used[k]) {
      used[k] = 1
      out[r][c] = out[r + 1][c] = "|"
      if (solve(pos + 1)) return true
      out[r][c] = out[r + 1][c] = ""
      used[k] = 0
    }
  }
  return false
}

solve(0)
console.log(out.map(row => row.join("")).join("\n"))
