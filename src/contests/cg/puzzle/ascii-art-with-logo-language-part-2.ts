// 🎮 CodinGame Puzzle - ascii-art-with-logo-language-part-2
// https://www.codingame.com/training/medium/ascii-art-with-logo-language-part-2

const n = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < n; i++) lines.push(readline())
const program = lines.join(";")

// Headings every 45°, clockwise from North, as [dRow, dCol]
const HEADINGS: [number, number][] = [
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
]

// Splits a command list on top-level ";" (ignoring those nested inside brackets)
const splitCommands = (source: string): string[] => {
  const commands: string[] = []
  let depth = 0
  let current = ""
  for (const ch of source) {
    if (ch === "[") depth++
    if (ch === "]") depth--
    if (ch === ";" && depth === 0) {
      commands.push(current)
      current = ""
    } else current += ch
  }
  commands.push(current)
  return commands.map(c => c.trim()).filter(c => c.length > 0)
}

let background = " "
let pen = "#"
let penIndex = 0
let penDown = true
let heading = 0
let row = 0
let col = 0
let canvas = new Map<string, { row: number; col: number; ch: string }>()

const execute = (source: string): void => {
  for (const command of splitCommands(source)) {
    const spaceAt = command.search(/\s/)
    const name = (spaceAt < 0 ? command : command.slice(0, spaceAt)).toUpperCase()
    const arg = spaceAt < 0 ? "" : command.slice(spaceAt).trim()
    switch (name) {
      case "CS":
        background = arg
        canvas = new Map()
        break
      case "FD":
        for (let step = 0; step < parseInt(arg); step++) {
          if (penDown) {
            canvas.set(`${row},${col}`, { row, col, ch: pen[penIndex] })
            penIndex = (penIndex + 1) % pen.length
          }
          row += HEADINGS[heading][0]
          col += HEADINGS[heading][1]
        }
        break
      case "PU":
        penDown = false
        break
      case "PD":
        penDown = true
        break
      case "SETPC":
        pen = arg
        penIndex = 0
        break
      case "RT":
        heading = (heading + parseInt(arg) / 45) % 8
        break
      case "LT":
        heading = (((heading - parseInt(arg) / 45) % 8) + 8) % 8
        break
      case "RP": {
        const times = parseInt(arg)
        const body = arg.slice(arg.indexOf("[") + 1, arg.lastIndexOf("]"))
        for (let i = 0; i < times; i++) execute(body)
        break
      }
    }
  }
}
execute(program)

const cells: { row: number; col: number; ch: string }[] = []
canvas.forEach(cell => cells.push(cell))
const minRow = Math.min(...cells.map(c => c.row))
const maxRow = Math.max(...cells.map(c => c.row))
const minCol = Math.min(...cells.map(c => c.col))
const maxCol = Math.max(...cells.map(c => c.col))
const output: string[][] = []
for (let r = minRow; r <= maxRow; r++) output.push(new Array(maxCol - minCol + 1).fill(background))
for (const cell of cells) output[cell.row - minRow][cell.col - minCol] = cell.ch
console.log(output.map(line => line.join("").replace(/\s+$/, "")).join("\n"))
