// 🎮 CodinGame Puzzle - popularity-of-each-activity
// https://www.codingame.com/

const height: number = parseInt(readline(), 10)
const grid: string[] = []
for (let i = 0; i < height; i++) {
  grid.push(readline())
}

const width: number = Math.max(...grid.map(row => row.length))

const isDividerRow = (row: string): boolean => row.includes("-") || row.includes("+")
const isDividerCol = (col: number): boolean =>
  grid.some(row => {
    const c: string = row[col]
    return c === ":" || c === "+"
  })

const rowBand = (r: number): number => {
  let band: number = 0
  for (let i = 0; i < r; i++) {
    if (isDividerRow(grid[i])) band++
  }
  return band
}

const colDividerCount: number[] = []
let dividers: number = 0
for (let c = 0; c < width; c++) {
  colDividerCount.push(dividers)
  if (isDividerCol(c)) dividers++
}

const counts: number[][] = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
]
let total: number = 0

for (let r = 0; r < height; r++) {
  if (isDividerRow(grid[r])) continue
  const rb: number = rowBand(r)
  const row: string = grid[r]
  for (let c = 0; c < row.length; c++) {
    if (row[c] === "*") {
      const cb: number = colDividerCount[c]
      counts[rb][cb]++
      total++
    }
  }
}

const format = (n: number): string => {
  const pct: number = Math.round((n / total) * 100)
  let s: string = pct + "%"
  while (s.length < 4) s = "_" + s
  return s
}

const out: string[] = [total + " attendees"]
for (let rb = 0; rb < 3; rb++) {
  out.push(counts[rb].map(n => format(n)).join(" "))
}
console.log(out.join("\n"))
