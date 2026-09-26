// 🎮 CodinGame Puzzle - robbery-optimisation
// https://www.codingame.com/training/medium/robbery-optimisation

// Classic "house robber" DP; totals stay below 2^53 so plain numbers are exact
const houseCount = Number(readline())
let bestWithoutPrev = 0 // best total up to house i-2
let bestSoFar = 0 // best total up to house i-1
for (let i = 0; i < houseCount; i++) {
  const value = Number(readline())
  const next = Math.max(bestSoFar, bestWithoutPrev + value)
  bestWithoutPrev = bestSoFar
  bestSoFar = next
}
console.log(bestSoFar)
