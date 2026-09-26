// 🎮 CodinGame Puzzle - markov-ants
// https://www.codingame.com/training/medium/markov-ants

const step = parseInt(readline())
const [w, h] = readline().split(" ").map(Number)
let ax = 0
let ay = 0
for (let y = 0; y < h; y++) {
  const row = readline()
  const x = row.indexOf("A")
  if (x >= 0) {
    ax = x
    ay = y
  }
}

// Unknowns: expected time E(x, y) for every strictly interior cell
const inside = (x: number, y: number): boolean => x > 0 && y > 0 && x < w - 1 && y < h - 1
const iw = w - 2
const n = iw * (h - 2)
const id = (x: number, y: number): number => (y - 1) * iw + (x - 1)

// E(p) - 1/4 * sum(E(neighbors inside)) = 1
const m: number[][] = []
for (let y = 1; y < h - 1; y++) {
  for (let x = 1; x < w - 1; x++) {
    const row: number[] = new Array(n + 1).fill(0)
    row[id(x, y)] = 1
    row[n] = 1
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx * step
      const ny = y + dy * step
      if (inside(nx, ny)) row[id(nx, ny)] -= 0.25
    }
    m.push(row)
  }
}

// Gaussian elimination with partial pivoting
for (let col = 0; col < n; col++) {
  let pivot = col
  for (let r = col + 1; r < n; r++) if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r
  ;[m[col], m[pivot]] = [m[pivot], m[col]]
  for (let r = 0; r < n; r++) {
    if (r === col || m[r][col] === 0) continue
    const f = m[r][col] / m[col][col]
    for (let c = col; c <= n; c++) m[r][c] -= f * m[col][c]
  }
}

const target = id(ax, ay)
console.log((m[target][n] / m[target][target]).toFixed(1))
