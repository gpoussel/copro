// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

const n = parseInt(readline())
const strengths: number[] = []
for (let i = 0; i < n; i++) {
  strengths.push(parseInt(readline()))
}

strengths.sort((a, b) => a - b)

let minDiff = Infinity
for (let i = 1; i < strengths.length; i++) {
  const diff = strengths[i] - strengths[i - 1]
  if (diff < minDiff) {
    minDiff = diff
  }
}

console.log(minDiff + 0)
