// 🎮 CodinGame Puzzle - binary-image
// https://www.codingame.com/training/easy/binary-image

const n = parseInt(readline())
const lines: string[] = []

for (let i = 0; i < n; i++) {
  const parts = readline().trim().split(/\s+/).map(Number)
  let row = ""
  let isBlack = false

  for (const count of parts) {
    row += (isBlack ? "O" : ".").repeat(count)
    isBlack = !isBlack
  }

  lines.push(row)
}

// Check if all lines have the same length
const firstLen = lines[0].length
const valid = lines.every(l => l.length === firstLen)

if (!valid) {
  console.log("INVALID")
} else {
  for (const line of lines) {
    console.log(line)
  }
}
