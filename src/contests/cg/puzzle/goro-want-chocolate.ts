// 🎮 CodinGame Puzzle - goro-want-chocolate
// https://www.codingame.com/training/medium/goro-want-chocolate

const [barH, barW] = readline().split(" ").map(Number)

// best[h][w]: minimal number of squares from guillotine cuts of an h x w bar
const best: number[][] = []
for (let h = 0; h <= barH; h++) {
  best.push(new Array<number>(barW + 1).fill(0))
  for (let w = 1; w <= barW && h > 0; w++) {
    if (h === w) {
      best[h][w] = 1
      continue
    }
    let result = Infinity
    for (let cut = 1; cut <= h >> 1; cut++) result = Math.min(result, best[cut][w] + best[h - cut][w])
    for (let cut = 1; cut <= w >> 1; cut++) result = Math.min(result, best[h][cut] + best[h][w - cut])
    best[h][w] = result
  }
}
console.log(best[barH][barW])
