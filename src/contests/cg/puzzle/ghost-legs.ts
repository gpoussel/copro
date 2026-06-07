// 🎮 CodinGame Puzzle - ghost-legs
// https://www.codingame.com/training/easy/ghost-legs

const [W, H] = readline().split(" ").map(Number)
const lines: string[] = []
for (let i = 0; i < H; i++) {
  lines.push(readline())
}

// The top label row is lines[0], bottom label row is lines[H-1]
// Find the column positions of each vertical lane (where '|' characters appear in middle rows)
// Labels are at even positions: 0, 3, 6, ... (spacing of 3 between lanes)
// Actually let's find lane positions from the top label row

const topRow = lines[0]
const bottomRow = lines[H - 1]

// Find positions of top labels (non-space characters in top row)
const lanePositions: number[] = []
for (let c = 0; c < topRow.length; c++) {
  if (topRow[c] !== " ") {
    lanePositions.push(c)
  }
}

const numLanes = lanePositions.length

// For each top label, simulate going down
for (let i = 0; i < numLanes; i++) {
  let col = lanePositions[i]

  // Walk from row 1 (first row after top labels) to row H-2 (last row before bottom labels)
  for (let row = 1; row <= H - 2; row++) {
    const rowStr = lines[row]
    // Check if there's a connector going right: current col has '|' and col+1 has '-'
    if (col + 1 < rowStr.length && rowStr[col + 1] === "-") {
      // Move right to next lane
      col += 3
    } else if (col - 1 >= 0 && rowStr[col - 1] === "-") {
      // Move left to previous lane
      col -= 3
    }
    // Otherwise stay on same vertical
  }

  // Find bottom label at this column
  const topLabel = topRow[lanePositions[i]]
  const bottomLabel = bottomRow[col]
  console.log(topLabel + bottomLabel)
}
