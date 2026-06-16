// 🎮 CodinGame Puzzle - elementary-cellular-automaton
// https://www.codingame.com/training/medium/elementary-cellular-automaton

const r: number = parseInt(readline())
const n: number = parseInt(readline())
const pattern: string = readline()
const len = pattern.length
let cells: number[] = pattern.split("").map(c => (c === "@" ? 1 : 0))

const out: string[] = []
for (let line = 0; line < n; line++) {
  out.push(cells.map(c => (c === 1 ? "@" : ".")).join(""))
  const next: number[] = new Array(len)
  for (let i = 0; i < len; i++) {
    const l = cells[(i - 1 + len) % len] // wraps around
    const c = cells[i]
    const rr = cells[(i + 1) % len]
    const idx = l * 4 + c * 2 + rr // neighborhood value 0..7
    next[i] = (r >> idx) & 1 // Wolfram rule bit
  }
  cells = next
}
console.log(out.join("\n"))
