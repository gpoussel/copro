// 🎮 CodinGame Puzzle - mountain-map
// https://www.codingame.com/training/easy/mountain-map

const n = parseInt(readline())
const heights = readline().split(" ").map(Number)

const maxHeight = Math.max(...heights)
const totalWidth = heights.reduce((sum, h) => sum + h * 2, 0)

// Build grid as array of char arrays, filled with spaces
const grid: string[][] = []
for (let row = 0; row < maxHeight; row++) {
  grid.push(new Array(totalWidth).fill(" "))
}

// For each mountain, determine its column start and draw it
let col = 0
for (const h of heights) {
  // Mountain of height h: peak is at (maxHeight - h) row, columns col+h-1 (peak left) and col+h (peak right)
  // Rising slope: for i in 0..h-1, at row (maxHeight - 1 - i), col + i => '/'
  // Falling slope: for i in 0..h-1, at row (maxHeight - 1 - i), col + 2*h - 1 - i => '\'
  for (let i = 0; i < h; i++) {
    const row = maxHeight - 1 - i
    grid[row][col + i] = "/"
    grid[row][col + 2 * h - 1 - i] = "\\"
  }
  col += h * 2
}

// Output lines, stripping trailing spaces
const lines = grid.map(row => row.join("").replace(/\s+$/, ""))
console.log(lines.join("\n"))
