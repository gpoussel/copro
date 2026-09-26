// 🎮 CodinGame Puzzle - maximum-sub-sequence
// https://www.codingame.com/training/medium/maximum-sub-sequence

const n = parseInt(readline())
const values = readline().trim().split(/\s+/).slice(0, n).map(Number)

// longest[v] = length of the longest incrementing sequence seen so far ending with value v
const longest = new Map<number, number>()
let bestLength = 0
let bestStart = 0
for (const v of values) {
  const length = (longest.get(v - 1) || 0) + 1
  if (length > (longest.get(v) || 0)) longest.set(v, length)
  const start = v - length + 1
  if (length > bestLength || (length === bestLength && start < bestStart)) {
    bestLength = length
    bestStart = start
  }
}

const result: number[] = []
for (let i = 0; i < bestLength; i++) result.push(bestStart + i)
console.log(result.join(" "))
