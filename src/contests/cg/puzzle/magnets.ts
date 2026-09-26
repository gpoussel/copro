// 🎮 CodinGame Puzzle - magnets
// https://www.codingame.com/training/hard/magnets

// Solve the whole board on the first turn with a backtracking search over the
// two-cell regions (options: "+-", "-+" or wooden block), always branching on
// the region with the fewest consistent options. Row/column counts are checked
// both ways (never exceeded, still reachable with the undecided regions) and
// equal poles may never touch. Then output one region per turn.

const mgW = parseInt(readline())
const mgH = parseInt(readline())
const plusRow = readline().trim().split(/\s+/).map(Number)
const plusCol = readline().trim().split(/\s+/).map(Number)
const minusRow = readline().trim().split(/\s+/).map(Number)
const minusCol = readline().trim().split(/\s+/).map(Number)

const EMPTY = 0
const PLUS = 1
const MINUS = 2
const BLOCK = 3

let boardRows: string[] = []
for (let r = 0; r < mgH; r++) boardRows.push(readline())

// Pair identical adjacent letters into regions
const regionOf: number[] = new Array(mgW * mgH).fill(-1)
const regions: [number, number][] = []
for (let r = 0; r < mgH; r++) {
  for (let c = 0; c < mgW; c++) {
    const p = r * mgW + c
    if (regionOf[p] >= 0) continue
    const ch = boardRows[r][c]
    let q = -1
    if (c + 1 < mgW && boardRows[r][c + 1] === ch && regionOf[p + 1] < 0) q = p + 1
    else if (r + 1 < mgH && boardRows[r + 1][c] === ch && regionOf[p + mgW] < 0) q = p + mgW
    if (q < 0) continue
    regionOf[p] = regionOf[q] = regions.length
    regions.push([p, q])
  }
}

const cellVal = new Uint8Array(mgW * mgH)
const cnt = {
  plusR: new Int32Array(mgH),
  minusR: new Int32Array(mgH),
  plusC: new Int32Array(mgW),
  minusC: new Int32Array(mgW),
  openR: new Int32Array(mgH), // undecided regions able to add a pole to the row
  openC: new Int32Array(mgW),
}
const choice = new Int8Array(regions.length).fill(-1)

// Undecided capacity: a region counts once per distinct row/column it covers
const regionLines = regions.map(([a, b]) => {
  const rows = [...new Set([Math.floor(a / mgW), Math.floor(b / mgW)])]
  const cols = [...new Set([a % mgW, b % mgW])]
  return { rows, cols }
})
for (const { rows, cols } of regionLines) {
  for (const r of rows) cnt.openR[r]++
  for (const c of cols) cnt.openC[c]++
}

// option 0: first cell +, option 1: first cell -, option 2: block
const valuesFor = (opt: number): [number, number] =>
  opt === 0 ? [PLUS, MINUS] : opt === 1 ? [MINUS, PLUS] : [BLOCK, BLOCK]

const setCell = (p: number, v: number, sign: number): void => {
  const r = Math.floor(p / mgW)
  const c = p % mgW
  if (v === PLUS) {
    cnt.plusR[r] += sign
    cnt.plusC[c] += sign
  } else if (v === MINUS) {
    cnt.minusR[r] += sign
    cnt.minusC[c] += sign
  }
  cellVal[p] = sign > 0 ? v : EMPTY
}

const neighbours = (p: number): number[] => {
  const r = Math.floor(p / mgW)
  const c = p % mgW
  const res: number[] = []
  if (r > 0) res.push(p - mgW)
  if (r + 1 < mgH) res.push(p + mgW)
  if (c > 0) res.push(p - 1)
  if (c + 1 < mgW) res.push(p + 1)
  return res
}
const neigh = Array.from({ length: mgW * mgH }, (_, p) => neighbours(p))

const lineOk = (have: number, target: number, open: number): boolean =>
  target < 0 || (have <= target && have + open >= target)

const apply = (idx: number, opt: number, sign: number): void => {
  const [a, b] = regions[idx]
  const [va, vb] = valuesFor(opt)
  setCell(a, va, sign)
  setCell(b, vb, sign)
  for (const r of regionLines[idx].rows) cnt.openR[r] -= sign
  for (const c of regionLines[idx].cols) cnt.openC[c] -= sign
  choice[idx] = sign > 0 ? opt : -1
}

const consistentAfter = (idx: number): boolean => {
  const [a, b] = regions[idx]
  for (const p of [a, b]) {
    const v = cellVal[p]
    if (v === PLUS || v === MINUS) for (const q of neigh[p]) if (q !== a && q !== b && cellVal[q] === v) return false
  }
  for (const r of regionLines[idx].rows)
    if (!lineOk(cnt.plusR[r], plusRow[r], cnt.openR[r]) || !lineOk(cnt.minusR[r], minusRow[r], cnt.openR[r]))
      return false
  for (const c of regionLines[idx].cols)
    if (!lineOk(cnt.plusC[c], plusCol[c], cnt.openC[c]) || !lineOk(cnt.minusC[c], minusCol[c], cnt.openC[c]))
      return false
  return true
}

// Lines touched by a region also lose capacity when it becomes a block, so
// consistency must be checked on every line of the region's neighbours too:
// here we simply re-check all lines when needed
const allLinesOk = (): boolean => {
  for (let r = 0; r < mgH; r++)
    if (!lineOk(cnt.plusR[r], plusRow[r], cnt.openR[r]) || !lineOk(cnt.minusR[r], minusRow[r], cnt.openR[r]))
      return false
  for (let c = 0; c < mgW; c++)
    if (!lineOk(cnt.plusC[c], plusCol[c], cnt.openC[c]) || !lineOk(cnt.minusC[c], minusCol[c], cnt.openC[c]))
      return false
  return true
}

const validOptions = (idx: number): number[] => {
  const res: number[] = []
  for (let opt = 0; opt < 3; opt++) {
    apply(idx, opt, 1)
    if (consistentAfter(idx)) res.push(opt)
    apply(idx, opt, -1)
  }
  return res
}

const solve = (left: number): boolean => {
  if (left === 0) return allLinesOk()
  let bestIdx = -1
  let bestOpts: number[] = []
  for (let i = 0; i < regions.length; i++) {
    if (choice[i] >= 0) continue
    const opts = validOptions(i)
    if (opts.length === 0) return false
    if (bestIdx < 0 || opts.length < bestOpts.length) {
      bestIdx = i
      bestOpts = opts
      if (opts.length === 1) break
    }
  }
  for (const opt of bestOpts) {
    apply(bestIdx, opt, 1)
    if (allLinesOk() && solve(left - 1)) return true
    apply(bestIdx, opt, -1)
  }
  return false
}

solve(regions.length)

// One region per turn
for (let i = 0; i < regions.length; i++) {
  if (i > 0) {
    boardRows = []
    for (let r = 0; r < mgH; r++) {
      const line = readline()
      if (line === undefined) break
      boardRows.push(line)
    }
  }
  const [a] = regions[i]
  const v = cellVal[a]
  const sym = v === PLUS ? "+" : v === MINUS ? "-" : "x"
  console.log(`${a % mgW} ${Math.floor(a / mgW)} ${sym}`)
}
