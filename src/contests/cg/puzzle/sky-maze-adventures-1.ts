// 🎮 CodinGame Puzzle - sky-maze-adventures-1
// https://www.codingame.com/training/medium/sky-maze-adventures-1

const [w, h] = readline().split(" ").map(Number)
const [dx, dy] = readline().split(" ").map(Number)
const maze: string[] = []
for (let i = 0; i < h; i++) maze.push(readline())

const MOVES: [number, number, string][] = [
  [0, -1, "UP"],
  [0, 1, "DOWN"],
  [-1, 0, "LEFT"],
  [1, 0, "RIGHT"],
]

// BFS from the destination: distance of every walkable cell to it
const dist: number[][] = maze.map(() => new Array<number>(w).fill(Infinity))
dist[dy][dx] = 0
const queue: [number, number][] = [[dx, dy]]
for (let head = 0; head < queue.length; head++) {
  const [x, y] = queue[head]
  for (const [mx, my] of MOVES) {
    const nx = x + mx
    const ny = y + my
    if (nx < 0 || ny < 0 || nx >= w || ny >= h || maze[ny][nx] !== "0") continue
    if (dist[ny][nx] !== Infinity) continue
    dist[ny][nx] = dist[y][x] + 1
    queue.push([nx, ny])
  }
}

while (true) {
  const [x, y] = readline().split(" ").map(Number)
  let action = "UP"
  for (const [mx, my, name] of MOVES) {
    const nx = x + mx
    const ny = y + my
    if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
    if (dist[ny][nx] === dist[y][x] - 1) {
      action = name
      break
    }
  }
  console.log(action)
}
