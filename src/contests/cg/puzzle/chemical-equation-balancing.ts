// 🎮 CodinGame Puzzle - chemical-equation-balancing
// https://www.codingame.com/training/expert/chemical-equation-balancing

// Build the element × molecule matrix (products counted negatively) and find
// its one-dimensional null space. Integer (fraction-free) Gauss-Jordan with
// BigInt keeps everything exact; each row is divided by its gcd. The free
// column gets the value L = lcm of the pivots, each pivot variable gets
// -row[free] * L / pivot, and the vector is reduced by its gcd.

const equation = readline().trim()
const [leftSide, rightSide] = equation.split(" -> ")
const leftMols = leftSide.split(" + ")
const rightMols = rightSide.split(" + ")
const molecules = [...leftMols, ...rightMols]

const elementIndex = new Map<string, number>()
const columns: Map<number, bigint>[] = molecules.map((mol, m) => {
  const counts = new Map<number, bigint>()
  const sign = m < leftMols.length ? 1n : -1n
  for (const [, el, num] of mol.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    if (!elementIndex.has(el)) elementIndex.set(el, elementIndex.size)
    const e = elementIndex.get(el) as number
    counts.set(e, (counts.get(e) ?? 0n) + sign * BigInt(num || "1"))
  }
  return counts
})

const cols = molecules.length
const abs = (a: bigint): bigint => (a < 0n ? -a : a)
const gcd = (a: bigint, b: bigint): bigint => {
  a = abs(a)
  b = abs(b)
  while (b) [a, b] = [b, a % b]
  return a
}
const reduceRow = (row: bigint[]): void => {
  const g = row.reduce((acc, x) => gcd(acc, x), 0n)
  if (g > 1n) for (let i = 0; i < row.length; i++) row[i] /= g
}

const rows: bigint[][] = [...elementIndex.values()].map(e => columns.map(c => c.get(e) ?? 0n))
const pivotCols: number[] = []
let r = 0
for (let c = 0; c < cols && r < rows.length; c++) {
  const p = rows.findIndex((row, i) => i >= r && row[c] !== 0n)
  if (p < 0) continue
  ;[rows[r], rows[p]] = [rows[p], rows[r]]
  for (let i = 0; i < rows.length; i++) {
    if (i === r || rows[i][c] === 0n) continue
    const a = rows[r][c]
    const b = rows[i][c]
    rows[i] = rows[i].map((x, k) => x * a - rows[r][k] * b)
    reduceRow(rows[i])
  }
  pivotCols.push(c)
  r++
}

const freeCol = [...Array(cols).keys()].find(c => !pivotCols.includes(c)) as number
let scale = 1n
pivotCols.forEach((_, i) => {
  const p = abs(rows[i][pivotCols[i]])
  scale = (scale / gcd(scale, p)) * p
})
const coefs: bigint[] = new Array<bigint>(cols).fill(0n)
coefs[freeCol] = scale
pivotCols.forEach((c, i) => (coefs[c] = (-rows[i][freeCol] * scale) / rows[i][c]))
reduceRow(coefs)
if (coefs[0] < 0n) for (let i = 0; i < cols; i++) coefs[i] = -coefs[i]

const fmt = (mol: string, i: number): string => (coefs[i] === 1n ? mol : `${coefs[i]}${mol}`)
const leftOut = leftMols.map((m, i) => fmt(m, i)).join(" + ")
const rightOut = rightMols.map((m, i) => fmt(m, i + leftMols.length)).join(" + ")
console.log(`${leftOut} -> ${rightOut}`)
