// 🎮 CodinGame Puzzle - count-your-coins
// https://www.codingame.com/

const valueToReach: number = parseInt(readline(), 10)
const n: number = parseInt(readline(), 10)
const counts: number[] = readline()
  .split(" ")
  .map(s => parseInt(s, 10))
const values: number[] = readline()
  .split(" ")
  .map(s => parseInt(s, 10))

const coins: { value: number; count: number }[] = []
for (let i = 0; i < n; i++) {
  coins.push({ value: values[i], count: counts[i] })
}
coins.sort((a, b) => a.value - b.value)

let sum = 0
let grabbed = 0
let answer = -1
for (const coin of coins) {
  for (let c = 0; c < coin.count; c++) {
    sum += coin.value
    grabbed++
    if (sum >= valueToReach) {
      answer = grabbed
      break
    }
  }
  if (answer !== -1) {
    break
  }
}

console.log(answer)
