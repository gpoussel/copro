// 🎮 CodinGame Puzzle - is-the-king-in-check-part-1
// https://www.codingame.com/training/easy/is-the-king-in-check-part-1

const board: string[][] = []
for (let i = 0; i < 8; i++) {
  board.push(readline().split(" "))
}

// Find positions of King and enemy piece
let kingRow = -1,
  kingCol = -1
let pieceRow = -1,
  pieceCol = -1
let piece = ""

for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    const cell = board[r][c]
    if (cell === "K") {
      kingRow = r
      kingCol = c
    } else if (cell !== "_") {
      piece = cell
      pieceRow = r
      pieceCol = c
    }
  }
}

let inCheck = false

if (piece === "R" || piece === "Q") {
  // Rook/Queen: attack along same row or column (no pieces in between since only 2 pieces)
  if (pieceRow === kingRow || pieceCol === kingCol) {
    inCheck = true
  }
}

if (piece === "B" || piece === "Q") {
  // Bishop/Queen: attack diagonally
  const dr = Math.abs(kingRow - pieceRow)
  const dc = Math.abs(kingCol - pieceCol)
  if (dr === dc && dr > 0) {
    inCheck = true
  }
}

if (piece === "N") {
  // Knight: L-shaped moves
  const dr = Math.abs(kingRow - pieceRow)
  const dc = Math.abs(kingCol - pieceCol)
  if ((dr === 2 && dc === 1) || (dr === 1 && dc === 2)) {
    inCheck = true
  }
}

console.log(inCheck ? "Check" : "No Check")
