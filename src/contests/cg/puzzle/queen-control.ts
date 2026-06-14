// 🎮 CodinGame Puzzle - queen-control
// https://www.codingame.com/training/queen-control

const color: string = readline().trim()
const board: string[] = []
for (let i = 0; i < 8; i++) board.push(readline())

let qr = 0,
  qc = 0
for (let r = 0; r < 8; r++) {
  const c = board[r].indexOf("Q")
  if (c !== -1) {
    qr = r
    qc = c
  }
}

const ally = color === "white" ? "w" : "b"

const dirs: number[][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
]

let count = 0
for (const [dr, dc] of dirs) {
  let r = qr + dr,
    c = qc + dc
  while (r >= 0 && r < 8 && c >= 0 && c < 8) {
    const cell = board[r][c]
    if (cell === ally) break
    count++
    if (cell !== ".") break
    r += dr
    c += dc
  }
}

console.log(count)
