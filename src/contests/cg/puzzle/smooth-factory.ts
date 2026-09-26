// 🎮 CodinGame Puzzle - smooth-factory
// https://www.codingame.com/training/medium/smooth-factory

// A game is won iff the bulk size is 5-smooth (only factors 2, 3, 5): sum the first V
// Hamming numbers, generated in increasing order with the classic three-pointer merge.
const v = parseInt(readline())
const hamming = [1]
let i2 = 0
let i3 = 0
let i5 = 0
while (hamming.length < v) {
  const next = Math.min(hamming[i2] * 2, hamming[i3] * 3, hamming[i5] * 5)
  hamming.push(next)
  if (next === hamming[i2] * 2) i2++
  if (next === hamming[i3] * 3) i3++
  if (next === hamming[i5] * 5) i5++
}
console.log(hamming.reduce((a, b) => a + b, 0))
