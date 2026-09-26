// 🎮 CodinGame Puzzle - the-lost-child-episode-1
// https://www.codingame.com/training/medium/the-lost-child-episode-1

const SIZE = 10
const cityMap: string[] = []
for (let i = 0; i < SIZE; i++) cityMap.push(readline())

let startRow = 0
let startCol = 0
for (let r = 0; r < SIZE; r++) {
  for (let c = 0; c < SIZE; c++) {
    if (cityMap[r][c] === "C") {
      startRow = r
      startCol = c
    }
  }
}

// Plain BFS on the grid, each step is 10km
const distances: number[][] = cityMap.map(row => row.split("").map(() => -1))
distances[startRow][startCol] = 0
const queue: [number, number][] = [[startRow, startCol]]
const moves = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
]
let answer = -1
for (let head = 0; head < queue.length && answer < 0; head++) {
  const [r, c] = queue[head]
  if (cityMap[r][c] === "M") {
    answer = distances[r][c]
    break
  }
  for (const [dr, dc] of moves) {
    const nr = r + dr
    const nc = c + dc
    if (nr < 0 || nc < 0 || nr >= SIZE || nc >= SIZE) continue
    if (cityMap[nr][nc] === "#" || distances[nr][nc] >= 0) continue
    distances[nr][nc] = distances[r][c] + 1
    queue.push([nr, nc])
  }
}
console.log(`${answer * 10}km`)
