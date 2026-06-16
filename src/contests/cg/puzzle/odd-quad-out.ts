// 🎮 CodinGame Puzzle - odd-quad-out
// https://www.codingame.com/training/easy/odd-quad-out

const sideSize: number = parseInt(readline(), 10)
const grid: string[] = []
for (let i = 0; i < sideSize; i++) {
  grid.push(readline())
}

const half: number = sideSize / 2
const sums: number[] = [0, 0, 0, 0]
for (let r = 0; r < sideSize; r++) {
  for (let c = 0; c < sideSize; c++) {
    const ch: string = grid[r][c]
    if (ch >= "1" && ch <= "9") {
      const q: number = (r < half ? 0 : 2) + (c < half ? 0 : 1)
      sums[q] += parseInt(ch, 10)
    }
  }
}

let oddIndex: number = 0
for (let i = 0; i < 4; i++) {
  let count: number = 0
  for (let j = 0; j < 4; j++) {
    if (sums[j] === sums[i]) {
      count++
    }
  }
  if (count === 1) {
    oddIndex = i
  }
}

const standardValue: number = sums.filter((_, i) => i !== oddIndex)[0]
console.log(`Quad-${oddIndex + 1} is Odd-Quad-Out`)
console.log(`It has value of ${sums[oddIndex]}`)
console.log(`Others have value of ${standardValue}`)
