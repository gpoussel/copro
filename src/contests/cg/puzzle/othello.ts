// 🎮 CodinGame Puzzle - othello
// https://www.codingame.com/training/medium/othello

const board: string[][] = []
for (let i = 0; i < 8; i++) board.push(readline().split(""))
const [playerColour, moveCoord] = readline().trim().split(" ")
const moveCol = moveCoord.charCodeAt(0) - 97
const moveRow = parseInt(moveCoord.substr(1), 10) - 1
const opponentColour = playerColour === "B" ? "W" : "B"

function onBoard(r: number, c: number): boolean {
  return r >= 0 && c >= 0 && r < 8 && c < 8
}

if (board[moveRow][moveCol] !== "-") console.log("NOPE")
else {
  let flipped = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      let r = moveRow + dr
      let c = moveCol + dc
      const line: [number, number][] = []
      while (onBoard(r, c) && board[r][c] === opponentColour) {
        line.push([r, c])
        r += dr
        c += dc
      }
      if (line.length > 0 && onBoard(r, c) && board[r][c] === playerColour) {
        for (const [lr, lc] of line) board[lr][lc] = playerColour
        flipped += line.length
      }
    }
  }
  if (flipped === 0) console.log("NULL")
  else {
    board[moveRow][moveCol] = playerColour
    let whites = 0
    let blacks = 0
    for (const row of board) {
      for (const cell of row) {
        if (cell === "W") whites++
        else if (cell === "B") blacks++
      }
    }
    console.log(whites + " " + blacks)
  }
}
