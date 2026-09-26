// 🎮 CodinGame Puzzle - inside-area
// https://www.codingame.com/training/medium/inside-area

const n = Number(readline())
let y = 0
let twiceArea = 0
let perimeter = 0
for (let i = 0; i < n; i++) {
  const [direction, stepStr] = readline().split(" ")
  const step = Number(stepStr)
  perimeter += step
  if (direction === ">") twiceArea += 2 * step * y
  else if (direction === "<") twiceArea -= 2 * step * y
  else if (direction === "^") y -= step
  else y += step
}

// Pick's theorem: interior points + boundary points
const area = Math.abs(twiceArea) / 2
console.log(String(area + perimeter / 2 + 1))
