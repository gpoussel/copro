// 🎮 CodinGame Puzzle - largest-number
// https://www.codingame.com/training/easy/largest-number

const s = readline().trim()
const D = parseInt(readline())
const L = s.length

let best = -1

function consider(str: string): void {
  if (str.length === 0) return
  const v = Number(str)
  if (v % D === 0 && v > best) best = v
}

consider(s)
for (let i = 0; i < L; i++) {
  consider(s.slice(0, i) + s.slice(i + 1))
}
for (let i = 0; i < L; i++) {
  for (let j = i + 1; j < L; j++) {
    consider(s.slice(0, i) + s.slice(i + 1, j) + s.slice(j + 1))
  }
}

console.log(best < 0 ? 0 : best)
