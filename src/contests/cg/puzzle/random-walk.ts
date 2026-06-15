// 🎮 CodinGame Puzzle - random-walk
// https://www.codingame.com/

const a: number = parseInt(readline(), 10)
const b: number = parseInt(readline(), 10)
const m: number = parseInt(readline(), 10)

let d: number = 0
let x: number = 0
let y: number = 0
let steps: number = 0

do {
  d = (a * d + b) % m
  const dir: number = d % 4
  if (dir === 0) y += 1
  else if (dir === 1) y -= 1
  else if (dir === 2) x -= 1
  else x += 1
  steps += 1
} while (x !== 0 || y !== 0)

console.log(steps)
