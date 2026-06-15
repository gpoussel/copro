// 🎮 CodinGame Puzzle - tile-a-floor
// https://www.codingame.com/training/easy/tile-a-floor

const n: number = parseInt(readline())
const m: number = 2 * n - 1
const input: string[] = []
for (let i = 0; i < n; i++) {
  const row: string = readline()
  input.push(row.padEnd(n, " "))
}

const hMap: { [key: string]: string } = {
  "(": ")",
  ")": "(",
  "{": "}",
  "}": "{",
  "[": "]",
  "]": "[",
  "<": ">",
  ">": "<",
  "/": "\\",
  "\\": "/",
}

const vMap: { [key: string]: string } = {
  "^": "v",
  v: "^",
  A: "V",
  V: "A",
  w: "m",
  m: "w",
  W: "M",
  M: "W",
  u: "n",
  n: "u",
  "/": "\\",
  "\\": "/",
}

const tile: string[][] = []
for (let r = 0; r < m; r++) {
  const line: string[] = []
  for (let c = 0; c < m; c++) {
    const flipH: boolean = c > n - 1
    const flipV: boolean = r > n - 1
    const sr: number = flipV ? m - 1 - r : r
    const sc: number = flipH ? m - 1 - c : c
    let ch: string = input[sr][sc]
    if (flipH && hMap[ch] !== undefined) {
      ch = hMap[ch]
    }
    if (flipV && vMap[ch] !== undefined) {
      ch = vMap[ch]
    }
    line.push(ch)
  }
  tile.push(line)
}

const tileLines: string[] = tile.map((row: string[]): string => row.join(""))

const border: string = "+" + "-".repeat(m) + "+" + "-".repeat(m) + "+"
const out: string[] = []
out.push(border)
for (const line of tileLines) {
  out.push("|" + line + "|" + line + "|")
}
out.push(border)
for (const line of tileLines) {
  out.push("|" + line + "|" + line + "|")
}
out.push(border)

console.log(out.join("\n"))
