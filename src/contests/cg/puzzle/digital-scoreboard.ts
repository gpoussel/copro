// 🎮 CodinGame Puzzle - digital-scoreboard
// https://www.codingame.com/

// Segment positions inside a 7-row x 7-col digit cell.
// a=top, b=top-right, c=bottom-right, d=bottom, e=bottom-left, f=top-left, g=middle
const segments: { row: number; col: number; name: string }[] = [
  { row: 1, col: 3, name: "a" },
  { row: 2, col: 5, name: "b" },
  { row: 4, col: 5, name: "c" },
  { row: 5, col: 3, name: "d" },
  { row: 4, col: 1, name: "e" },
  { row: 2, col: 1, name: "f" },
  { row: 3, col: 3, name: "g" },
]

const digitToSegs: { [key: string]: string } = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged".split("").sort().join(""),
  "3": "abgcd".split("").sort().join(""),
  "4": "fgbc".split("").sort().join(""),
  "5": "afgcd".split("").sort().join(""),
  "6": "afgedc".split("").sort().join(""),
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg".split("").sort().join(""),
}

function readBoard(): string[] {
  const rows: string[] = []
  for (let i = 0; i < 7; i++) {
    rows.push(readline())
  }
  return rows
}

// Returns set of "digitIndex:segName" that are lit in this board.
function litSegments(rows: string[]): Set<string> {
  const lit = new Set<string>()
  const cellStarts = [1, 9] // column offset of each digit cell
  for (let d = 0; d < 2; d++) {
    const start = cellStarts[d]
    for (const seg of segments) {
      const ch = rows[seg.row]?.[start + seg.col]
      if (ch === "~" || ch === "|") {
        lit.add(`${d}:${seg.name}`)
      }
    }
  }
  return lit
}

const startBoard = readBoard()
const subLabel = readline() // "Subtract:"
void subLabel
const subBoard = readBoard()
const addLabel = readline() // "Add:"
void addLabel
const addBoard = readBoard()

const startLit = litSegments(startBoard)
const subLit = litSegments(subBoard)
const addLit = litSegments(addBoard)

const finalLit = new Set<string>(startLit)
for (const s of subLit) {
  finalLit.delete(s)
}
for (const s of addLit) {
  finalLit.add(s)
}

let result = ""
for (let d = 0; d < 2; d++) {
  const segs: string[] = []
  for (const seg of segments) {
    if (finalLit.has(`${d}:${seg.name}`)) {
      segs.push(seg.name)
    }
  }
  const key = segs.sort().join("")
  let found = "?"
  for (const digit of Object.keys(digitToSegs)) {
    if (digitToSegs[digit] === key) {
      found = digit
      break
    }
  }
  result += found
}

console.log(result)
