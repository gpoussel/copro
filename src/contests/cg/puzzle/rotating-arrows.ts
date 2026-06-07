// 🎮 CodinGame Puzzle - rotating-arrows
// https://www.codingame.com/training/easy/rotating-arrows

const [W, H] = readline().split(" ").map(Number)
const [startX, startY] = readline().split(" ").map(Number)

const grid: string[][] = []
for (let i = 0; i < H; i++) {
  grid.push(readline().split(""))
}

// Clockwise rotation order: ^ -> > -> v -> < -> ^
const rotateMap: Record<string, string> = {
  "^": ">",
  ">": "v",
  v: "<",
  "<": "^",
}

// Direction vectors: char -> [dx, dy]
const dirMap: Record<string, [number, number]> = {
  "^": [0, -1],
  ">": [1, 0],
  v: [0, 1],
  "<": [-1, 0],
}

let rotations = 0
let cx = startX
let cy = startY

while (true) {
  // Rotate the current arrow clockwise
  const current = grid[cy][cx]
  const rotated = rotateMap[current]
  grid[cy][cx] = rotated
  rotations++

  // Find where the rotated arrow points
  const [dx, dy] = dirMap[rotated]
  const nx = cx + dx
  const ny = cy + dy

  // Check if next cell is out of bounds
  if (nx < 0 || nx >= W || ny < 0 || ny >= H) {
    break
  }

  // Check if next cell is the starting cell
  if (nx === startX && ny === startY) {
    break
  }

  cx = nx
  cy = ny
}

console.log(rotations)
