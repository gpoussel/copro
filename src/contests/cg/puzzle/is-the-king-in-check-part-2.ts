// 🎮 CodinGame Puzzle - is-the-king-in-check-part-2
// https://www.codingame.com/training/medium/is-the-king-in-check-part-2

const board: string[][] = []
for (let i = 0; i < 8; i++) board.push(readline().trim().split(" "))

const at = (r: number, c: number): string | null => (r >= 0 && r < 8 && c >= 0 && c < 8 ? board[r][c] : null)

let kingR = 0
let kingC = 0
for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === "k") [kingR, kingC] = [r, c]

// Knights: jump, cannot be blocked
const knightMoves = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]
let check = knightMoves.some(([dr, dc]) => at(kingR + dr, kingC + dc) === "N")

// Sliders: walk from the king in each direction until the first piece
const directions: [number, number, string][] = [
  [0, 1, "RQ"], [0, -1, "RQ"], [1, 0, "RQ"], [-1, 0, "RQ"],
  [1, 1, "BQ"], [1, -1, "BQ"], [-1, 1, "BQ"], [-1, -1, "BQ"],
]
for (const [dr, dc, attackers] of directions) {
  let r = kingR + dr
  let c = kingC + dc
  while (at(r, c) === "_") {
    r += dr
    c += dc
  }
  const piece = at(r, c)
  if (piece && attackers.indexOf(piece) >= 0) check = true
}
console.log(check ? "Check" : "No Check")
