// 🎮 CodinGame Puzzle - low-resolution-whats-the-shape
// https://www.codingame.com/training/easy/low-resolution-whats-the-shape

const [W, H] = readline().split(" ").map(Number)
const grid: string[] = []
for (let i = 0; i < H; i++) {
  grid.push(readline())
}

// Count non-dot (non-'.') characters per row
const rowCounts: number[] = grid.map(row => [...row].filter(c => c !== ".").length)

// Count non-dot characters per column
const colCounts: number[] = []
for (let c = 0; c < W; c++) {
  let count = 0
  for (let r = 0; r < H; r++) {
    if (grid[r][c] !== ".") count++
  }
  colCounts.push(count)
}

function isPalindrome(arr: number[]): boolean {
  for (let i = 0; i < Math.floor(arr.length / 2); i++) {
    if (arr[i] !== arr[arr.length - 1 - i]) return false
  }
  return true
}

// Check if all 4 corners are 'X'
const topLeft = grid[0][0]
const topRight = grid[0][W - 1]
const bottomLeft = grid[H - 1][0]
const bottomRight = grid[H - 1][W - 1]

if (topLeft === "X" && topRight === "X" && bottomLeft === "X" && bottomRight === "X") {
  console.log("Rectangle")
} else if (isPalindrome(rowCounts) && isPalindrome(colCounts)) {
  console.log("Ellipse")
} else {
  console.log("Triangle")
}
