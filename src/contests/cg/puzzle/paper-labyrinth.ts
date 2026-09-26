// 🎮 CodinGame Puzzle - paper-labyrinth
// https://www.codingame.com/training/medium/paper-labyrinth

const [startX, startY] = readline().split(" ").map(Number)
const [rabbitX, rabbitY] = readline().split(" ").map(Number)
const [mazeW, mazeH] = readline().split(" ").map(Number)
const walls: number[][] = []
for (let y = 0; y < mazeH; y++) walls.push(readline().trim().split("").map((ch) => parseInt(ch, 16)))

// Wall bit blocking each move (only the wall of the cell being left matters: doors may be one-way)
const MOVES: [number, number, number][] = [
  [0, 1, 1], // down
  [-1, 0, 2], // left
  [0, -1, 4], // up
  [1, 0, 8], // right
]

function shortestPath(fromX: number, fromY: number, toX: number, toY: number): number {
  const dist: number[][] = []
  for (let y = 0; y < mazeH; y++) dist.push(new Array<number>(mazeW).fill(-1))
  dist[fromY][fromX] = 0
  const queue: [number, number][] = [[fromX, fromY]]
  for (let head = 0; head < queue.length; head++) {
    const [x, y] = queue[head]
    if (x === toX && y === toY) return dist[y][x]
    for (const [dx, dy, bit] of MOVES) {
      if (walls[y][x] & bit) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= mazeW || ny >= mazeH || dist[ny][nx] >= 0) continue
      dist[ny][nx] = dist[y][x] + 1
      queue.push([nx, ny])
    }
  }
  return -1
}

console.log(shortestPath(startX, startY, rabbitX, rabbitY) + " " + shortestPath(rabbitX, rabbitY, startX, startY))
