// 🎮 CodinGame Puzzle - 2-player-game-on-a-calculator
// https://www.codingame.com/training/medium/2-player-game-on-a-calculator

const neighbours: number[][] = [
  [],
  [2, 4, 5],
  [1, 3, 4, 5, 6],
  [2, 5, 6],
  [1, 2, 5, 7, 8],
  [1, 2, 3, 4, 6, 7, 8, 9],
  [2, 3, 5, 8, 9],
  [4, 5, 8],
  [4, 5, 6, 7, 9],
  [5, 6, 8],
]

const startValue = parseInt(readline())

// canWin[n][last]: the player to move, with n displayed and the opponent's
// last key being `last`, has a winning strategy
const canWin: boolean[][] = []
for (let n = 0; n <= startValue; n++) {
  const row: boolean[] = []
  for (let last = 0; last <= 9; last++) {
    row.push(neighbours[last].some(d => d <= n && !canWin[n - d][d]))
  }
  canWin.push(row)
}

const winningMoves: number[] = []
for (let d = 1; d <= 9; d++) {
  if (d <= startValue && !canWin[startValue - d][d]) winningMoves.push(d)
}
console.log(winningMoves.join(" "))
