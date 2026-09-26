// 🎮 CodinGame Puzzle - txt2html
// https://www.codingame.com/training/hard/txt2html

// Border lines (starting with "+") delimit table rows; the "+" positions of
// the border above a row give the column boundaries. Each cell gathers the
// trimmed non-empty fragments of its lines, joined with a space.
const n = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < n; i++) lines.push(readline() ?? "")

const isBorder = (s: string): boolean => /^\s*\+[-+]*\s*$/.test(s)
const out: string[] = ["<table>"]
let corners: number[] = []
let cells: string[][] = []

const flush = (): void => {
  if (cells.length === 0) return
  out.push("<tr>" + cells.map(c => `<td>${c.join(" ")}</td>`).join("") + "</tr>")
  cells = []
}

let inRow = false
for (const line of lines) {
  if (isBorder(line)) {
    if (inRow) flush()
    corners = []
    for (let i = 0; i < line.length; i++) if (line[i] === "+") corners.push(i)
    cells = []
    for (let k = 0; k + 1 < corners.length; k++) cells.push([])
    inRow = false
    continue
  }
  inRow = true
  for (let k = 0; k + 1 < corners.length; k++) {
    const text = line.slice(corners[k] + 1, corners[k + 1]).trim()
    if (text !== "") cells[k].push(text)
  }
}
if (inRow) flush()
out.push("</table>")
console.log(out.join("\n"))
