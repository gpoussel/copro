// 🎮 CodinGame Puzzle - the-hungry-duck---part-1
// https://www.codingame.com/training/hard/the-hungry-duck---part-1

// Classic grid DP: best[r][c] = food[r][c] + max(best from above, best from left).

const [W, H] = readline().split(" ").map(Number)
const best: number[][] = []
for (let r = 0; r < H; r++) {
  const row = readline().split(" ").map(Number)
  const cur: number[] = []
  for (let c = 0; c < W; c++) {
    const up = r > 0 ? best[r - 1][c] : -Infinity
    const left = c > 0 ? cur[c - 1] : -Infinity
    cur.push(row[c] + (r === 0 && c === 0 ? 0 : Math.max(up, left)))
  }
  best.push(cur)
}
console.log(best[H - 1][W - 1])
