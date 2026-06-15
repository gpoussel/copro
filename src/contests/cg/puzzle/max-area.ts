// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

const n = parseInt(readline(), 10)
const a = readline()
  .split(" ")
  .map(x => parseInt(x, 10))
let lo = 0
let hi = n - 1
let best = 0
while (lo < hi) {
  const h = Math.min(a[lo], a[hi])
  const area = h * (hi - lo)
  if (area > best) best = area
  if (a[lo] < a[hi]) lo++
  else hi--
}
console.log(best)
