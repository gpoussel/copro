// 🎮 CodinGame Puzzle - killer-sudoku-solver
// https://www.codingame.com/training/medium/killer-sudoku-solver

const grid: number[] = []
const cageIds: string[] = []
for (let r = 0; r < 9; r++) {
  const [digits, cages] = readline().trim().split(/\s+/)
  for (let c = 0; c < 9; c++) {
    grid.push(digits[c] === "." ? 0 : Number(digits[c]))
    cageIds.push(cages[c])
  }
}
const cageSum: { [id: string]: number } = {}
for (const entry of readline().trim().split(/\s+/)) {
  const [id, value] = entry.split("=")
  cageSum[id] = Number(value)
}

// Digit sets are 9-bit masks: bit (d - 1) stands for digit d
const rowMask = new Array<number>(9).fill(0)
const colMask = new Array<number>(9).fill(0)
const boxMask = new Array<number>(9).fill(0)
const cageUsed: { [id: string]: number } = {}
const cageLeft: { [id: string]: number } = {} // remaining sum
const cageEmpty: { [id: string]: number } = {} // remaining empty cells
for (const id of cageIds) {
  cageUsed[id] = 0
  cageLeft[id] = cageSum[id]
  cageEmpty[id] = 0
}
const box = (cell: number) => Math.floor(cell / 27) * 3 + Math.floor((cell % 9) / 3)

function place(cell: number, digit: number, sign: 1 | -1): void {
  const bit = 1 << (digit - 1)
  const id = cageIds[cell]
  rowMask[Math.floor(cell / 9)] ^= bit
  colMask[cell % 9] ^= bit
  boxMask[box(cell)] ^= bit
  cageUsed[id] ^= bit
  cageLeft[id] -= sign * digit
  cageEmpty[id] += sign === 1 ? -1 : 1
}
for (let cell = 0; cell < 81; cell++) {
  cageEmpty[cageIds[cell]]++
  if (grid[cell]) place(cell, grid[cell], 1)
}

// Sum and size of every digit subset
const subsetSum: number[] = []
const subsetSize: number[] = []
for (let mask = 0; mask < 512; mask++) {
  let sum = 0
  let size = 0
  for (let d = 0; d < 9; d++) {
    if (mask & (1 << d)) {
      sum += d + 1
      size++
    }
  }
  subsetSum.push(sum)
  subsetSize.push(size)
}

/** Digits that appear in some completion of a cage (unused digits, count cells, given sum). */
const cageCache = new Map<number, number>()
function cageDigits(used: number, count: number, sum: number): number {
  const key = (used * 10 + count) * 64 + sum
  const cached = cageCache.get(key)
  if (cached !== undefined) return cached
  let digits = 0
  for (let mask = 0; mask < 512; mask++) {
    if (mask & used || subsetSize[mask] !== count || subsetSum[mask] !== sum) continue
    digits |= mask
  }
  cageCache.set(key, digits)
  return digits
}

function candidates(cell: number): number {
  const id = cageIds[cell]
  const taken = rowMask[Math.floor(cell / 9)] | colMask[cell % 9] | boxMask[box(cell)]
  const left = cageLeft[id]
  if (left < 0 || left > 45) return 0
  return ~taken & cageDigits(cageUsed[id], cageEmpty[id], left) & 511
}

function bitCount(mask: number): number {
  let count = 0
  for (; mask; mask &= mask - 1) count++
  return count
}

function solve(): boolean {
  let best = -1
  let bestMask = 0
  let bestCount = 10
  for (let cell = 0; cell < 81; cell++) {
    if (grid[cell]) continue
    const mask = candidates(cell)
    const count = bitCount(mask)
    if (count < bestCount) {
      best = cell
      bestMask = mask
      bestCount = count
      if (count === 0) return false
    }
  }
  if (best < 0) return true
  for (let d = 1; d <= 9; d++) {
    if (!(bestMask & (1 << (d - 1)))) continue
    grid[best] = d
    place(best, d, 1)
    if (solve()) return true
    place(best, d, -1)
    grid[best] = 0
  }
  return false
}

solve()
for (let r = 0; r < 9; r++) console.log(grid.slice(r * 9, r * 9 + 9).join(""))
