// 🎮 CodinGame Puzzle - 2048-scores
// https://www.codingame.com/training/medium/2048-scores
//
// A tile 2^k built only from spawned 2s earned (k - 1) * 2^k points; every spawned 4
// skips the merge 2+2 worth 4 points. Every turn spawns exactly one tile, plus the
// two tiles present at the start.

let totalScore = 0
let valueSum = 0
for (let i = 0; i < 4; i++) {
  for (const token of readline().trim().split(/\s+/)) {
    const tile = parseInt(token, 10)
    if (tile < 2) continue
    valueSum += tile
    totalScore += (Math.round(Math.log(tile) / Math.LN2) - 1) * tile
  }
}
const foursSpawned = parseInt(readline(), 10)
totalScore -= 4 * foursSpawned
const twosSpawned = (valueSum - 4 * foursSpawned) / 2
console.log(totalScore)
console.log(twosSpawned + foursSpawned - 2)
