// 🎮 CodinGame Puzzle - gerrymandering
// https://www.codingame.com/training/hard/gerrymandering

// Classic guillotine-cut DP: the best value of an h x w district is either
// its own value or the best vertical/horizontal split into two districts.

const [countyW, countyH] = readline().split(" ").map(Number)
const voters: number[][] = []
for (let i = 0; i < countyH; i++) voters.push(readline().trim().split(/\s+/).map(Number))

// best[h][w] with 1-based dimensions
const best: number[][] = Array.from({ length: countyH + 1 }, () => new Array<number>(countyW + 1).fill(0))
for (let h = 1; h <= countyH; h++)
  for (let w = 1; w <= countyW; w++) {
    let value = voters[h - 1][w - 1]
    for (let a = 1; a < w; a++) value = Math.max(value, best[h][a] + best[h][w - a])
    for (let a = 1; a < h; a++) value = Math.max(value, best[a][w] + best[h - a][w])
    best[h][w] = value
  }
console.log(best[countyH][countyW])
