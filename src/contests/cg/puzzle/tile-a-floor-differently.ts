// 🎮 CodinGame Puzzle - tile-a-floor-differently
// https://www.codingame.com/

const n: number = parseInt(readline())
const tl: string[][] = []
for (let i = 0; i < n; i++) {
  const row: string = readline()
  const chars: string[] = []
  for (let j = 0; j < n; j++) {
    chars.push(j < row.length ? row[j] : " ")
  }
  tl.push(chars)
}

const hMap: Record<string, string> = { b: "d", d: "b", p: "q", q: "p", "/": "\\", "\\": "/" }
const vMap: Record<string, string> = { b: "p", p: "b", d: "q", q: "d", "/": "\\", "\\": "/" }
const hFlip = (c: string): string => hMap[c] ?? c
const vFlip = (c: string): string => vMap[c] ?? c

const size: number = 2 * n
const tile: string[][] = []
for (let r = 0; r < size; r++) {
  const row: string[] = []
  for (let c = 0; c < size; c++) {
    let ch: string
    if (r < n && c < n) {
      ch = tl[r][c]
    } else if (r < n && c >= n) {
      ch = hFlip(tl[r][size - 1 - c])
    } else if (r >= n && c < n) {
      ch = vFlip(tl[size - 1 - r][c])
    } else {
      ch = hFlip(vFlip(tl[size - 1 - r][size - 1 - c]))
    }
    row.push(ch)
  }
  tile.push(row)
}

const lines: string[] = []
const border: string = "+" + "-".repeat(size) + "+" + "-".repeat(size) + "+"
lines.push(border)
for (let t = 0; t < 2; t++) {
  for (let r = 0; r < size; r++) {
    const body: string = tile[r].join("")
    lines.push("|" + body + "|" + body + "|")
  }
  lines.push(border)
}

console.log(lines.join("\n"))
