// 🎮 CodinGame Puzzle - html-table-cell-split
// https://www.codingame.com/training/medium/html-table-cell-split

interface Cell {
  row: number
  col: number
  cs: number
  rs: number
}

const nr = parseInt(readline())
const cells: Cell[] = []
// Occupancy map keyed by "row,col", filled as in the HTML table layout algorithm
const occupied = new Set<string>()
for (let r = 0; r < nr; r++) {
  const line = readline().trim()
  let col = 0
  if (line === "") continue
  for (const token of line.split(/\s+/)) {
    const [cs, rs] = token.split(",").map(Number)
    while (occupied.has(`${r},${col}`)) col++
    cells.push({ row: r, col, cs, rs })
    for (let dr = 0; dr < rs; dr++) for (let dc = 0; dc < cs; dc++) occupied.add(`${r + dr},${col + dc}`)
    col += cs
  }
}

const [isStr, ds] = readline().trim().split(" ")
const target = cells[parseInt(isStr)]
let rowCount = nr

if (ds === "C") {
  const c = target.col
  for (const cell of cells) {
    if (cell === target) continue
    if (cell.col <= c && c < cell.col + cell.cs) cell.cs++
    else if (cell.col > c) cell.col++
  }
  cells.push({ row: target.row, col: c + 1, cs: 1, rs: target.rs })
} else {
  const r = target.row
  for (const cell of cells) {
    if (cell === target) continue
    if (cell.row <= r && r < cell.row + cell.rs) cell.rs++
    else if (cell.row > r) cell.row++
  }
  cells.push({ row: r + 1, col: target.col, cs: target.cs, rs: 1 })
  rowCount++
}

const rows: Cell[][] = []
for (let r = 0; r < rowCount; r++) rows.push([])
for (const cell of cells) rows[cell.row].push(cell)
for (const row of rows) {
  row.sort((a, b) => a.col - b.col)
  console.log(row.map(cell => `${cell.cs},${cell.rs}`).join(" "))
}
