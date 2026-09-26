// 🎮 CodinGame Puzzle - binary-sequence
// https://www.codingame.com/training/medium/binary-sequence

function bitAt(index: number): string {
  if (index === 0) return "0"
  // Skip the leading "0", then groups of numbers with the same bit length
  let pos = index - 1
  let length = 1
  let count = 1 // numbers with `length` bits: 2^(length-1)
  while (pos >= length * count) {
    pos -= length * count
    length++
    count *= 2
  }
  const value = count + Math.floor(pos / length)
  return value.toString(2)[pos % length]
}

const n = parseInt(readline())
for (let i = 0; i < n; i++) console.log(bitAt(parseInt(readline(), 2)))
