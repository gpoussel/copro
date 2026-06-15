// 🎮 CodinGame Puzzle - sparse-matmul
// https://www.codingame.com/training/easy/sparse-matmul

const firstLine: string[] = readline().split(" ")
const m: number = parseInt(firstLine[0], 10)
void m
void firstLine[1]
void firstLine[2]

const counts: string[] = readline().split(" ")
const countA: number = parseInt(counts[0], 10)
const countB: number = parseInt(counts[1], 10)

interface Entry {
  row: number
  col: number
  value: number
}

const aEntries: Entry[] = []
for (let i = 0; i < countA; i++) {
  const parts: string[] = readline().split(" ")
  aEntries.push({
    row: parseInt(parts[0], 10),
    col: parseInt(parts[1], 10),
    value: parseFloat(parts[2]),
  })
}

// Group B by its row index j -> list of (k, value)
const bByRow: Map<number, Entry[]> = new Map<number, Entry[]>()
for (let i = 0; i < countB; i++) {
  const parts: string[] = readline().split(" ")
  const j: number = parseInt(parts[0], 10)
  const entry: Entry = {
    row: j,
    col: parseInt(parts[1], 10),
    value: parseFloat(parts[2]),
  }
  const bucket: Entry[] | undefined = bByRow.get(j)
  if (bucket === undefined) {
    bByRow.set(j, [entry])
  } else {
    bucket.push(entry)
  }
}

// Accumulate result[i][k] using a nested map: i -> (k -> value)
const result: Map<number, Map<number, number>> = new Map<number, Map<number, number>>()
for (const a of aEntries) {
  const bucket: Entry[] | undefined = bByRow.get(a.col)
  if (bucket === undefined) {
    continue
  }
  let rowMap: Map<number, number> | undefined = result.get(a.row)
  if (rowMap === undefined) {
    rowMap = new Map<number, number>()
    result.set(a.row, rowMap)
  }
  for (const b of bucket) {
    const prev: number = rowMap.get(b.col) ?? 0
    rowMap.set(b.col, prev + a.value * b.value)
  }
}

function formatValue(value: number): string {
  let v: number = value
  if (v === 0) {
    v = 0 // normalize -0 to 0
  }
  if (Number.isInteger(v)) {
    return v.toFixed(1)
  }
  return String(v)
}

const lines: string[] = []
const rows: number[] = Array.from(result.keys()).sort((x, y) => x - y)
for (const i of rows) {
  const rowMap: Map<number, number> = result.get(i) as Map<number, number>
  const cols: number[] = Array.from(rowMap.keys()).sort((x, y) => x - y)
  for (const k of cols) {
    const value: number = rowMap.get(k) as number
    if (value === 0) {
      continue
    }
    lines.push(`${i} ${k} ${formatValue(value)}`)
  }
}

console.log(lines.join("\n"))
