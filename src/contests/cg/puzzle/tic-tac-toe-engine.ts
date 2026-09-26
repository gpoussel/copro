// 🎮 CodinGame Puzzle - tic-tac-toe-engine
// https://www.codingame.com/training/medium/tic-tac-toe-engine

const engine = readline().trim()
const board: string[] = []
for (let i = 0; i < 3; i++) board.push(...readline().trim().split(""))

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]
// Tie-break priority of each cell (center, then corners, then edges)
const CELL_VALUE = [8, 4, 7, 3, 9, 2, 6, 1, 5]

const winner = (): string | null => {
  for (const [a, b, c] of LINES) {
    if (board[a] !== "." && board[a] === board[b] && board[b] === board[c]) return board[a]
  }
  return null
}
const other = (player: string): string => (player === "X" ? "O" : "X")

/** Score for `player` to move: positive wins (sooner is higher), negative loses (later is higher). */
function negamax(player: string, depth: number): number {
  const won = winner()
  if (won) return won === player ? 100 - depth : depth - 100
  if (board.indexOf(".") < 0) return 0
  let best = -Infinity
  for (let cell = 0; cell < 9; cell++) {
    if (board[cell] !== ".") continue
    board[cell] = player
    best = Math.max(best, -negamax(other(player), depth + 1))
    board[cell] = "."
  }
  return best
}

if (!winner() && board.indexOf(".") >= 0) {
  let bestScore = -Infinity
  let bestCell = -1
  for (let cell = 0; cell < 9; cell++) {
    if (board[cell] !== ".") continue
    board[cell] = engine
    const score = -negamax(other(engine), 1)
    board[cell] = "."
    if (score > bestScore || (score === bestScore && CELL_VALUE[cell] > CELL_VALUE[bestCell])) {
      bestScore = score
      bestCell = cell
    }
  }
  board[bestCell] = engine
}

for (let r = 0; r < 3; r++) console.log(board.slice(r * 3, r * 3 + 3).join(""))
