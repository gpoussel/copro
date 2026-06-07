// 🎮 CodinGame Puzzle - rooks-movements
// https://www.codingame.com/training/easy/rooks-movements

const rookPos = readline()
const rookCol = rookPos[0] // 'a'..'h'
const rookRow = parseInt(rookPos[1]) // 1..8

const nbPieces = parseInt(readline())

// board[col][row] = 0 (white/ally) or 1 (black/enemy) or undefined (empty)
// col: 'a'..'h', row: 1..8
const board: Record<string, Record<number, number>> = {}

for (let i = 0; i < nbPieces; i++) {
  const parts = readline().split(" ")
  const color = parseInt(parts[0])
  const pos = parts[1]
  const col = pos[0]
  const row = parseInt(pos[1])
  if (!board[col]) board[col] = {}
  board[col][row] = color
}

const moves: string[] = []

// Helper to get piece at position
function pieceAt(col: string, row: number): number | undefined {
  return board[col]?.[row]
}

const columns = ["a", "b", "c", "d", "e", "f", "g", "h"]
const rookColIdx = columns.indexOf(rookCol)

// Move left (decreasing column)
for (let ci = rookColIdx - 1; ci >= 0; ci--) {
  const col = columns[ci]
  const piece = pieceAt(col, rookRow)
  if (piece === 0) break // ally blocks
  if (piece === 1) {
    moves.push(`R${rookPos}x${col}${rookRow}`)
    break // enemy captured, stop
  }
  moves.push(`R${rookPos}-${col}${rookRow}`)
}

// Move right (increasing column)
for (let ci = rookColIdx + 1; ci < 8; ci++) {
  const col = columns[ci]
  const piece = pieceAt(col, rookRow)
  if (piece === 0) break
  if (piece === 1) {
    moves.push(`R${rookPos}x${col}${rookRow}`)
    break
  }
  moves.push(`R${rookPos}-${col}${rookRow}`)
}

// Move down (decreasing row)
for (let row = rookRow - 1; row >= 1; row--) {
  const piece = pieceAt(rookCol, row)
  if (piece === 0) break
  if (piece === 1) {
    moves.push(`R${rookPos}x${rookCol}${row}`)
    break
  }
  moves.push(`R${rookPos}-${rookCol}${row}`)
}

// Move up (increasing row)
for (let row = rookRow + 1; row <= 8; row++) {
  const piece = pieceAt(rookCol, row)
  if (piece === 0) break
  if (piece === 1) {
    moves.push(`R${rookPos}x${rookCol}${row}`)
    break
  }
  moves.push(`R${rookPos}-${rookCol}${row}`)
}

// Sort in ascending lexicographical ASCII order
moves.sort()

console.log(moves.join("\n"))
