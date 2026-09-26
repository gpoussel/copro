// 🎮 CodinGame Puzzle - langtons-ant
// https://www.codingame.com/training/medium/langtons-ant

const [gridW, gridH] = readline().split(" ").map(Number)
let [antX, antY] = readline().split(" ").map(Number)
// Clockwise order: N, E, S, W
const DX = [0, 1, 0, -1]
const DY = [-1, 0, 1, 0]
let heading = "NESW".indexOf(readline().trim())
const turns = parseInt(readline())
const board: string[][] = []
for (let i = 0; i < gridH; i++) board.push(readline().trim().split(""))

for (let t = 0; t < turns; t++) {
  const black = board[antY][antX] === "#"
  heading = (heading + (black ? 1 : 3)) % 4
  board[antY][antX] = black ? "." : "#"
  antX += DX[heading]
  antY += DY[heading]
  if (antX < 0 || antY < 0 || antX >= gridW || antY >= gridH) break
}
console.log(board.map(row => row.join("")).join("\n"))
