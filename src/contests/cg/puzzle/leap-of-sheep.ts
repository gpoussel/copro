// 🎮 CodinGame Puzzle - leap-of-sheep
// https://www.codingame.com/training/easy/leap-of-sheep

const n: number = parseInt(readline(), 10)
const h: number[] = readline()
  .split(" ")
  .map((x: string) => parseInt(x, 10))

let best: number = -1
for (let j = 1; j < n - 1; j++) {
  let leftMin: number = Infinity
  for (let i = 0; i < j; i++) {
    if (h[i] < h[j] && h[i] < leftMin) {
      leftMin = h[i]
    }
  }
  if (leftMin === Infinity) {
    continue
  }
  let rightMin: number = Infinity
  for (let k = j + 1; k < n; k++) {
    if (h[k] < h[j] && h[k] < rightMin) {
      rightMin = h[k]
    }
  }
  if (rightMin === Infinity) {
    continue
  }
  const difficulty: number = 2 * h[j] - leftMin - rightMin
  if (difficulty > best) {
    best = difficulty
  }
}

console.log(best)
