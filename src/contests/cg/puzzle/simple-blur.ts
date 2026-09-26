// 🎮 CodinGame Puzzle - simple-blur
// https://www.codingame.com/training/medium/simple-blur

const [rows, cols] = readline().split(" ").map(Number)
const img: number[][][] = []
for (let r = 0; r < rows; r++) {
  const row: number[][] = []
  for (let c = 0; c < cols; c++) row.push(readline().split(" ").map(Number))
  img.push(row)
}

const DIRS = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const sum = [0, 0, 0]
    let count = 0
    for (const [dr, dc] of DIRS) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      for (let k = 0; k < 3; k++) sum[k] += img[nr][nc][k]
      count++
    }
    console.log(sum.map(s => Math.floor(s / count)).join(" "))
  }
}
