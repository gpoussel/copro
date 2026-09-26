// 🎮 CodinGame Puzzle - the-urinal-problem
// https://www.codingame.com/training/medium/the-urinal-problem

const urinalCount = parseInt(readline(), 10)
const urinals = readline()

let bestIndex = -1
let bestDistance = -1
for (let i = 0; i < urinalCount; i++) {
  if (urinals[i] !== "U") continue
  let distance = Infinity
  for (let j = 0; j < urinalCount; j++) {
    if (urinals[j] === "!") distance = Math.min(distance, Math.abs(i - j))
  }
  if (distance > bestDistance) {
    bestDistance = distance
    bestIndex = i
  }
}
console.log(bestIndex)
