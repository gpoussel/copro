// 🎮 CodinGame Puzzle - ascii-snakes
// https://www.codingame.com/training/medium/ascii-snakes

const message = readline().trim()
const STEP: { [d: string]: [number, number] } = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] }
const OPPOSITE: { [d: string]: string } = { U: "D", D: "U", L: "R", R: "L" }

// Each snake cell is a 3x2 block whose drawing depends on which sides are open
const BLOCKS: { [openings: string]: [string, string] } = {
  "": ["+-+", "+-+"],
  U: ["| |", "+-+"],
  D: ["+-+", "| |"],
  L: ["--+", "--+"],
  R: ["+--", "+--"],
  DU: ["| |", "| |"],
  LR: ["---", "---"],
  RU: ["| +", "+--"],
  LU: ["+ |", "--+"],
  DR: ["+--", "| +"],
  DL: ["--+", "+ |"],
}

const cells: { row: number; col: number; openings: string[] }[] = [{ row: 0, col: 0, openings: [] }]
for (const move of message) {
  const last = cells[cells.length - 1]
  last.openings.push(move)
  cells.push({ row: last.row + STEP[move][0], col: last.col + STEP[move][1], openings: [OPPOSITE[move]] })
}

const minRow = Math.min(...cells.map(c => c.row))
const minCol = Math.min(...cells.map(c => c.col))
const maxRow = Math.max(...cells.map(c => c.row))
const maxCol = Math.max(...cells.map(c => c.col))
const canvas: string[][] = []
for (let r = 0; r < 2 * (maxRow - minRow + 1); r++) canvas.push(new Array(3 * (maxCol - minCol + 1)).fill(" "))

for (const { row, col, openings } of cells) {
  const block = BLOCKS[openings.sort().join("")]
  for (let dr = 0; dr < 2; dr++)
    for (let dc = 0; dc < 3; dc++) canvas[2 * (row - minRow) + dr][3 * (col - minCol) + dc] = block[dr][dc]
}
console.log(canvas.map(line => line.join("").replace(/\s+$/, "")).join("\n"))
