// 🎮 CodinGame Puzzle - zergling-rush
// https://www.codingame.com/training/hard/zergling-rush

// Flood fill (4-connected) the empty cells reachable from the grid border;
// every reached cell touching a building (8 directions) gets a zergling.
const [W, H] = readline().split(" ").map(Number)
const g: string[][] = []
for (let i = 0; i < H; i++) g.push(readline().split(""))

const seen: boolean[][] = g.map(row => row.map(() => false))
const queue: [number, number][] = []
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    if ((y === 0 || x === 0 || y === H - 1 || x === W - 1) && g[y][x] === ".") {
      seen[y][x] = true
      queue.push([x, y])
    }
for (let k = 0; k < queue.length; k++) {
  const [x, y] = queue[k]
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const nx = x + dx
    const ny = y + dy
    if (nx >= 0 && ny >= 0 && nx < W && ny < H && !seen[ny][nx] && g[ny][nx] === ".") {
      seen[ny][nx] = true
      queue.push([nx, ny])
    }
  }
}

const touchesBuilding = (x: number, y: number): boolean => {
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (g[y + dy]?.[x + dx] === "B") return true
  return false
}
const out = g.map((row, y) => row.map((c, x) => (seen[y][x] && touchesBuilding(x, y) ? "z" : c)).join(""))
console.log(out.join("\n"))
