// 🎮 CodinGame Puzzle - fill-the-square
// https://www.codingame.com/training/expert/fill-the-square

// Lights Out with "all lit" as the goal. Rows are bitmasks: once the first row of touches is
// chosen, every next row is forced (it must fix the row above), so try all 2^N first rows
// and keep the valid pattern with the fewest touches.
const size: number = parseInt(readline())
const mask: number = (1 << size) - 1
const lit: number[] = []
for (let i = 0; i < size; i++) {
  const row: string = readline()
  let m: number = 0
  for (let j = 0; j < size; j++) if (row[j] === "*") m |= 1 << j
  lit.push(m)
}

const popcount = (v: number): number => {
  let c: number = 0
  for (; v; v &= v - 1) c++
  return c
}

let best: number[] | null = null
let bestCount: number = Infinity
const press: number[] = new Array<number>(size).fill(0)
for (let first = 0; first <= mask; first++) {
  press[0] = first
  for (let i = 0; i < size; i++) {
    // state of row i after touches in rows i-1, i and i+1 (unknown yet)
    const p: number = press[i]
    const cur: number = lit[i] ^ p ^ ((p << 1) & mask) ^ (p >> 1) ^ (i > 0 ? press[i - 1] : 0)
    if (i + 1 < size) press[i + 1] = ~cur & mask
    else if (cur === mask) {
      let count: number = 0
      for (const r of press) count += popcount(r)
      if (count < bestCount) {
        bestCount = count
        best = press.slice()
      }
    }
  }
}

const result: string[] = []
for (const r of best ?? press) {
  let line: string = ""
  for (let j = 0; j < size; j++) line += (r >> j) & 1 ? "X" : "."
  result.push(line)
}
console.log(result.join("\n"))
