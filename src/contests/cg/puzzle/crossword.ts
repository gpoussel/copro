// 🎮 CodinGame Puzzle - crossword
// https://www.codingame.com/training/medium/crossword

const horizontalWords = [readline().trim(), readline().trim()]
const verticalWords = [readline().trim(), readline().trim()]

interface Placement {
  word: string
  row: number
  col: number
  horizontal: boolean
}

function renderGrid(placements: Placement[]): string {
  let minRow = Infinity
  let maxRow = -Infinity
  let minCol = Infinity
  let maxCol = -Infinity
  for (const p of placements) {
    const endRow = p.horizontal ? p.row : p.row + p.word.length - 1
    const endCol = p.horizontal ? p.col + p.word.length - 1 : p.col
    minRow = Math.min(minRow, p.row)
    maxRow = Math.max(maxRow, endRow)
    minCol = Math.min(minCol, p.col)
    maxCol = Math.max(maxCol, endCol)
  }
  const grid: string[][] = []
  for (let r = minRow; r <= maxRow; r++) {
    const line: string[] = []
    for (let c = minCol; c <= maxCol; c++) line.push(".")
    grid.push(line)
  }
  for (const p of placements) {
    for (let i = 0; i < p.word.length; i++) {
      const r = p.horizontal ? p.row : p.row + i
      const c = p.horizontal ? p.col + i : p.col
      grid[r - minRow][c - minCol] = p.word[i]
    }
  }
  return grid.map((line) => line.join("")).join("\n")
}

const solutions: string[] = []
for (let h = 0; h < 2; h++) {
  const top = horizontalWords[h]
  const bottom = horizontalWords[1 - h]
  for (let v = 0; v < 2; v++) {
    const left = verticalWords[v]
    const right = verticalWords[1 - v]
    // top word lies on row 0 starting at column 0
    for (let a = 0; a < top.length; a++) {
      for (let b = 0; b < left.length; b++) {
        if (top[a] !== left[b]) continue
        for (let c = a + 2; c < top.length; c++) {
          for (let d = 0; d < right.length; d++) {
            if (top[c] !== right[d]) continue
            for (let r = 2; b + r < left.length && d + r < right.length; r++) {
              for (let e = 0; e < bottom.length; e++) {
                if (bottom[e] !== left[b + r]) continue
                const f = e + (c - a)
                if (f >= bottom.length || bottom[f] !== right[d + r]) continue
                const grid = renderGrid([
                  { word: top, row: 0, col: 0, horizontal: true },
                  { word: bottom, row: r, col: a - e, horizontal: true },
                  { word: left, row: -b, col: a, horizontal: false },
                  { word: right, row: -d, col: c, horizontal: false },
                ])
                if (solutions.indexOf(grid) < 0) solutions.push(grid)
              }
            }
          }
        }
      }
    }
  }
}

console.log(solutions.length === 1 ? solutions[0] : String(solutions.length))
