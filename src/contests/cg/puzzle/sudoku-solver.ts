// 🎮 CodinGame Puzzle - sudoku-solver
// https://www.codingame.com/training/medium/sudoku-solver

const grid: number[] = []
for (let i = 0; i < 9; i++) {
  const line: string = readline()
  for (let j = 0; j < 9; j++) grid.push(parseInt(line[j], 10))
}

const rows = new Array<number>(9).fill(0)
const cols = new Array<number>(9).fill(0)
const boxes = new Array<number>(9).fill(0)
const boxOf = (r: number, c: number): number => Math.floor(r / 3) * 3 + Math.floor(c / 3)

for (let r = 0; r < 9; r++) {
  for (let c = 0; c < 9; c++) {
    const v = grid[r * 9 + c]
    if (v) {
      const bit = 1 << v
      rows[r] |= bit
      cols[c] |= bit
      boxes[boxOf(r, c)] |= bit
    }
  }
}

function solve(): boolean {
  let best = -1
  let bestCount = 10
  let bestMask = 0
  for (let i = 0; i < 81; i++) {
    if (grid[i] !== 0) continue
    const r = Math.floor(i / 9)
    const c = i % 9
    const used = rows[r] | cols[c] | boxes[boxOf(r, c)]
    let count = 0
    let mask = 0
    for (let v = 1; v <= 9; v++) {
      if (!(used & (1 << v))) {
        count++
        mask |= 1 << v
      }
    }
    if (count === 0) return false
    if (count < bestCount) {
      bestCount = count
      best = i
      bestMask = mask
      if (count === 1) break
    }
  }
  if (best === -1) return true
  const r = Math.floor(best / 9)
  const c = best % 9
  const b = boxOf(r, c)
  for (let v = 1; v <= 9; v++) {
    const bit = 1 << v
    if (bestMask & bit) {
      grid[best] = v
      rows[r] |= bit
      cols[c] |= bit
      boxes[b] |= bit
      if (solve()) return true
      grid[best] = 0
      rows[r] &= ~bit
      cols[c] &= ~bit
      boxes[b] &= ~bit
    }
  }
  return false
}

solve()

const out: string[] = []
for (let r = 0; r < 9; r++) {
  let s = ""
  for (let c = 0; c < 9; c++) s += grid[r * 9 + c]
  out.push(s)
}
console.log(out.join("\n"))
