// 🎮 CodinGame Puzzle - create-turn-here-signs
// https://www.codingame.com/training/easy/create-turn-here-signs

const parts = readline().split(" ")
const direction = parts[0]
const howManyArrows = parseInt(parts[1])
const heightOfArrows = parseInt(parts[2])
const strokeThickness = parseInt(parts[3])
const spacingBetweenArrows = parseInt(parts[4])
const additionalIndent = parseInt(parts[5])

const arrowChar = direction === "right" ? ">" : "<"
const half = (heightOfArrows - 1) / 2

// Build the arrow block: n arrows of stroke chars, separated by spacing spaces
const singleArrow = arrowChar.repeat(strokeThickness)
const arrowBlock = Array(howManyArrows).fill(singleArrow).join(" ".repeat(spacingBetweenArrows))

const lines: string[] = []
for (let row = 0; row < heightOfArrows; row++) {
  const distFromMiddle = Math.abs(row - half)
  let indent: number
  if (direction === "right") {
    // middle row has max indent, top/bottom have 0
    indent = (half - distFromMiddle) * additionalIndent
  } else {
    // middle row has 0 indent, top/bottom have max indent
    indent = distFromMiddle * additionalIndent
  }
  lines.push(" ".repeat(indent) + arrowBlock)
}

console.log(lines.join("\n"))
