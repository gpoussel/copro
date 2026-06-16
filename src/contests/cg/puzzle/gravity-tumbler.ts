// 🎮 CodinGame Puzzle - gravity-tumbler
// https://www.codingame.com/training/medium/gravity-tumbler

const [, height] = readline().split(" ").map(Number)
const count = parseInt(readline())

// Read the initial grid as an array of rows (strings)
let grid: string[] = []
for (let i = 0; i < height; i++) {
  grid.push(readline())
}

// Rotate the grid counterclockwise by 90 degrees.
// If grid is H rows x W cols, result is W rows x H cols.
// CCW rotation: new[col][H-1-row] = old[row][col]
// => new row = W-1-col (from bottom), new col = row
// More precisely: for CCW, new[i][j] = old[j][W-1-i]
// where new has W rows and H columns
function rotateCCW(g: string[]): string[] {
  const rows = g.length
  const cols = g[0].length
  // result has `cols` rows and `rows` columns
  const result: string[] = []
  for (let i = 0; i < cols; i++) {
    let row = ""
    for (let j = 0; j < rows; j++) {
      // CCW: new[i][j] = old[j][cols-1-i]
      row += g[j][cols - 1 - i]
    }
    result.push(row)
  }
  return result
}

// Apply gravity: in each column, move all '#' to the bottom.
function applyGravity(g: string[]): string[] {
  const rows = g.length
  const cols = g[0].length
  // Process each column
  const result: string[][] = Array.from({ length: rows }, () => new Array(cols).fill("."))
  for (let c = 0; c < cols; c++) {
    let hashCount = 0
    for (let r = 0; r < rows; r++) {
      if (g[r][c] === "#") hashCount++
    }
    // Place hashes at the bottom
    for (let r = rows - hashCount; r < rows; r++) {
      result[r][c] = "#"
    }
  }
  return result.map(row => row.join(""))
}

// Perform `count` tumblings
for (let i = 0; i < count; i++) {
  grid = rotateCCW(grid)
  grid = applyGravity(grid)
}

// Output the result
for (const row of grid) {
  console.log(row)
}
