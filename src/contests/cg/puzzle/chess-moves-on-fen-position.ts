// 🎮 CodinGame Puzzle - chess-moves-on-fen-position
// https://www.codingame.com/training/hard/chess-moves-on-fen-position

// board[r][c]: r = 0 is rank 8, c = 0 is file a; "." for empty
const board: string[][] = readline()
  .split("/")
  .map(row => row.replace(/\d/g, d => ".".repeat(+d)).split(""))
const n = parseInt(readline())

const square = (s: string): [number, number] => [8 - +s[1], s.charCodeAt(0) - 97]

for (let i = 0; i < n; i++) {
  const m = readline().trim()
  const [fr, fc] = square(m.slice(0, 2))
  const [tr, tc] = square(m.slice(2, 4))
  let piece = board[fr][fc]
  const white = piece === piece.toUpperCase()
  const kind = piece.toLowerCase()

  // Castling: king moving two files also moves the matching rook
  if (kind === "k" && Math.abs(tc - fc) === 2) {
    const [rookFrom, rookTo] = tc > fc ? [7, 5] : [0, 3]
    board[fr][rookTo] = board[fr][rookFrom]
    board[fr][rookFrom] = "."
  }
  // En passant: pawn moving diagonally onto an empty square captures beside it
  if (kind === "p" && fc !== tc && board[tr][tc] === ".") board[fr][tc] = "."
  // Promotion: piece letter takes the pawn's colour
  if (m.length > 4) piece = white ? m[4].toUpperCase() : m[4].toLowerCase()

  board[fr][fc] = "."
  board[tr][tc] = piece
}

console.log(board.map(row => row.join("").replace(/\.+/g, e => String(e.length))).join("/"))
