// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/

readline()
const a: number[] = readline().split(" ").map(Number)

let left = 0
let right = a.length - 1
let best = 0

while (left < right) {
  const height: number = Math.min(a[left], a[right])
  const area: number = height * (right - left)
  if (area > best) {
    best = area
  }
  if (a[left] < a[right]) {
    left++
  } else {
    right--
  }
}

console.log(best)
