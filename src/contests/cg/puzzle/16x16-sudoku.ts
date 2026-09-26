// 🎮 CodinGame Puzzle - 16x16-sudoku
// https://www.codingame.com/training/medium/16x16-sudoku

const N = 16
const ALL = (1 << N) - 1

// Units (rows, columns, blocks) and peers of each cell
const units: number[][] = []
for (let i = 0; i < N; i++) {
  const row: number[] = []
  const col: number[] = []
  const block: number[] = []
  for (let j = 0; j < N; j++) {
    row.push(i * N + j)
    col.push(j * N + i)
    block.push((Math.floor(i / 4) * 4 + Math.floor(j / 4)) * N + (i % 4) * 4 + (j % 4))
  }
  units.push(row, col, block)
}
const peers: number[][] = []
for (let c = 0; c < N * N; c++) {
  const set: number[] = []
  for (const unit of units) {
    if (unit.indexOf(c) < 0) continue
    for (const p of unit) if (p !== c && set.indexOf(p) < 0) set.push(p)
  }
  peers.push(set)
}

const popcount = (x: number): number => {
  let n = 0
  while (x) {
    x &= x - 1
    n++
  }
  return n
}
const bitIndex = (x: number): number => Math.round(Math.log2(x))

// Fix cell c to the single-bit mask `bit` and propagate; returns false on contradiction
const assign = (cand: number[], c: number, bit: number): boolean => {
  const stack: [number, number][] = [[c, bit]]
  while (stack.length > 0) {
    const [cell, b] = stack.pop()!
    if (!(cand[cell] & b)) return false
    cand[cell] = b
    for (const p of peers[cell]) {
      if (!(cand[p] & b)) continue
      cand[p] &= ~b
      if (cand[p] === 0) return false
      if (popcount(cand[p]) === 1) stack.push([p, cand[p]])
    }
  }
  return true
}

// Hidden singles until nothing changes; returns false on contradiction
const hiddenSingles = (cand: number[]): boolean => {
  let changed = true
  while (changed) {
    changed = false
    for (const unit of units) {
      for (let v = 0; v < N; v++) {
        const b = 1 << v
        let count = 0
        let where = -1
        for (const cell of unit) {
          if (cand[cell] & b) {
            count++
            where = cell
          }
        }
        if (count === 0) return false
        if (count === 1 && cand[where] !== b) {
          if (!assign(cand, where, b)) return false
          changed = true
        }
      }
    }
  }
  return true
}

const solve = (cand: number[]): number[] | null => {
  if (!hiddenSingles(cand)) return null
  // Branch on the cell with fewest candidates
  let best = -1
  let bestCount = N + 1
  for (let c = 0; c < N * N; c++) {
    const k = popcount(cand[c])
    if (k > 1 && k < bestCount) {
      bestCount = k
      best = c
    }
  }
  if (best < 0) return cand
  let options = cand[best]
  while (options) {
    const b = options & -options
    options &= ~b
    const copy = cand.slice()
    if (assign(copy, best, b)) {
      const result = solve(copy)
      if (result) return result
    }
  }
  return null
}

const cand: number[] = new Array(N * N).fill(ALL)
const givens: [number, number][] = []
for (let r = 0; r < N; r++) {
  const line = readline()
  for (let c = 0; c < N; c++) {
    if (line[c] !== ".") givens.push([r * N + c, 1 << (line.charCodeAt(c) - 65)])
  }
}
for (const [cell, b] of givens) assign(cand, cell, b)

const solution = solve(cand)!
for (let r = 0; r < N; r++) {
  let line = ""
  for (let c = 0; c < N; c++) line += String.fromCharCode(65 + bitIndex(solution[r * N + c]))
  console.log(line)
}
