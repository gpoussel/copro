// 🎮 CodinGame Puzzle - feature-extraction
// https://www.codingame.com/training/easy/feature-extraction

const [r, c] = readline().split(" ").map(Number)
const image: number[][] = []
for (let i = 0; i < r; i++) {
  image.push(readline().split(" ").map(Number))
}

const [m, n] = readline().split(" ").map(Number)
const kernel: number[][] = []
for (let i = 0; i < m; i++) {
  kernel.push(readline().split(" ").map(Number))
}

const outRows = r - m + 1
const outCols = c - n + 1

for (let i = 0; i < outRows; i++) {
  const row: number[] = []
  for (let j = 0; j < outCols; j++) {
    let sum = 0
    for (let ki = 0; ki < m; ki++) {
      for (let kj = 0; kj < n; kj++) {
        sum += image[i + ki][j + kj] * kernel[ki][kj]
      }
    }
    row.push(sum)
  }
  console.log(row.join(" "))
}
