// 🎮 CodinGame Puzzle - kaprekars-routine
// https://www.codingame.com/training/medium/kaprekars-routine

const startNumber = readline().trim()
const digitCount = startNumber.length

function pad(value: number): string {
  let s = String(value)
  while (s.length < digitCount) s = "0" + s
  return s
}

function kaprekarStep(value: string): string {
  const ascending = value.split("").sort().join("")
  const descending = ascending.split("").reverse().join("")
  return pad(parseInt(descending) - parseInt(ascending))
}

const seenAt: { [value: string]: number } = {}
const history: string[] = []
let currentValue = startNumber
while (seenAt[currentValue] === undefined) {
  seenAt[currentValue] = history.length
  history.push(currentValue)
  currentValue = kaprekarStep(currentValue)
}
console.log(history.slice(seenAt[currentValue]).join(" "))
