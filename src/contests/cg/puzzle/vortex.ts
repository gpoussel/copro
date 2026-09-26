// 🎮 CodinGame Puzzle - vortex
// https://www.codingame.com/training/hard/vortex

// Each concentric ring is listed counterclockwise from its top-left corner
// (down the left side, right along the bottom, up the right side, left along
// the top); cranking moves every element X steps forward in that list, so
// only X mod ring length matters. Rings of width or height 1 stay put.

const [matW, matH] = readline().split(" ").map(Number)
const shift = parseInt(readline())
const grid: string[][] = []
for (let i = 0; i < matH; i++) grid.push(readline().trim().split(/\s+/))

const result = grid.map(row => [...row])
for (let k = 0; 2 * k < Math.min(matW, matH); k++) {
  const top = k
  const left = k
  const bottom = matH - 1 - k
  const right = matW - 1 - k
  if (top === bottom || left === right) continue
  const ring: [number, number][] = []
  for (let r = top; r < bottom; r++) ring.push([r, left])
  for (let c = left; c < right; c++) ring.push([bottom, c])
  for (let r = bottom; r > top; r--) ring.push([r, right])
  for (let c = right; c > left; c--) ring.push([top, c])
  const len = ring.length
  const s = shift % len
  ring.forEach(([r, c], i) => {
    const [nr, nc] = ring[(i + s) % len]
    result[nr][nc] = grid[r][c]
  })
}
console.log(result.map(row => row.join(" ")).join("\n"))
