// 🎮 CodinGame Puzzle - shadow-casting
// https://www.codingame.com/training/easy/shadow-casting

const N: number = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < N; i++) {
  lines.push(readline())
}

// Determine the grid dimensions (may expand due to shadows)
const rows = N + 2 // original N rows + 2 extra for shadows
let maxCols = 0
for (const line of lines) {
  if (line.length > maxCols) maxCols = line.length
}
maxCols += 2 // 2 extra columns for shadows

// Build output grid initialized to spaces
const grid: string[][] = []
for (let r = 0; r < rows; r++) {
  grid.push(new Array(maxCols).fill(" "))
}

// Place lighter shadow (backtick) first (lowest priority)
for (let r = 0; r < N; r++) {
  for (let c = 0; c < lines[r].length; c++) {
    if (lines[r][c] !== " ") {
      const sr = r + 2
      const sc = c + 2
      if (sr < rows && sc < maxCols) {
        grid[sr][sc] = "`"
      }
    }
  }
}

// Place darker shadow (hyphen) next (overrides lighter shadow)
for (let r = 0; r < N; r++) {
  for (let c = 0; c < lines[r].length; c++) {
    if (lines[r][c] !== " ") {
      const sr = r + 1
      const sc = c + 1
      if (sr < rows && sc < maxCols) {
        grid[sr][sc] = "-"
      }
    }
  }
}

// Place original pattern (highest priority, only non-space characters)
for (let r = 0; r < N; r++) {
  for (let c = 0; c < lines[r].length; c++) {
    if (lines[r][c] !== " ") {
      grid[r][c] = lines[r][c]
    }
  }
}

// Output: trim trailing spaces from each row
for (let r = 0; r < rows; r++) {
  const row = grid[r].join("").trimEnd()
  console.log(row)
}
