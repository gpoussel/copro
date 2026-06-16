// 🎮 CodinGame Puzzle - ascii-graph
// https://www.codingame.com/training/medium/ascii-graph

const n: number = parseInt(readline(), 10)
const pts: Array<[number, number]> = []
for (let i = 0; i < n; i++) {
  const [x, y] = readline()
    .split(" ")
    .map(s => parseInt(s, 10))
  pts.push([x, y])
}
let minX = 0,
  maxX = 0,
  minY = 0,
  maxY = 0
for (const [x, y] of pts) {
  if (x < minX) minX = x
  if (x > maxX) maxX = x
  if (y < minY) minY = y
  if (y > maxY) maxY = y
}
minX -= 1
maxX += 1
minY -= 1
maxY += 1
const set = new Set<string>()
for (const [x, y] of pts) set.add(x + "," + y)
const lines: string[] = []
for (let y = maxY; y >= minY; y--) {
  let row = ""
  for (let x = minX; x <= maxX; x++) {
    if (set.has(x + "," + y)) row += "*"
    else if (x === 0 && y === 0) row += "+"
    else if (x === 0) row += "|"
    else if (y === 0) row += "-"
    else row += "."
  }
  lines.push(row)
}
console.log(lines.join("\n"))
