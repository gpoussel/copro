// 🎮 CodinGame Puzzle - constrained-latin-squares
// https://www.codingame.com/training/medium/constrained-latin-squares

const n = parseInt(readline())
const grid: number[][] = []
for (let i = 0; i < n; i++) grid.push(readline().trim().split("").map(Number))

// Bit v set in rowUsed[r] / colUsed[c] means symbol v is already placed there
const rowUsed: number[] = new Array(n).fill(0)
const colUsed: number[] = new Array(n).fill(0)
const empty: [number, number][] = []
let valid = true
for (let r = 0; r < n; r++) {
  for (let c = 0; c < n; c++) {
    const v = grid[r][c]
    if (v === 0) {
      empty.push([r, c])
      continue
    }
    const bit = 1 << v
    if (rowUsed[r] & bit || colUsed[c] & bit) valid = false
    rowUsed[r] |= bit
    colUsed[c] |= bit
  }
}

const ALL = ((1 << n) - 1) << 1
const popcount = (m: number) => {
  let count = 0
  for (; m; m &= m - 1) count++
  return count
}

const filled: boolean[] = empty.map(() => false)
// Backtracking, always branching on the empty cell with the fewest candidates
const count = (remaining: number): number => {
  if (remaining === 0) return 1
  let best = -1
  let bestMask = 0
  let bestSize = n + 1
  for (let i = 0; i < empty.length; i++) {
    if (filled[i]) continue
    const [r, c] = empty[i]
    const mask = ALL & ~(rowUsed[r] | colUsed[c])
    const size = popcount(mask)
    if (size === 0) return 0
    if (size < bestSize) {
      best = i
      bestMask = mask
      bestSize = size
    }
  }
  const [r, c] = empty[best]
  filled[best] = true
  let total = 0
  for (let mask = bestMask; mask; mask &= mask - 1) {
    const bit = mask & -mask
    rowUsed[r] |= bit
    colUsed[c] |= bit
    total += count(remaining - 1)
    rowUsed[r] &= ~bit
    colUsed[c] &= ~bit
  }
  filled[best] = false
  return total
}

console.log(valid ? count(empty.length) : 0)
