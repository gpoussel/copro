// 🎮 CodinGame Puzzle - assignments-are-boring
// https://www.codingame.com/training/medium/assignments-are-boring

const seed = Number(readline())
const papers = parseInt(readline())
const power = parseInt(readline())
const size = 1 << power
const mask = size - 1

// Only the low `power` bits matter for an LCG modulo 2^power: build a histogram of page counts
const count = new Array<number>(size).fill(0)
let z = seed % size
for (let i = 0; i < papers; i++) {
  z = (1664525 * z + 1013904223) & mask
  count[z]++
}

// Each day removes every paper at the current minimum page count
const answer: number[] = []
let left = papers
for (let v = 0; v < size; v++) {
  if (!count[v]) continue
  left -= count[v]
  answer.push(left)
}
console.log(answer.join(" "))
