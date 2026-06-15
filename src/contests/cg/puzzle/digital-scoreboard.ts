// 🎮 CodinGame Puzzle - digital-scoreboard
// https://www.codingame.com/training/easy/digital-scoreboard

function readGrid(): string[] {
  const g: string[] = []
  for (let i = 0; i < 7; i++) g.push(readline())
  return g
}
const start = readGrid()
readline()
const sub = readGrid()
readline()
const add = readGrid()

// Sample points (row, col) for the left digit's 7 segments: a f b g e c d.
const pts: [number, number][] = [
  [1, 3],
  [2, 2],
  [2, 6],
  [3, 3],
  [4, 2],
  [4, 6],
  [5, 3],
]

// Keys encode segments in order a b c d e f g.
const segMap: { [k: string]: string } = {
  "1111110": "0",
  "0110000": "1",
  "1101101": "2",
  "1111001": "3",
  "0110011": "4",
  "1011011": "5",
  "1011111": "6",
  "1110000": "7",
  "1111111": "8",
  "1111011": "9",
}

function on(g: string[], r: number, c: number): boolean {
  const ch = g[r][c]
  return ch === "~" || ch === "|"
}

function digit(offset: number): string {
  const segVals: { [s: string]: boolean } = {}
  const names = ["a", "f", "b", "g", "e", "c", "d"]
  for (let i = 0; i < pts.length; i++) {
    const [r, cc] = pts[i]
    const c = cc + offset
    let v = on(start, r, c)
    if (on(sub, r, c)) v = false
    if (on(add, r, c)) v = true
    segVals[names[i]] = v
  }
  const key = ["a", "b", "c", "d", "e", "f", "g"].map(s => (segVals[s] ? "1" : "0")).join("")
  return segMap[key] ?? "?"
}

console.log(digit(0) + digit(8))
