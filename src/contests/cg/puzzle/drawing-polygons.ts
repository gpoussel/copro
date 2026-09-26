// 🎮 CodinGame Puzzle - drawing-polygons
// https://www.codingame.com/training/hard/drawing-polygons

// Sign of the shoelace (signed area) sum: positive means counterclockwise.

const n = Number(readline())
const pts: number[][] = []
for (let i = 0; i < n; i++) pts.push(readline().split(" ").map(Number))

let area = 0
for (let i = 0; i < n; i++) {
  const [x1, y1] = pts[i]
  const [x2, y2] = pts[(i + 1) % n]
  area += x1 * y2 - x2 * y1
}
console.log(area > 0 ? "COUNTERCLOCKWISE" : "CLOCKWISE")
