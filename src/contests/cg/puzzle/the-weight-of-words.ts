// 🎮 CodinGame Puzzle - the-weight-of-words
// https://www.codingame.com/training/easy/the-weight-of-words

const steps: number = parseInt(readline(), 10)
const h: number = parseInt(readline(), 10)
const w: number = parseInt(readline(), 10)

let grid: number[][] = []
for (let r = 0; r < h; r++) {
  const line: string = readline()
  const row: number[] = []
  for (let c = 0; c < w; c++) {
    row.push(line.charCodeAt(c))
  }
  grid.push(row)
}

for (let s = 0; s < steps; s++) {
  // Columns: move letters down by weight of the column
  const colWeight: number[] = []
  for (let c = 0; c < w; c++) {
    let sum = 0
    for (let r = 0; r < h; r++) {
      sum += grid[r][c]
    }
    colWeight.push(sum % h)
  }
  const afterCol: number[][] = []
  for (let r = 0; r < h; r++) {
    afterCol.push(new Array<number>(w))
  }
  for (let c = 0; c < w; c++) {
    const shift = colWeight[c]
    for (let r = 0; r < h; r++) {
      afterCol[(r + shift) % h][c] = grid[r][c]
    }
  }

  // Rows: move letters to the right by weight of the row
  const next: number[][] = []
  for (let r = 0; r < h; r++) {
    let sum = 0
    for (let c = 0; c < w; c++) {
      sum += afterCol[r][c]
    }
    const shift = sum % w
    const newRow: number[] = new Array<number>(w)
    for (let c = 0; c < w; c++) {
      newRow[(c + shift) % w] = afterCol[r][c]
    }
    next.push(newRow)
  }

  grid = next
}

const out: string[] = []
for (let r = 0; r < h; r++) {
  out.push(String.fromCharCode(...grid[r]))
}
console.log(out.join("\n"))
