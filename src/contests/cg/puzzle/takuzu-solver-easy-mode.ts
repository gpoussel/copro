// 🎮 CodinGame Puzzle - takuzu-solver-easy-mode
// https://www.codingame.com/

const n: number = parseInt(readline(), 10)
const grid: string[][] = []
for (let i = 0; i < n; i++) {
  grid.push(readline().split(""))
}

const at = (r: number, c: number): string => grid[r][c]

const lineCells = (idx: number, isRow: boolean): [number, number][] => {
  const cells: [number, number][] = []
  for (let k = 0; k < n; k++) {
    cells.push(isRow ? [idx, k] : [k, idx])
  }
  return cells
}

let changed: boolean = true
while (changed) {
  changed = false

  // Rule 2: avoid three in a row by triple patterns
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (at(r, c) !== ".") continue
      const checks: [number, number, number, number, number, number][] = [
        [r, c - 2, r, c - 1, r, c],
        [r, c - 1, r, c, r, c + 1],
        [r, c, r, c + 1, r, c + 2],
        [r - 2, c, r - 1, c, r, c],
        [r - 1, c, r, c, r + 1, c],
        [r, c, r + 1, c, r + 2, c],
      ]
      for (const [r1, c1, r2, c2, r3, c3] of checks) {
        if (r1 < 0 || c1 < 0 || r1 >= n || c1 >= n) continue
        if (r3 < 0 || c3 < 0 || r3 >= n || c3 >= n) continue
        // Force the unknown slot to the opposite when the other two are known and equal
        const slots: [number, number, string][] = [
          [r1, c1, grid[r1][c1]],
          [r2, c2, grid[r2][c2]],
          [r3, c3, grid[r3][c3]],
        ]
        let unknownCount: number = 0
        let unknownPos: [number, number] | null = null
        const knownVals: string[] = []
        for (const [sr, sc, sv] of slots) {
          if (sv === ".") {
            unknownCount++
            unknownPos = [sr, sc]
          } else {
            knownVals.push(sv)
          }
        }
        if (unknownCount === 1 && unknownPos !== null && knownVals.length === 2 && knownVals[0] === knownVals[1]) {
          grid[unknownPos[0]][unknownPos[1]] = knownVals[0] === "0" ? "1" : "0"
          changed = true
        }
      }
    }
  }

  // Rule 1: if a row/column has all of one digit placed, fill rest with the other
  for (let d = 0; d < 2; d++) {
    const isRow: boolean = d === 0
    for (let idx = 0; idx < n; idx++) {
      const cells = lineCells(idx, isRow)
      let zeros: number = 0
      let ones: number = 0
      for (const [cr, cc] of cells) {
        if (grid[cr][cc] === "0") zeros++
        else if (grid[cr][cc] === "1") ones++
      }
      const half: number = n / 2
      let fill: string | null = null
      if (zeros === half) fill = "1"
      else if (ones === half) fill = "0"
      if (fill !== null) {
        for (const [cr, cc] of cells) {
          if (grid[cr][cc] === ".") {
            grid[cr][cc] = fill
            changed = true
          }
        }
      }
    }
  }
}

console.log(grid.map(row => row.join("")).join("\n"))
