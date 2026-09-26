// 🎮 CodinGame Puzzle - pips
// https://www.codingame.com/training/medium/pips

const [height, width] = readline().trim().split(/\s+/).map(Number)
const board: number[][] = []
for (let i = 0; i < height; i++) board.push(readline().trim().split(/\s+/).map(Number))

interface Rule {
  kind: string
  value: number
  size: number // number of cells in the region
  filled: number
  sum: number
  seen: number[] // occurrences of each pip value 0..6
}

const rulesCount = parseInt(readline())
const rules: Rule[] = []
for (let i = 0; i < rulesCount; i++) {
  const [id, kind, value] = readline().trim().split(/\s+/)
  rules[Number(id)] = { kind, value: Number(value), size: 0, filled: 0, sum: 0, seen: [0, 0, 0, 0, 0, 0, 0] }
}
for (const row of board) for (const id of row) if (id > 0) rules[id].size++

const dominoesCount = parseInt(readline())
const dominoes: [number, number][] = []
for (let i = 0; i < dominoesCount; i++) {
  const [a, b] = readline().trim().split(/\s+/).map(Number)
  dominoes.push([a, b])
}

const values: number[][] = board.map(row => row.map(() => -1))
const used: boolean[] = dominoes.map(() => false)
const placements: string[] = []

// Pip values of the halves of still unused dominoes, to bound what regions can still receive
const available: number[] = [0, 0, 0, 0, 0, 0, 0]
for (const [a, b] of dominoes) {
  available[a]++
  available[b]++
}

function extremeSum(count: number, largest: boolean): number {
  let total = 0
  for (let k = 0; k < 7 && count > 0; k++) {
    const v = largest ? 6 - k : k
    const take = Math.min(count, available[v])
    total += take * v
    count -= take
  }
  return total
}

// Can the region of this rule still be satisfied with the remaining halves?
function isConsistent(rule: Rule): boolean {
  const remaining = rule.size - rule.filled
  switch (rule.kind) {
    case "==": {
      const present = rule.seen.map((count, v) => (count > 0 ? v : -1)).filter(v => v >= 0)
      return present.length === 0 || (present.length === 1 && available[present[0]] >= remaining)
    }
    case "!=":
      return rule.seen.every(count => count <= 1)
    case "<":
      return rule.sum + extremeSum(remaining, false) < rule.value
    case ">":
      return rule.sum + extremeSum(remaining, true) > rule.value
    default:
      return rule.sum + extremeSum(remaining, false) <= rule.value && rule.sum + extremeSum(remaining, true) >= rule.value
  }
}

const allRules = rules.filter(rule => rule !== undefined)

function setCell(r: number, c: number, value: number, delta: number): void {
  values[r][c] = delta > 0 ? value : -1
  const id = board[r][c]
  if (id <= 0) return
  const rule = rules[id]
  rule.filled += delta
  rule.sum += delta * value
  rule.seen[value] += delta
}

function isFree(r: number, c: number): boolean {
  return r >= 0 && r < height && c >= 0 && c < width && board[r][c] >= 0 && values[r][c] < 0
}

const STEPS: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
]

function freeNeighbors(r: number, c: number): [number, number][] {
  return STEPS.map(([dr, dc]): [number, number] => [r + dr, c + dc]).filter(([nr, nc]) => isFree(nr, nc))
}

function solve(): boolean {
  // Most constrained empty cell first (fewest free neighbours); a dead cell means a dead end
  let best: [number, number] | null = null
  let bestNeighbors: [number, number][] = []
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (!isFree(r, c)) continue
      const neighbors = freeNeighbors(r, c)
      if (neighbors.length === 0) return false
      if (best === null || neighbors.length < bestNeighbors.length) {
        best = [r, c]
        bestNeighbors = neighbors
      }
    }
  }
  if (best === null) return true

  for (const [nr, nc] of bestNeighbors) {
    // Anchor the domino on its top/left half, as the output expects
    const [r0, c0, r1, c1] = nr * width + nc < best[0] * width + best[1] ? [nr, nc, best[0], best[1]] : [best[0], best[1], nr, nc]
    const orientation = r0 === r1 ? 0 : 1
    for (let i = 0; i < dominoes.length; i++) {
      if (used[i]) continue
      const [a, b] = dominoes[i]
      const orders: [number, number][] = a === b ? [[a, b]] : [[a, b], [b, a]]
      for (const [first, second] of orders) {
        setCell(r0, c0, first, 1)
        setCell(r1, c1, second, 1)
        available[a]--
        available[b]--
        if (allRules.every(isConsistent)) {
          used[i] = true
          placements.push(`${first} ${second} ${c0} ${r0} ${orientation}`)
          if (solve()) return true
          placements.pop()
          used[i] = false
        }
        available[a]++
        available[b]++
        setCell(r1, c1, second, -1)
        setCell(r0, c0, first, -1)
      }
    }
  }
  return false
}

solve()
placements.forEach(line => console.log(line))
