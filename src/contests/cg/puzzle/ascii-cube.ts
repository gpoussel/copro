// 🎮 CodinGame Puzzle - ascii-cube
// https://www.codingame.com/training/medium/ascii-cube

const w = Number(readline())
const h = Number(readline())
const d = Number(readline())

// Points live on the corners of character cells: (x, y) with x the column, y the row.
// Moving along the width goes 2 columns right, along the height 1 down-right,
// along the depth 1 up-right.
type Point = [number, number]
const add = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1]]
const W: Point = [2 * w, 0]
const H: Point = [h, h]
const D: Point = [d, -d]

const rows = d + h + 1
const cols = 2 * w + d + h + 1
const canvas: string[][] = []
const priority: number[][] = []
for (let r = 0; r < rows; r++) {
  canvas.push(new Array<string>(cols).fill(" "))
  priority.push(new Array<number>(cols).fill(0))
}

// Solid obliques win over everything, hidden obliques win over horizontal edges
const PRIORITY: { [ch: string]: number } = { "/": 4, "\\": 4, "⠌": 3, "⠡": 3, _: 2, ".": 1 }
function put(row: number, col: number, ch: string): void {
  if (PRIORITY[ch] > priority[row][col]) {
    canvas[row][col] = ch
    priority[row][col] = PRIORITY[ch]
  }
}

function widthEdge([x, y]: Point, ch: string): void {
  for (let i = 0; i < 2 * w; i++) put(y - 1, x + i, ch)
}
function heightEdge([x, y]: Point, ch: string): void {
  for (let k = 0; k < h; k++) put(y + k, x + k, ch)
}
function depthEdge([x, y]: Point, ch: string): void {
  for (let k = 0; k < d; k++) put(y - 1 - k, x + k, ch)
}

const F: Point = [0, d + 1] // front top left corner
// Front face
widthEdge(F, "_")
widthEdge(add(F, H), "_")
heightEdge(F, "\\")
heightEdge(add(F, W), "\\")
// Top face
widthEdge(add(F, D), "_")
depthEdge(F, "/")
depthEdge(add(F, W), "/")
// Right face
heightEdge(add(add(F, W), D), "\\")
depthEdge(add(add(F, W), H), "/")
// Hidden edges, unless the cube is too thin to show them
const thinDimensions = [w, h, d].filter(v => v === 1).length
if (thinDimensions < 2) {
  heightEdge(add(F, D), "⠡")
  widthEdge(add(add(F, D), H), ".")
  depthEdge(add(F, H), "⠌")
}

for (const line of canvas) console.log(line.join("").replace(/\s+$/, ""))
