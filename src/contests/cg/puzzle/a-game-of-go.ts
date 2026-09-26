// 🎮 CodinGame Puzzle - a-game-of-go
// https://www.codingame.com/training/hard/a-game-of-go

// Simulate each move: place the stone, remove adjacent enemy groups left
// without liberties, then reject the move if the own group has no liberty
// (suicide) or if the board equals the one before the opponent's last move (ko).

const goSize = parseInt(readline())
const goMoves = parseInt(readline())
let goBoard: string[][] = []
for (let i = 0; i < goSize; i++) goBoard.push(readline().trim().split(""))

const DIRS = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
]

// Flood-fill the group at (r, c); returns its cells and whether it has a liberty
function groupAt(b: string[][], r: number, c: number): { cells: number[][]; free: boolean } {
  const color = b[r][c]
  const seen = new Set<number>([r * goSize + c])
  const cells = [[r, c]]
  let free = false
  for (let k = 0; k < cells.length; k++) {
    const [y, x] = cells[k]
    for (const [dy, dx] of DIRS) {
      const ny = y + dy
      const nx = x + dx
      if (ny < 0 || nx < 0 || ny >= goSize || nx >= goSize) continue
      if (b[ny][nx] === ".") free = true
      else if (b[ny][nx] === color && !seen.has(ny * goSize + nx)) {
        seen.add(ny * goSize + nx)
        cells.push([ny, nx])
      }
    }
  }
  return { cells, free }
}

const key = (b: string[][]): string => b.map(row => row.join("")).join("\n")

let previous = ""
let valid = true
for (let m = 0; m < goMoves; m++) {
  const [color, rs, cs] = readline().trim().split(/\s+/)
  if (!valid) continue
  const r = parseInt(rs)
  const c = parseInt(cs)
  if (goBoard[r][c] !== ".") {
    valid = false
    continue
  }
  const next = goBoard.map(row => row.slice())
  next[r][c] = color
  for (const [dy, dx] of DIRS) {
    const ny = r + dy
    const nx = c + dx
    if (ny < 0 || nx < 0 || ny >= goSize || nx >= goSize) continue
    const cell = next[ny][nx]
    if (cell === "." || cell === color) continue
    const g = groupAt(next, ny, nx)
    if (!g.free) for (const [y, x] of g.cells) next[y][x] = "."
  }
  if (!groupAt(next, r, c).free || key(next) === previous) {
    valid = false
    continue
  }
  previous = key(goBoard)
  goBoard = next
}

console.log(valid ? key(goBoard) : "NOT_VALID")
