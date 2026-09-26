// 🎮 CodinGame Puzzle - go-competition
// https://www.codingame.com/training/medium/go-competition

const boardSize = +readline()
const board: string[] = []
for (let i = 0; i < boardSize; i++) board.push(readline())

let blackScore = 0
let whiteScore = 6.5
const visited: boolean[][] = board.map(row => row.split("").map(() => false))

for (let r = 0; r < boardSize; r++) {
  for (let c = 0; c < boardSize; c++) {
    const cell = board[r][c]
    if (cell === "B") blackScore++
    else if (cell === "W") whiteScore++
    else if (!visited[r][c]) {
      // Flood the empty region and record which colours border it
      let regionSize = 0
      let touchesBlack = false
      let touchesWhite = false
      const stack: [number, number][] = [[r, c]]
      visited[r][c] = true
      while (stack.length > 0) {
        const [cr, cc] = stack.pop()!
        regionSize++
        const neighbours: [number, number][] = [
          [cr - 1, cc],
          [cr + 1, cc],
          [cr, cc - 1],
          [cr, cc + 1],
        ]
        for (const [nr, nc] of neighbours) {
          if (nr < 0 || nc < 0 || nr >= boardSize || nc >= boardSize) continue
          const n = board[nr][nc]
          if (n === "B") touchesBlack = true
          else if (n === "W") touchesWhite = true
          else if (!visited[nr][nc]) {
            visited[nr][nc] = true
            stack.push([nr, nc])
          }
        }
      }
      if (touchesBlack && !touchesWhite) blackScore += regionSize
      if (touchesWhite && !touchesBlack) whiteScore += regionSize
    }
  }
}

console.log(`BLACK : ${blackScore}`)
console.log(`WHITE : ${whiteScore}`)
console.log(blackScore > whiteScore ? "BLACK WINS" : "WHITE WINS")
