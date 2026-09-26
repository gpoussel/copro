// 🎮 CodinGame Puzzle - bingo
// https://www.codingame.com/training/medium/bingo

const n = parseInt(readline())
const cards: number[][][] = []
for (let i = 0; i < n; i++) {
  const card: number[][] = []
  for (let r = 0; r < 5; r++) card.push(readline().trim().split(/\s+/).map(Number))
  cards.push(card)
}
const calls = readline().trim().split(/\s+/).map(Number)

// Turn at which each number is called (0 = free space, marked from the start)
const callTime: number[] = new Array(91).fill(Infinity)
callTime[0] = 0
calls.forEach((c, i) => {
  if (callTime[c] === Infinity) callTime[c] = i + 1
})

const lines: [number, number][][] = []
for (let i = 0; i < 5; i++) {
  const row: [number, number][] = []
  const col: [number, number][] = []
  for (let j = 0; j < 5; j++) {
    row.push([i, j])
    col.push([j, i])
  }
  lines.push(row, col)
}
const diag1: [number, number][] = []
const diag2: [number, number][] = []
for (let i = 0; i < 5; i++) {
  diag1.push([i, i])
  diag2.push([i, 4 - i])
}
lines.push(diag1, diag2)

let firstLine = Infinity
let firstFull = Infinity
for (const card of cards) {
  const t = (r: number, c: number) => callTime[card[r][c]]
  for (const line of lines) {
    firstLine = Math.min(firstLine, Math.max(...line.map(([r, c]) => t(r, c))))
  }
  let full = 0
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) full = Math.max(full, t(r, c))
  firstFull = Math.min(firstFull, full)
}
console.log(firstLine)
console.log(firstFull)
