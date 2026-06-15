// 🎮 CodinGame Puzzle - mini-sudoku-solver
// https://www.codingame.com/training/hard/mini-sudoku-solver

const g: number[][] = []
for (let i = 0; i < 4; i++) g.push(readline().split("").map(Number))

function ok(r: number, c: number, v: number): boolean {
  for (let i = 0; i < 4; i++) {
    if (g[r][i] === v) return false
    if (g[i][c] === v) return false
  }
  const br = Math.floor(r / 2) * 2
  const bc = Math.floor(c / 2) * 2
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) if (g[br + i][bc + j] === v) return false
  return true
}

function solve(): boolean {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (g[r][c] === 0) {
        for (let v = 1; v <= 4; v++) {
          if (ok(r, c, v)) {
            g[r][c] = v
            if (solve()) return true
            g[r][c] = 0
          }
        }
        return false
      }
    }
  return true
}

solve()
for (let i = 0; i < 4; i++) console.log(g[i].join(""))
