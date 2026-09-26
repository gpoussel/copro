// 🎮 CodinGame Puzzle - seam-carving
// https://www.codingame.com/training/medium/seam-carving

readline() // P2
const [width, height] = readline().split(" ").map(Number)
const targetWidth = +readline().split(" ")[1]
readline() // 255
const image: number[][] = []
for (let y = 0; y < height; y++) image.push(readline().trim().split(/\s+/).map(Number))

const energyAt = (x: number, y: number): number => {
  const w = image[y].length
  const dx = x > 0 && x < w - 1 ? image[y][x + 1] - image[y][x - 1] : 0
  const dy = y > 0 && y < height - 1 ? image[y + 1][x] - image[y - 1][x] : 0
  return Math.abs(dx) + Math.abs(dy)
}

for (let w = width; w > targetWidth; w--) {
  // cost[y][x]: lowest energy of a path from (x, y) down to the bottom row
  const cost: number[][] = []
  for (let y = 0; y < height; y++) cost.push([])
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < w; x++) {
      let below = 0
      if (y < height - 1) {
        below = Infinity
        for (let nx = Math.max(0, x - 1); nx <= Math.min(w - 1, x + 1); nx++) below = Math.min(below, cost[y + 1][nx])
      }
      cost[y][x] = energyAt(x, y) + below
    }
  }
  // Leftmost choice at every step yields the lexicographically smallest optimal path
  let x = 0
  for (let nx = 1; nx < w; nx++) if (cost[0][nx] < cost[0][x]) x = nx
  console.log(cost[0][x])
  const path = [x]
  for (let y = 1; y < height; y++) {
    const prev = path[y - 1]
    const remaining = cost[y - 1][prev] - energyAt(prev, y - 1)
    let next = Math.max(0, prev - 1)
    while (cost[y][next] !== remaining) next++
    path.push(next)
  }
  path.forEach((px, y) => image[y].splice(px, 1))
}
