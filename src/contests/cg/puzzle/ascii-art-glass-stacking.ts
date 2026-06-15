// 🎮 CodinGame Puzzle - ascii-art-glass-stacking
// https://www.codingame.com/training/medium/ascii-art-glass-stacking

const N = parseInt(readline(), 10)
let k = 0
while (((k + 1) * (k + 2)) / 2 <= N) k++

const cell = ["***", "* *", "* *", "*****"]
const fullWidth = 6 * k - 1
const lines: string[] = []

for (let row = 1; row <= k; row++) {
  const rowWidth = 6 * row - 1
  const leftPad = (fullWidth - rowWidth) / 2
  for (let gl = 0; gl < 4; gl++) {
    const glassLine = gl < 3 ? " " + cell[gl] + " " : cell[3]
    const parts: string[] = []
    for (let g = 0; g < row; g++) parts.push(glassLine)
    const line = " ".repeat(leftPad) + parts.join(" ") + " ".repeat(leftPad)
    lines.push(line)
  }
}
console.log(lines.join("\n"))
