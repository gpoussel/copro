// 🎮 CodinGame Puzzle - custom-game-of-life
// https://www.codingame.com/training/medium/custom-game-of-life

const [h, w, n] = readline().split(" ").map(Number)
const survive = readline()
const birth = readline()
let grid: number[][] = []
for (let i = 0; i < h; i++) {
  grid.push(
    readline()
      .split("")
      .map(c => (c === "O" ? 1 : 0))
  )
}

for (let t = 0; t < n; t++) {
  const next: number[][] = []
  for (let i = 0; i < h; i++) {
    const row: number[] = []
    for (let j = 0; j < w; j++) {
      let cnt = 0
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) continue
          const ni = i + di,
            nj = j + dj
          if (ni >= 0 && ni < h && nj >= 0 && nj < w && grid[ni][nj] === 1) cnt++
        }
      }
      const alive = grid[i][j] === 1
      const rule = alive ? survive : birth
      row.push(rule[cnt] === "1" ? 1 : 0)
    }
    next.push(row)
  }
  grid = next
}

console.log(grid.map(r => r.map(c => (c ? "O" : ".")).join("")).join("\n"))
