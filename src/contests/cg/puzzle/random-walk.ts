// 🎮 CodinGame Puzzle - random-walk
// https://www.codingame.com/training/easy/random-walk

const a = parseInt(readline(), 10)
const b = parseInt(readline(), 10)
const m = parseInt(readline(), 10)
let d = 0
let x = 0,
  y = 0
let steps = 0
while (steps < 500000) {
  d = (a * d + b) % m
  switch (d % 4) {
    case 0:
      y += 1 // Up
      break
    case 1:
      y -= 1 // Down
      break
    case 2:
      x -= 1 // Left
      break
    case 3:
      x += 1 // Right
      break
  }
  steps++
  if (x === 0 && y === 0) break
}
console.log(steps)
