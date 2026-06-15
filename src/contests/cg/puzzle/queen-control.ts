// 🎮 CodinGame Puzzle - queen-control
// https://www.codingame.com/

const color: string = readline()
const ally: string = color === "white" ? "w" : "b"
const board: string[] = []
for (let i = 0; i < 8; i++) {
  board.push(readline())
}

let qx = 0
let qy = 0
for (let y = 0; y < 8; y++) {
  const x: number = board[y].indexOf("Q")
  if (x >= 0) {
    qx = x
    qy = y
  }
}

const directions: number[][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

let count = 0
for (const [dx, dy] of directions) {
  let x: number = qx + dx
  let y: number = qy + dy
  while (x >= 0 && x < 8 && y >= 0 && y < 8) {
    const cell: string = board[y][x]
    if (cell === ".") {
      count++
    } else if (cell === ally) {
      break
    } else {
      count++
      break
    }
    x += dx
    y += dy
  }
}

console.log(count)
