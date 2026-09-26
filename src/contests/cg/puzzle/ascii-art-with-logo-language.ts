// 🎮 CodinGame Puzzle - ascii-art-with-logo-language
// https://www.codingame.com/training/medium/ascii-art-with-logo-language

// Headings: 0 = North, 1 = East, 2 = South, 3 = West
const DR = [-1, 0, 1, 0]
const DC = [0, 1, 0, -1]

let row = 0
let col = 0
let heading = 0
let penDown = true
let penSymbol = "#"
let background = " "
let drawn: { [key: string]: string } = {}

const lineCount = parseInt(readline())
for (let i = 0; i < lineCount; i++) {
  for (const raw of readline().split(";")) {
    const instr = raw.trim()
    if (!instr) continue
    const space = instr.indexOf(" ")
    const cmd = (space < 0 ? instr : instr.substring(0, space)).toUpperCase()
    const arg = space < 0 ? "" : instr.substring(space + 1).trim()
    if (cmd === "CS") {
      background = arg || " "
      drawn = {}
    } else if (cmd === "FD") {
      const steps = parseInt(arg)
      for (let s = 0; s < steps; s++) {
        if (penDown) drawn[`${row},${col}`] = penSymbol
        row += DR[heading]
        col += DC[heading]
      }
    } else if (cmd === "RT") heading = (heading + parseInt(arg) / 90) % 4
    else if (cmd === "LT") heading = (((heading - parseInt(arg) / 90) % 4) + 4) % 4
    else if (cmd === "PU") penDown = false
    else if (cmd === "PD") penDown = true
    else if (cmd === "SETPC") penSymbol = arg
  }
}

let minR = Infinity
let maxR = -Infinity
let minC = Infinity
let maxC = -Infinity
for (const key in drawn) {
  const [r, c] = key.split(",").map(Number)
  minR = Math.min(minR, r)
  maxR = Math.max(maxR, r)
  minC = Math.min(minC, c)
  maxC = Math.max(maxC, c)
}

const lines: string[] = []
for (let r = minR; r <= maxR; r++) {
  let line = ""
  for (let c = minC; c <= maxC; c++) {
    const ch = drawn[`${r},${c}`]
    line += ch === undefined ? background : ch
  }
  lines.push(line.replace(/ +$/, ""))
}
console.log(lines.join("\n"))
