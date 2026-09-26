// 🎮 CodinGame Puzzle - paving-with-bricks
// https://www.codingame.com/training/medium/paving-with-bricks

const h = parseInt(readline())
const w = parseInt(readline())
const width = Math.min(h, w)
const length = Math.max(h, w)

// Broken-profile DP: cells are filled row by row; bit i of the mask says whether the
// cell in column i of the next row is already covered by a vertical brick
let ways: number[] = new Array(1 << width).fill(0)
ways[0] = 1
for (let row = 0; row < length; row++) {
  for (let col = 0; col < width; col++) {
    const next: number[] = new Array(1 << width).fill(0)
    for (let mask = 0; mask < 1 << width; mask++) {
      const count = ways[mask]
      if (count === 0) continue
      const bit = 1 << col
      if (mask & bit) {
        next[mask & ~bit] += count // already covered from above
        continue
      }
      next[mask | bit] += count // vertical brick down
      if (col + 1 < width && !(mask & (bit << 1))) next[mask | (bit << 1)] += count // horizontal brick
    }
    ways = next
  }
}
console.log(ways[0])
