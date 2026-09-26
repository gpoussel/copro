// 🎮 CodinGame Puzzle - circular-automation-the-period-of-chaos
// https://www.codingame.com/training/medium/circular-automation-the-period-of-chaos

const lineLength = +readline()
const maxIter = +readline()
const ruleNumber = +readline()

let cells: number[] = []
for (let i = 0; i < lineLength; i++) cells.push(i === (lineLength - 1) / 2 ? 1 : 0)

const seenAt: { [line: string]: number } = {}
seenAt[cells.join("")] = 0
let answer = "BIG"
for (let iter = 1; iter <= maxIter; iter++) {
  const next: number[] = []
  for (let i = 0; i < lineLength; i++) {
    const left = cells[(i - 1 + lineLength) % lineLength]
    const right = cells[(i + 1) % lineLength]
    const pattern = (left << 2) | (cells[i] << 1) | right
    next.push((ruleNumber >> pattern) & 1)
  }
  cells = next
  const key = cells.join("")
  if (seenAt[key] !== undefined) {
    answer = String(iter - seenAt[key])
    break
  }
  seenAt[key] = iter
}
console.log(answer)
