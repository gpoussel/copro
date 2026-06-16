// 🎮 CodinGame Puzzle - abcdefghijklmnopqrstuvwxyz
// https://www.codingame.com/training/easy/abcdefghijklmnopqrstuvwxyz

const n = Number(readline())
const grid: string[] = []
for (let i = 0; i < n; i++) grid.push(readline())

const Z = "z".charCodeAt(0)
const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

// Depth-first search for the path whose letters spell a..z consecutively,
// each step moving to a 4-neighbour. Exactly one such path reaches 'z'.
function search(y: number, x: number, code: number): [number, number][] | null {
  if (code === Z) return [[y, x]]
  for (const [dy, dx] of dirs) {
    const ny = y + dy
    const nx = x + dx
    if (ny < 0 || ny >= n || nx < 0 || nx >= grid[ny].length) continue
    if (grid[ny].charCodeAt(nx) !== code + 1) continue
    const rest = search(ny, nx, code + 1)
    if (rest) return [[y, x], ...rest]
  }
  return null
}

let path: [number, number][] = []
outer: for (let y = 0; y < n; y++) {
  for (let x = 0; x < grid[y].length; x++) {
    if (grid[y][x] === "a") {
      const found = search(y, x, "a".charCodeAt(0))
      if (found) {
        path = found
        break outer
      }
    }
  }
}

const out: string[][] = grid.map(row => row.split("").map(() => "-"))
for (const [y, x] of path) out[y][x] = grid[y][x]

console.log(out.map(row => row.join("")).join("\n"))
