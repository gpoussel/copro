// 🎮 CodinGame Puzzle - mosaic
// https://www.codingame.com/training/medium/mosaic

const n = Number(readline())
const grid: string[] = []
for (let i = 0; i < n; i++) grid.push(readline())

const UNKNOWN = -1
interface Clue {
  value: number
  cells: number[]
}

// Each clue constrains the number of filled cells in its 3x3 neighbourhood
const clues: Clue[] = []
const cluesOfCell: number[][] = []
for (let i = 0; i < n * n; i++) cluesOfCell.push([])
for (let r = 0; r < n; r++) {
  for (let c = 0; c < n; c++) {
    if (grid[r][c] === ".") continue
    const cells: number[] = []
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nc >= 0 && nr < n && nc < n) cells.push(nr * n + nc)
      }
    }
    for (const cell of cells) cluesOfCell[cell].push(clues.length)
    clues.push({ value: Number(grid[r][c]), cells })
  }
}

/** Applies the clue rules until nothing changes; returns false on a contradiction. */
function propagate(state: number[]): boolean {
  const pending: number[] = clues.map((_, i) => i)
  const queued: boolean[] = clues.map(() => true)
  while (pending.length > 0) {
    const index = pending.pop()!
    queued[index] = false
    const clue = clues[index]
    let filled = 0
    let unknown = 0
    for (const cell of clue.cells) {
      if (state[cell] === 1) filled++
      else if (state[cell] === UNKNOWN) unknown++
    }
    if (filled > clue.value || filled + unknown < clue.value) return false
    if (unknown === 0) continue
    let forced = UNKNOWN
    if (filled === clue.value) forced = 0
    else if (filled + unknown === clue.value) forced = 1
    if (forced === UNKNOWN) continue
    for (const cell of clue.cells) {
      if (state[cell] !== UNKNOWN) continue
      state[cell] = forced
      for (const other of cluesOfCell[cell]) {
        if (!queued[other]) {
          queued[other] = true
          pending.push(other)
        }
      }
    }
  }
  return true
}

function solve(state: number[]): number[] | null {
  if (!propagate(state)) return null
  // Branch on an unknown cell constrained by some clue
  let branch = -1
  for (let i = 0; i < state.length && branch < 0; i++) {
    if (state[i] === UNKNOWN && cluesOfCell[i].length > 0) branch = i
  }
  if (branch < 0) return state
  for (const value of [1, 0]) {
    const next = state.slice()
    next[branch] = value
    const result = solve(next)
    if (result) return result
  }
  return null
}

const solution = solve(new Array<number>(n * n).fill(UNKNOWN))!
for (let r = 0; r < n; r++) {
  let line = ""
  for (let c = 0; c < n; c++) line += solution[r * n + c] === 1 ? "#" : "."
  console.log(line)
}
