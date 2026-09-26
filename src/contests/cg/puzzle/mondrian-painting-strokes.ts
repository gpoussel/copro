// 🎮 CodinGame Puzzle - mondrian-painting-strokes
// https://www.codingame.com/training/medium/mondrian-painting-strokes

const [width, height] = readline().split(" ").map(Number)
const grid: string[] = []
for (let i = 0; i < height; i++) grid.push(readline())

// A stroke is a maximal run of consecutive boundary edges along the same grid line
let strokes = 0
for (let r = 0; r + 1 < height; r++) {
  let inStroke = false
  for (let c = 0; c < width; c++) {
    const boundary = grid[r].charAt(c) !== grid[r + 1].charAt(c)
    if (boundary && !inStroke) strokes++
    inStroke = boundary
  }
}
for (let c = 0; c + 1 < width; c++) {
  let inStroke = false
  for (let r = 0; r < height; r++) {
    const boundary = grid[r].charAt(c) !== grid[r].charAt(c + 1)
    if (boundary && !inStroke) strokes++
    inStroke = boundary
  }
}
console.log(strokes)
