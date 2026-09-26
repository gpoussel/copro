// 🎮 CodinGame Puzzle - game-of-life-simulation
// https://www.codingame.com/training/medium/game-of-life-simulation

const [w, h] = readline().split(" ").map(Number)
let grid: boolean[][] = []
for (let r = 0; r < h; r++) {
  const row = readline() || ""
  const cells: boolean[] = []
  for (let c = 0; c < w; c++) cells.push(row[c] === "#")
  grid.push(cells)
}

const step = (g: boolean[][]): boolean[][] =>
  g.map((row, r) =>
    row.map((alive, c) => {
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if ((dr || dc) && g[r + dr] && g[r + dr][c + dc]) count++
        }
      }
      return count === 3 || (alive && count === 2)
    }),
  )

const key = (g: boolean[][]): string => g.map(row => row.map(b => (b ? "#" : " ")).join("")).join("\n")

// Simulate until a configuration repeats
const seen = new Map<string, number>()
let t = 0
let k = key(grid)
while (!seen.has(k)) {
  seen.set(k, t++)
  grid = step(grid)
  k = key(grid)
}
const period = t - seen.get(k)!
if (k.indexOf("#") < 0) console.log("Death")
else if (period === 1) console.log("Still")
else console.log(`Oscillator ${period}`)
