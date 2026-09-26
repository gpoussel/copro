// 🎮 CodinGame Puzzle - rod-cutting-problem
// https://www.codingame.com/training/medium/rod-cutting-problem

// Unbounded knapsack over the rod length
const rodLength = parseInt(readline())
const pieceCount = parseInt(readline())
const pieces: [number, number][] = []
for (let i = 0; i < pieceCount; i++) {
  const [pieceLength, value] = readline().split(" ").map(Number)
  if (pieceLength <= rodLength) pieces.push([pieceLength, value])
}

const bestValue: number[] = []
for (let len = 0; len <= rodLength; len++) {
  let best = 0
  for (const [pieceLength, value] of pieces) {
    if (pieceLength <= len) best = Math.max(best, bestValue[len - pieceLength] + value)
  }
  bestValue.push(best)
}
console.log(bestValue[rodLength])
