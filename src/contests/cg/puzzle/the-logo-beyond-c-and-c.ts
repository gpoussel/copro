// 🎮 CodinGame Puzzle - the-logo-beyond-c-and-c
// https://www.codingame.com/

const size: number = parseInt(readline(), 10)
const thickness: number = parseInt(readline(), 10)
const n: number = parseInt(readline(), 10)
const rows: string[] = []
for (let i = 0; i < n; i++) {
  rows.push(readline())
}

const arm: number = (size - thickness) >> 1
const height: number = rows.length
const width: number = rows.reduce((m, r) => Math.max(m, r.length), 0)
const gridHeight: number = height * size
const gridWidth: number = width * size

const filled: boolean[][] = Array.from({ length: gridHeight }, () => new Array<boolean>(gridWidth).fill(false))

const insideLocal = (r: number, c: number): boolean =>
  (c >= arm && c < arm + thickness) || (r >= arm && r < arm + thickness)

for (let i = 0; i < height; i++) {
  for (let j = 0; j < rows[i].length; j++) {
    if (rows[i][j] === "+") {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (insideLocal(r, c)) {
            filled[i * size + r][j * size + c] = true
          }
        }
      }
    }
  }
}

const dirs: number[][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

const output: string[] = []
for (let gr = 0; gr < gridHeight; gr++) {
  let line: string = ""
  for (let gc = 0; gc < gridWidth; gc++) {
    let ch: string = " "
    if (filled[gr][gc]) {
      for (const [dr, dc] of dirs) {
        const nr: number = gr + dr
        const nc: number = gc + dc
        if (nr < 0 || nr >= gridHeight || nc < 0 || nc >= gridWidth || !filled[nr][nc]) {
          ch = "+"
          break
        }
      }
    }
    line += ch
  }
  output.push(line.replace(/\s+$/, ""))
}

console.log(output.join("\n"))
