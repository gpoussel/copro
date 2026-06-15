// 🎮 CodinGame Puzzle - tile-a-floor
// https://www.codingame.com/training/easy/tile-a-floor

const N = parseInt(readline())
const rows: string[] = []
for (let i = 0; i < N; i++) rows.push(readline())

const S = 2 * N - 1

const inp: string[][] = []
for (let r = 0; r < N; r++) {
  const line = rows[r]
  const arr: string[] = []
  for (let c = 0; c < N; c++) arr.push(c < line.length ? line[c] : " ")
  inp.push(arr)
}

const lr: { [k: string]: string } = {
  "(": ")",
  ")": "(",
  "{": "}",
  "}": "{",
  "[": "]",
  "]": "[",
  "<": ">",
  ">": "<",
}
const tb: { [k: string]: string } = {
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
}

function lrSwap(ch: string): string {
  return lr[ch] ?? ch
}
function tbSwap(ch: string): string {
  return tb[ch] ?? ch
}
function diagSwap(ch: string): string {
  if (ch === "/") return "\\"
  if (ch === "\\") return "/"
  return ch
}

const tile: string[][] = []
for (let r = 0; r < S; r++) {
  const row: string[] = []
  for (let c = 0; c < S; c++) {
    const mh = c > N - 1
    const mv = r > N - 1
    const sr = mv ? S - 1 - r : r
    const sc = mh ? S - 1 - c : c
    let ch = inp[sr][sc]
    if (mh) ch = lrSwap(ch)
    if (mv) ch = tbSwap(ch)
    if ((mh ? 1 : 0) + (mv ? 1 : 0) === 1) ch = diagSwap(ch)
    row.push(ch)
  }
  tile.push(row)
}

const tileLines = tile.map(r => r.join(""))
const border = "+" + "-".repeat(S) + "+" + "-".repeat(S) + "+"
const out: string[] = []
out.push(border)
for (const tl of tileLines) out.push("|" + tl + "|" + tl + "|")
out.push(border)
for (const tl of tileLines) out.push("|" + tl + "|" + tl + "|")
out.push(border)
console.log(out.join("\n"))
