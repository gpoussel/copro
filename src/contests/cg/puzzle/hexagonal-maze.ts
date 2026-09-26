// 🎮 CodinGame Puzzle - hexagonal-maze
// https://www.codingame.com/training/medium/hexagonal-maze

const [mazeW, mazeH] = readline().split(" ").map(Number)
const maze: string[][] = []
for (let i = 0; i < mazeH; i++) maze.push(readline().split(""))

let start = 0
let goal = 0
for (let r = 0; r < mazeH; r++) {
  for (let c = 0; c < mazeW; c++) {
    if (maze[r][c] === "S") start = r * mazeW + c
    if (maze[r][c] === "E") goal = r * mazeW + c
  }
}

// Even rows are shifted left: their vertical neighbours are at columns c-1 and c.
// Odd rows are shifted right: their vertical neighbours are at columns c and c+1.
function hexNeighbours(r: number, c: number): [number, number][] {
  const off = r % 2 === 0 ? -1 : 0
  return [
    [r, c - 1],
    [r, c + 1],
    [r - 1, c + off],
    [r - 1, c + off + 1],
    [r + 1, c + off],
    [r + 1, c + off + 1],
  ]
}

const prev: number[] = new Array(mazeW * mazeH).fill(-2)
prev[start] = -1
const queue = [start]
for (let qi = 0; qi < queue.length && prev[goal] === -2; qi++) {
  const cur = queue[qi]
  const r = Math.floor(cur / mazeW)
  const c = cur % mazeW
  for (const [nr0, nc0] of hexNeighbours(r, c)) {
    const nr = (nr0 + mazeH) % mazeH
    const nc = (nc0 + mazeW) % mazeW
    const id = nr * mazeW + nc
    if (maze[nr][nc] === "#" || prev[id] !== -2) continue
    prev[id] = cur
    queue.push(id)
  }
}

for (let cur = prev[goal]; cur !== start; cur = prev[cur]) {
  maze[Math.floor(cur / mazeW)][cur % mazeW] = "."
}
for (const row of maze) console.log(row.join(""))
