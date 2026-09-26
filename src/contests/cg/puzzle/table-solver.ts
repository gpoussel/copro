// 🎮 CodinGame Puzzle - table-solver
// https://www.codingame.com/training/medium/table-solver

const tsLineCount = parseInt(readline())
const tsRaw: string[] = []
for (let i = 0; i < tsLineCount; i++) tsRaw.push(readline())

// Keep only data rows (even line indices), split into trimmed cells
const cellsText = tsRaw.filter((_, i) => i % 2 === 0).map(line => line.split("|").map(c => c.trim()))
const operation = cellsText[0][0]
const rowsN = cellsText.length
const colsN = cellsText[0].length

const table: (number | null)[][] = cellsText.map((row, r) =>
  row.map((c, ci) => (r === 0 && ci === 0) || c === "" ? null : parseInt(c, 10)),
)

const combine = (rowH: number, colH: number): number =>
  operation === "+" ? colH + rowH : operation === "-" ? colH - rowH : colH * rowH

// Deduce missing headers from known inner cells until nothing changes
let progress = true
while (progress) {
  progress = false
  for (let r = 1; r < rowsN; r++) {
    for (let c = 1; c < colsN; c++) {
      const v = table[r][c]
      if (v === null) continue
      const rowH = table[r][0]
      const colH = table[0][c]
      if (rowH !== null && colH === null) {
        if (operation === "+") table[0][c] = v - rowH
        else if (operation === "-") table[0][c] = v + rowH
        else if (rowH !== 0) table[0][c] = v / rowH
        if (table[0][c] !== null) progress = true
      } else if (colH !== null && rowH === null) {
        if (operation === "+") table[r][0] = v - colH
        else if (operation === "-") table[r][0] = colH - v
        else if (colH !== 0) table[r][0] = v / colH
        if (table[r][0] !== null) progress = true
      }
    }
  }
}

for (let r = 1; r < rowsN; r++) {
  for (let c = 1; c < colsN; c++) {
    const rowH = table[r][0]
    const colH = table[0][c]
    if (table[r][c] === null && rowH !== null && colH !== null) table[r][c] = combine(rowH, colH)
  }
}

const texts = table.map((row, r) => row.map((v, c) => (r === 0 && c === 0 ? operation : v === null ? "" : String(v))))
let cellWidth = 1
for (const row of texts) for (const t of row) cellWidth = Math.max(cellWidth, t.length)

const padRight = (s: string) => {
  let out = s
  while (out.length < cellWidth) out += " "
  return out
}
let separator = ""
for (let i = 0; i < colsN * (cellWidth + 1) - 1; i++) separator += "_"

const tsOut: string[] = []
texts.forEach((row, r) => {
  if (r > 0) tsOut.push(separator)
  tsOut.push(row.map(padRight).join("|"))
})
console.log(tsOut.join("\n"))
