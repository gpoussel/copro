// 🎮 CodinGame Puzzle - minesweeper-1
// https://www.codingame.com/training/medium/minesweeper-1

const W = 30
const H = 16
const MINES = 99
const SIZE = W * H

const neighbours: number[][] = []
for (let cell = 0; cell < SIZE; cell++) {
  const x = cell % W
  const y = Math.floor(cell / W)
  const list: number[] = []
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx
      const ny = y + dy
      if ((dx || dy) && nx >= 0 && ny >= 0 && nx < W && ny < H) list.push(ny * W + nx)
    }
  }
  neighbours.push(list)
}

interface Constraint {
  cells: number[] // unknown, non-mine cells around a number
  mines: number // mines still to place among them
}

const isMine: boolean[] = new Array<boolean>(SIZE).fill(false)

/** C(n, k) as a float. */
function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  let result = 1
  for (let i = 1; i <= Math.min(k, n - k); i++) result = (result * (n - k + i)) / i
  return result
}

function buildConstraints(cells: string[]): Constraint[] {
  const constraints: Constraint[] = []
  for (let cell = 0; cell < SIZE; cell++) {
    const ch = cells[cell]
    if (ch === "?") continue
    const value = ch === "." ? 0 : Number(ch)
    const unknown: number[] = []
    let mines = value
    for (const other of neighbours[cell]) {
      if (cells[other] !== "?") continue
      if (isMine[other]) mines--
      else unknown.push(other)
    }
    if (unknown.length > 0) constraints.push({ cells: unknown, mines })
  }
  return constraints
}

/** Trivial and subset deductions; returns the safe cells found (mines are recorded). */
function deduce(cells: string[]): number[] {
  const safe = new Set<number>()
  let changed = true
  while (changed && safe.size === 0) {
    changed = false
    const constraints = buildConstraints(cells)
    for (const c of constraints) {
      if (c.mines === 0) c.cells.forEach(cell => safe.add(cell))
      else if (c.mines === c.cells.length) {
        c.cells.forEach(cell => (isMine[cell] = true))
        changed = true
      }
    }
    if (safe.size > 0 || changed) continue
    for (const a of constraints) {
      for (const b of constraints) {
        if (a === b || a.cells.length >= b.cells.length) continue
        if (!a.cells.every(cell => b.cells.indexOf(cell) >= 0)) continue
        const diff = b.cells.filter(cell => a.cells.indexOf(cell) < 0)
        const mines = b.mines - a.mines
        if (mines === 0) diff.forEach(cell => safe.add(cell))
        else if (mines === diff.length) {
          diff.forEach(cell => (isMine[cell] = true))
          changed = true
        }
      }
    }
  }
  return Array.from(safe)
}

interface Component {
  cells: number[]
  // counts[k] = number of solutions with k mines, cellCounts[k][i] = those where cell i is a mine
  counts: number[]
  cellCounts: number[][]
}

/** Enumerates the solutions of a group of linked frontier cells. */
function enumerate(cells: number[], constraints: Constraint[], budget: { nodes: number }): Component | null {
  const index = new Map<number, number>()
  cells.forEach((cell, i) => index.set(cell, i))
  const local = constraints.map(c => c.cells.map(cell => index.get(cell)!))
  const byCell: number[][] = cells.map(() => [])
  local.forEach((c, ci) => c.forEach(i => byCell[i].push(ci)))
  const placed = local.map(() => 0)
  const free = local.map(c => c.length)
  const assignment: number[] = new Array<number>(cells.length).fill(0)
  const counts: number[] = new Array<number>(cells.length + 1).fill(0)
  const cellCounts: number[][] = counts.map(() => new Array<number>(cells.length).fill(0))

  let aborted = false
  const walk = (i: number, mines: number): void => {
    if (aborted) return
    if (--budget.nodes < 0) {
      aborted = true
      return
    }
    if (i === cells.length) {
      counts[mines]++
      for (let j = 0; j < cells.length; j++) if (assignment[j]) cellCounts[mines][j]++
      return
    }
    for (const value of [0, 1]) {
      let ok = true
      for (const ci of byCell[i]) {
        free[ci]--
        placed[ci] += value
        const need = constraints[ci].mines
        if (placed[ci] > need || placed[ci] + free[ci] < need) ok = false
      }
      assignment[i] = value
      if (ok) walk(i + 1, mines + value)
      for (const ci of byCell[i]) {
        free[ci]++
        placed[ci] -= value
      }
      assignment[i] = 0
    }
  }
  walk(0, 0)
  return aborted ? null : { cells, counts, cellCounts }
}

