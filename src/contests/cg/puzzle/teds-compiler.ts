// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

const line: string = readline()
let balance: number = 0
let best: number = 0
for (let i = 0; i < line.length; i++) {
  if (line[i] === "<") {
    balance++
  } else {
    balance--
  }
  if (balance < 0) {
    break
  }
  if (balance === 0) {
    best = i + 1
  }
}
console.log(best)
