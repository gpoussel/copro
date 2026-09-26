// 🎮 CodinGame Puzzle - length-of-syracuse-conjecture-sequence
// https://www.codingame.com/training/medium/length-of-syracuse-conjecture-sequence

const LIMIT = 100000
const cycleLength = new Int32Array(LIMIT + 1)
cycleLength[1] = 1

function lengthOf(start: number): number {
  const path: number[] = []
  let n = start
  while (n > LIMIT || cycleLength[n] === 0) {
    path.push(n)
    n = n % 2 === 0 ? n / 2 : 3 * n + 1
  }
  let length = cycleLength[n]
  for (let i = path.length - 1; i >= 0; i--) {
    length++
    if (path[i] <= LIMIT) cycleLength[path[i]] = length
  }
  return length
}

const rangeCount = parseInt(readline())
for (let i = 0; i < rangeCount; i++) {
  const [a, b] = readline().split(" ").map(Number)
  let bestN = a
  let bestLength = 0
  for (let n = a; n <= b; n++) {
    const length = lengthOf(n)
    if (length > bestLength) {
      bestLength = length
      bestN = n
    }
  }
  console.log(`${bestN} ${bestLength}`)
}
