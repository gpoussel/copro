// 🎮 CodinGame Puzzle - maze
// https://www.codingame.com/training/medium/maze

const [labW, labH] = readline().split(" ").map(Number)
const [startX, startY] = readline().split(" ").map(Number)
const labyrinth: string[] = []
for (let i = 0; i < labH; i++) labyrinth.push(readline())

// Flood fill from the start; every reachable border cell is an exit
const visited: boolean[][] = labyrinth.map(row => row.split("").map(() => false))
const stack: [number, number][] = [[startX, startY]]
visited[startY][startX] = true
const exits: [number, number][] = []
while (stack.length > 0) {
  const [x, y] = stack.pop()!
  if (x === 0 || y === 0 || x === labW - 1 || y === labH - 1) exits.push([x, y])
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx
    const ny = y + dy
    if (nx < 0 || ny < 0 || nx >= labW || ny >= labH) continue
    if (visited[ny][nx] || labyrinth[ny][nx] === "#") continue
    visited[ny][nx] = true
    stack.push([nx, ny])
  }
}

exits.sort((a, b) => a[0] - b[0] || a[1] - b[1])
console.log(exits.length)
for (const [x, y] of exits) console.log(`${x} ${y}`)
