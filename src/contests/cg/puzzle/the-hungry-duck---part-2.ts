// 🎮 CodinGame Puzzle - the-hungry-duck---part-2
// https://www.codingame.com/training/hard/the-hungry-duck---part-2

// Only right/down moves: best[x] = food[y][x] + max(best from above, best from
// the left), computed row by row in O(W·H).

const [w, h] = readline().split(" ").map(Number)
const best = new Array<number>(w).fill(0)
for (let y = 0; y < h; y++) {
  const row = readline().trim().split(/\s+/).map(Number)
  for (let x = 0; x < w; x++) {
    const up = y > 0 ? best[x] : -Infinity
    const left = x > 0 ? best[x - 1] : -Infinity
    best[x] = row[x] + (x === 0 && y === 0 ? 0 : Math.max(up, left))
  }
}
console.log(best[w - 1])
