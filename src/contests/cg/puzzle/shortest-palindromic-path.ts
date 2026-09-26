// 🎮 CodinGame Puzzle - shortest-palindromic-path
// https://www.codingame.com/training/medium/shortest-palindromic-path

const n = parseInt(readline())
const [startR, startC] = readline().split(" ").map(Number)
const [goalR, goalC] = readline().split(" ").map(Number)
const grid: string[] = []
for (let i = 0; i < n; i++) grid.push(readline())

const cells = n * n
const letter: number[] = []
const neighbours: number[][] = []
for (let r = 0; r < n; r++) {
  for (let c = 0; c < n; c++) {
    letter.push(grid[r].charCodeAt(c))
    const list: number[] = []
    if (r > 0) list.push((r - 1) * n + c)
    if (r < n - 1) list.push((r + 1) * n + c)
    if (c > 0) list.push(r * n + c - 1)
    if (c < n - 1) list.push(r * n + c + 1)
    neighbours.push(list)
  }
}
const adjacent = (a: number, b: number) => neighbours[a].indexOf(b) >= 0

// BFS on pairs (front, back): both ends of the palindrome grow simultaneously with equal letters.
// After k steps the path holds 2k + 2 cells; the ends meet on a cell (2k + 1) or side by side (2k + 2).
function solve(): number {
  const start = (startR - 1) * n + (startC - 1)
  const goal = (goalR - 1) * n + (goalC - 1)
  const seen = new Uint8Array(cells * cells)
  let layer: number[] = [start * cells + goal]
  seen[layer[0]] = 1
  for (let k = 0; layer.length > 0; k++) {
    let even = false
    for (const state of layer) {
      const u = Math.floor(state / cells)
      const v = state % cells
      if (u === v) return 2 * k + 1
      if (adjacent(u, v)) even = true
    }
    if (even) return 2 * k + 2
    const next: number[] = []
    for (const state of layer) {
      const u = Math.floor(state / cells)
      const v = state % cells
      for (const nu of neighbours[u]) {
        for (const nv of neighbours[v]) {
          if (letter[nu] !== letter[nv]) continue
          const key = nu * cells + nv
          if (seen[key]) continue
          seen[key] = 1
          next.push(key)
        }
      }
    }
    layer = next
  }
  return -1
}

console.log(solve())
