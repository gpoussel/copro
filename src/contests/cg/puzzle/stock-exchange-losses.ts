// 🎮 CodinGame Puzzle - stock-exchange-losses
// https://www.codingame.com/training/medium/stock-exchange-losses

const n: number = parseInt(readline())
const values: number[] = readline().split(" ").map(Number)

let maxSoFar: number = values[0]
let worstLoss: number = 0

for (let i: number = 1; i < n; i++) {
  const v: number = values[i]
  if (v > maxSoFar) {
    maxSoFar = v
  } else {
    const loss: number = v - maxSoFar
    if (loss < worstLoss) {
      worstLoss = loss
    }
  }
}

console.log(worstLoss)
