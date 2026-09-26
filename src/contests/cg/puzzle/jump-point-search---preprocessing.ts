// 🎮 CodinGame Puzzle - jump-point-search---preprocessing
// https://www.codingame.com/training/hard/jump-point-search---preprocessing

// JPS+ preprocessing (Rabin & Silva): mark primary jump points per travel
// direction, then compute straight distances, then diagonal distances.
const [width, height] = readline().split(" ").map(Number)
const grid: string[] = []
for (let i = 0; i < height; i++) grid.push(readline())

// Directions in output order: N NE E SE S SW W NW as [dc, dr]
const DIRS: [number, number][] = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
]

const open = (c: number, r: number): boolean => c >= 0 && r >= 0 && c < width && r < height && grid[r][c] === "."

// Node reached while travelling (dc, dr) is a primary jump point if its parent
// is open and it has a forced neighbour on either perpendicular side
const isJumpPoint = (c: number, r: number, dc: number, dr: number): boolean => {
  if (!open(c, r) || !open(c - dc, r - dr)) return false
  for (const s of [1, -1]) {
    const pc = dr * s
    const pr = dc * s
    if (open(c + pc, r + pr) && !open(c - dc + pc, r - dr + pr)) return true
  }
  return false
}

const dist: number[][][] = []
for (let r = 0; r < height; r++) {
  dist.push([])
  for (let c = 0; c < width; c++) dist[r].push(new Array<number>(8).fill(0))
}

// Straight directions
for (let r = 0; r < height; r++)
  for (let c = 0; c < width; c++) {
    if (!open(c, r)) continue
    for (let d = 0; d < 8; d += 2) {
      const [dc, dr] = DIRS[d]
      let k = 0
      let x = c
      let y = r
      let value = 0
      while (true) {
        if (!open(x + dc, y + dr)) {
          value = -k
          break
        }
        x += dc
        y += dr
        k++
        if (isJumpPoint(x, y, dc, dr)) {
          value = k
          break
        }
      }
      dist[r][c][d] = value
    }
  }

// Diagonal directions: stop when a straight jump point is reachable along a component
for (let r = 0; r < height; r++)
  for (let c = 0; c < width; c++) {
    if (!open(c, r)) continue
    for (let d = 1; d < 8; d += 2) {
      const [dc, dr] = DIRS[d]
      const vertical = dr < 0 ? 0 : 4
      const horizontal = dc > 0 ? 2 : 6
      let k = 0
      let x = c
      let y = r
      let value = 0
      while (true) {
        if (!open(x + dc, y) || !open(x, y + dr) || !open(x + dc, y + dr)) {
          value = -k
          break
        }
        x += dc
        y += dr
        k++
        if (dist[y][x][vertical] > 0 || dist[y][x][horizontal] > 0) {
          value = k
          break
        }
      }
      dist[r][c][d] = value
    }
  }

const out: string[] = []
for (let r = 0; r < height; r++)
  for (let c = 0; c < width; c++) if (open(c, r)) out.push(`${c} ${r} ${dist[r][c].join(" ")}`)
console.log(out.join("\n"))
