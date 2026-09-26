// 🎮 CodinGame Puzzle - signal-cascade
// https://www.codingame.com/training/easy/signal-cascade

const [h, w] = readline().split(" ").map(Number)
const grid: number[][] = []
for (let i = 0; i < h; i++) grid.push(readline().split("").map(Number))
const [r0, c0] = readline().split(" ").map(Number)

// Overloaded cells stay at 0 and never receive a signal again
const overloaded: boolean[][] = grid.map(row => row.map(() => false))
const queue: [number, number][] = [[r0, c0]]
while (queue.length > 0) {
  const [r, c] = queue.pop()!
  if (overloaded[r][c]) continue
  if (++grid[r][c] <= 9) continue
  grid[r][c] = 0
  overloaded[r][c] = true
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr
      const nc = c + dc
      if ((dr || dc) && nr >= 0 && nr < h && nc >= 0 && nc < w && !overloaded[nr][nc]) queue.push([nr, nc])
    }
  }
}

for (const row of grid) console.log(row.join(""))
