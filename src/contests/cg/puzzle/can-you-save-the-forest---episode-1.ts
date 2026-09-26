// 🎮 CodinGame Puzzle - can-you-save-the-forest---episode-1
// https://www.codingame.com/training/medium/can-you-save-the-forest---episode-1

// Cell encoding: -2 empty, -1 burnt, 0 forest, 1..3 fire level
const SIZE = 10
const EMPTY = -2
const BURNT = -1
const FOREST = 0
const NEIGHBOURS = [[0, 1], [0, -1], [1, 0], [-1, 0]]

readline() // maxBurntForest, not needed to play

function parse(rows: string[]): number[] {
  const grid: number[] = []
  for (const row of rows) {
    for (const ch of row) grid.push(ch === "." ? EMPTY : ch === "*" ? BURNT : ch === "^" ? FOREST : Number(ch))
  }
  return grid
}

function spreadCount(grid: number[], cell: number): number {
  const r = Math.floor(cell / SIZE)
  const c = cell % SIZE
  let count = 0
  for (const [dr, dc] of NEIGHBOURS) {
    const nr = r + dr
    const nc = c + dc
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && grid[nr * SIZE + nc] === FOREST) count++
  }
  return count
}

// One game turn: extinguish, fires grow, level-3 fires burn out and spread
function step(grid: number[], target: number): number[] {
  const next = grid.slice()
  if (target >= 0) next[target] = FOREST
  const burning: number[] = []
  for (let i = 0; i < next.length; i++) {
    if (next[i] === 3) {
      next[i] = BURNT
      burning.push(i)
    } else if (next[i] > 0) next[i]++
  }
  for (const cell of burning) {
    const r = Math.floor(cell / SIZE)
    const c = cell % SIZE
    for (const [dr, dc] of NEIGHBOURS) {
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && next[nr * SIZE + nc] === FOREST) next[nr * SIZE + nc] = 1
    }
  }
  return next
}

const fires = (grid: number[]) => grid.map((v, i) => (v > 0 ? i : -1)).filter(i => i >= 0)

// Default policy: most developed fire first, then the one threatening the most forest
function greedyChoice(grid: number[]): number {
  let best = -1
  let bestScore = -1
  for (const cell of fires(grid)) {
    const score = grid[cell] * 10 + spreadCount(grid, cell)
    if (score > bestScore) {
      bestScore = score
      best = cell
    }
  }
  return best
}

function rollout(grid: number[], first: number): number {
  let current = step(grid, first)
  while (fires(current).length > 0) current = step(current, greedyChoice(current))
  return current.filter(v => v === BURNT).length
}

while (true) {
  const rows: string[] = []
  for (let i = 0; i < SIZE; i++) rows.push(readline())
  const grid = parse(rows)
  // Try every fire as this turn's target and finish the game greedily; ties go to the greedy pick
  let best = greedyChoice(grid)
  let bestBurnt = best < 0 ? 0 : rollout(grid, best)
  for (const cell of fires(grid)) {
    const burnt = rollout(grid, cell)
    if (burnt < bestBurnt) {
      bestBurnt = burnt
      best = cell
    }
  }
  if (best < 0) best = 0
  console.log(`${best % SIZE} ${Math.floor(best / SIZE)}`)
}
