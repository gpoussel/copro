// 🎮 CodinGame Puzzle - green-valleys
// https://www.codingame.com/training/medium/green-valleys

const snowLine = parseInt(readline())
const size = parseInt(readline())
const heights: number[][] = []
for (let i = 0; i < size; i++) heights.push(readline().trim().split(/\s+/).map(Number))

const visited: boolean[][] = heights.map(row => row.map(() => false))
let bestArea = 0
let bestDepth = 0
for (let r = 0; r < size; r++) {
  for (let c = 0; c < size; c++) {
    if (visited[r][c] || heights[r][c] > snowLine) continue
    // Flood fill the valley
    let area = 0
    let deepest = Infinity
    const stack: [number, number][] = [[r, c]]
    visited[r][c] = true
    while (stack.length > 0) {
      const [y, x] = stack.pop()!
      area++
      deepest = Math.min(deepest, heights[y][x])
      for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ny = y + dy
        const nx = x + dx
        if (ny < 0 || nx < 0 || ny >= size || nx >= size) continue
        if (visited[ny][nx] || heights[ny][nx] > snowLine) continue
        visited[ny][nx] = true
        stack.push([ny, nx])
      }
    }
    if (area > bestArea || (area === bestArea && deepest < bestDepth)) {
      bestArea = area
      bestDepth = deepest
    }
  }
}
console.log(bestDepth)
