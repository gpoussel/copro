// 🎮 CodinGame Puzzle - the-queens-trek-wythoffs-game
// https://www.codingame.com/training/medium/the-queens-trek-wythoffs-game

const [n, m] = readline().split(" ").map(Number)

// win[a][b]: the player to move from (a, b) wins
const win: boolean[][] = []
for (let a = 0; a <= n; a++) {
  win.push([])
  for (let b = 0; b <= m; b++) {
    let canWin = false
    for (let k = 1; k <= a && !canWin; k++) if (!win[a - k][b]) canWin = true
    for (let k = 1; k <= b && !canWin; k++) if (!win[a][b - k]) canWin = true
    for (let k = 1; k <= Math.min(a, b) && !canWin; k++) if (!win[a - k][b - k]) canWin = true
    win[a].push(canWin)
  }
}
console.log(win[n][m] ? "FIRST" : "SECOND")
