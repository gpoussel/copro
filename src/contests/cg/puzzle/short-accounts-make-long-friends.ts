// 🎮 CodinGame Puzzle - short-accounts-make-long-friends
// https://www.codingame.com/training/medium/short-accounts-make-long-friends

const targetResult = parseInt(readline())
const initialNumbers = readline().split(" ").map(Number)

let minDistance = Infinity
let minOperations = Infinity

function search(numbers: number[], operations: number): void {
  for (const n of numbers) {
    const distance = Math.abs(n - targetResult)
    if (distance < minDistance) minDistance = distance
    if (distance === 0 && operations < minOperations) minOperations = operations
  }
  if (operations + 1 >= minOperations) return
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      const high = Math.max(numbers[i], numbers[j])
      const low = Math.min(numbers[i], numbers[j])
      const rest = numbers.filter((_, k) => k !== i && k !== j)
      const results = [high + low]
      if (high > low) results.push(high - low)
      if (low > 1) {
        results.push(high * low)
        if (high % low === 0) results.push(high / low)
      }
      for (const value of results) {
        rest.push(value)
        search(rest, operations + 1)
        rest.pop()
      }
    }
  }
}

search(initialNumbers, 0)
if (minDistance === 0) console.log(`POSSIBLE\n${minOperations}`)
else console.log(`IMPOSSIBLE\n${minDistance}`)