/** Mine probability of every unknown cell, using exact enumeration when affordable. */
function probabilities(cells: string[]): Map<number, number> {
  const constraints = buildConstraints(cells)
  const result = new Map<number, number>()
  const unknown: number[] = []
  let knownMines = 0
  for (let cell = 0; cell < SIZE; cell++) {
    if (cells[cell] !== "?") continue
    if (isMine[cell]) knownMines++
    else unknown.push(cell)
  }

  // Group frontier cells linked by shared constraints (union-find)
  const parent = new Map<number, number>()
  const find = (a: number): number => {
    while (parent.get(a)! !== a) a = parent.get(a)!
    return a
  }
  for (const c of constraints) for (const cell of c.cells) if (!parent.has(cell)) parent.set(cell, cell)
  for (const c of constraints) for (const cell of c.cells) parent.set(find(cell), find(c.cells[0]))
  const groups = new Map<number, number[]>()
  parent.forEach((_, cell) => {
    const root = find(cell)
    if (!groups.has(root)) groups.set(root, [])
    groups.get(root)!.push(cell)
  })

  const components: Component[] = []
  const budget = { nodes: 40000 }
  let exact = true
  groups.forEach(groupCells => {
    // Order cells so that constraints get decided early
    const ordered: number[] = []
    const seen = new Set<number>()
    const queue = [groupCells[0]]
    seen.add(groupCells[0])
    while (queue.length > 0) {
      const cell = queue.shift()!
      ordered.push(cell)
      for (const c of constraints) {
        if (c.cells.indexOf(cell) < 0) continue
        for (const other of c.cells) {
          if (!seen.has(other)) {
            seen.add(other)
            queue.push(other)
          }
        }
      }
    }
    const related = constraints.filter(c => seen.has(c.cells[0]))
    const component = exact ? enumerate(ordered, related, budget) : null
    if (component) components.push(component)
    else exact = false
  })

  const frontier = new Set<number>()
  parent.forEach((_, cell) => frontier.add(cell))
  const interior = unknown.filter(cell => !frontier.has(cell))
  const remaining = MINES - knownMines

  if (!exact) {
    // Fallback: local estimate from the constraints
    for (const cell of unknown) result.set(cell, frontier.has(cell) ? 0 : remaining / unknown.length)
    for (const c of constraints) {
      for (const cell of c.cells) result.set(cell, Math.max(result.get(cell)!, c.mines / c.cells.length))
    }
    return result
  }

  // Combine the components, weighting by the ways to place the remaining mines inside
  const convolve = (a: number[], b: number[]): number[] => {
    const out: number[] = new Array<number>(a.length + b.length - 1).fill(0)
    a.forEach((x, i) => b.forEach((y, j) => (out[i + j] += x * y)))
    return out
  }
  let total = 0
  let interiorMines = 0
  const all = components.reduce((acc, comp) => convolve(acc, comp.counts), [1])
  all.forEach((ways, k) => {
    const w = ways * binomial(interior.length, remaining - k)
    total += w
    if (interior.length > 0) interiorMines += w * (remaining - k)
  })
  for (const cell of interior) result.set(cell, interiorMines / total / interior.length)
  components.forEach((comp, ci) => {
    const others = components.reduce((acc, c, j) => (j === ci ? acc : convolve(acc, c.counts)), [1])
    comp.cells.forEach((cell, i) => {
      let mineWeight = 0
      comp.cellCounts.forEach((perCell, k) => {
        if (perCell[i] === 0) return
        others.forEach((ways, t) => (mineWeight += perCell[i] * ways * binomial(interior.length, remaining - k - t)))
      })
      result.set(cell, mineWeight / total)
    })
  })
  return result
}

let firstTurn = true
while (true) {
  const cells: string[] = []
  for (let y = 0; y < H; y++) cells.push(...readline().trim().split(" "))
  let target: number
  if (firstTurn) {
    firstTurn = false
    target = Math.floor(H / 2) * W + Math.floor(W / 2)
  } else {
    const safe = deduce(cells)
    if (safe.length > 0) target = safe[0]
    else {
      const probs = probabilities(cells)
      target = -1
      let bestP = Infinity
      probs.forEach((p, cell) => {
        if (cells[cell] !== "?" || isMine[cell]) return
        // Prefer corners/edges on ties: fewer neighbours, more likely to open space
        const score = p + neighbours[cell].length * 1e-6
        if (score < bestP) {
          bestP = score
          target = cell
        }
      })
      if (target < 0) target = cells.indexOf("?")
    }
  }
  console.log(`${target % W} ${Math.floor(target / W)}`)
}
