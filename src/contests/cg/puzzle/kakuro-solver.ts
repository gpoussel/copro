// 🎮 CodinGame Puzzle - kakuro-solver
// https://www.codingame.com/training/hard/kakuro-solver

// Backtracking with the "fewest candidates first" heuristic. A cell's
// candidates are the digits allowed by every run it belongs to: a run with k
// open cells, remaining sum s and used digits U allows the digits of any
// k-subset of unused digits summing to s (precomputed over all 512 subsets).

const [H, W] = readline().split(" ").map(Number)
const tokens: string[][] = []
for (let r = 0; r < H; r++) {
  const parts = readline().split("|")
  tokens.push(parts.slice(1, W + 1).map(t => t.trim()))
}

type Run = { sum: number; cells: number[] }
const value = new Array(H * W).fill(0) // 0 = empty, -1 = not a digit cell
const runsOf: number[][] = Array.from({ length: H * W }, () => [])
const runs: Run[] = []

for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    const t = tokens[r][c]
    if (t === "") value[r * W + c] = 0
    else if (/^\d$/.test(t)) value[r * W + c] = Number(t)
    else value[r * W + c] = -1
  }
}
const isCell = (r: number, c: number) => r >= 0 && r < H && c >= 0 && c < W && value[r * W + c] >= 0
for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    const t = tokens[r][c]
    if (!t.includes("\\")) continue
    const [down, right] = t.split("\\")
    const add = (sum: number, dr: number, dc: number) => {
      const cells: number[] = []
      for (let rr = r + dr, cc = c + dc; isCell(rr, cc); rr += dr, cc += dc) cells.push(rr * W + cc)
      runs.push({ sum, cells })
      for (const cell of cells) runsOf[cell].push(runs.length - 1)
    }
    if (down !== "") add(Number(down), 1, 0)
    if (right !== "") add(Number(right), 0, 1)
  }
}

// subsets of digits 1..9 (bit d-1) grouped by size and sum
const bySizeSum: number[][][] = Array.from({ length: 10 }, () => Array.from({ length: 46 }, () => []))
for (let m = 0; m < 512; m++) {
  let size = 0
  let sum = 0
  for (let d = 1; d <= 9; d++) {
    if (m & (1 << (d - 1))) {
      size++
      sum += d
    }
  }
  bySizeSum[size][sum].push(m)
}

// digits allowed in the open cells of a run
const runMask = (run: Run): number => {
  let used = 0
  let open = 0
  let rest = run.sum
  for (const cell of run.cells) {
    const v = value[cell]
    if (v === 0) open++
    else {
      if (used & (1 << (v - 1))) return 0
      used |= 1 << (v - 1)
      rest -= v
    }
  }
  if (open === 0) return rest === 0 ? 511 : 0
  if (rest < 1 || rest > 45) return 0
  let mask = 0
  for (const s of bySizeSum[open][rest]) if ((s & used) === 0) mask |= s
  return mask
}

const cellMask = (cell: number) => {
  let mask = 511
  for (const ri of runsOf[cell]) mask &= runMask(runs[ri])
  return mask
}

const empties = value.map((v, i) => (v === 0 ? i : -1)).filter(i => i >= 0)

const solve = (): boolean => {
  let best = -1
  let bestMask = 0
  let bestCount = 10
  for (const cell of empties) {
    if (value[cell] !== 0) continue
    const mask = cellMask(cell)
    let count = 0
    for (let m = mask; m; m &= m - 1) count++
    if (count === 0) return false
    if (count < bestCount) {
      best = cell
      bestMask = mask
      bestCount = count
      if (count === 1) break
    }
  }
  if (best < 0) return true
  for (let d = 1; d <= 9; d++) {
    if (!(bestMask & (1 << (d - 1)))) continue
    value[best] = d
    if (solve()) return true
  }
  value[best] = 0
  return false
}
solve()

const out: string[] = []
for (let r = 0; r < H; r++) {
  const row: string[] = []
  for (let c = 0; c < W; c++) row.push(value[r * W + c] > 0 ? String(value[r * W + c]) : tokens[r][c])
  out.push(row.join(","))
}
console.log(out.join("\n"))
