// 🎮 CodinGame Puzzle - jumping-frog
// https://www.codingame.com/training/medium/jumping-frog

const JUMPS: [number, number][] = [
  [0, 1], [0, 2], [0, -1], [0, -2],
  [1, 0], [2, 0], [-1, 0], [-2, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
]

const n = parseInt(readline())
const grid: string[] = []
for (let i = 0; i < n; i++) grid.push(readline())
const x0 = parseInt(readline())
const y0 = parseInt(readline())

const visited: boolean[][] = grid.map(row => row.split("").map(() => false))

const inside = (r: number, c: number) => r >= 0 && c >= 0 && r < n && c < n && grid[r][c] === "#"

// Number of unvisited lilies reachable from (r, c): an upper bound on what the path can still gain
function reachable(r: number, c: number): number {
  const seen = visited.map(row => row.slice())
  const stack: [number, number][] = [[r, c]]
  seen[r][c] = true
  let count = 0
  while (stack.length > 0) {
    const [cr, cc] = stack.pop()!
    count++
    for (const [dr, dc] of JUMPS) {
      const nr = cr + dr
      const nc = cc + dc
      if (inside(nr, nc) && !seen[nr][nc]) {
        seen[nr][nc] = true
        stack.push([nr, nc])
      }
    }
  }
  return count
}

const total = reachable(y0, x0)
let best = 0

// DFS over simple paths with branch-and-bound; stops as soon as every reachable lily is used
function explore(r: number, c: number, length: number) {
  if (length > best) best = length
  if (best === total) return
  visited[r][c] = true
  if (length - 1 + reachable(r, c) > best) {
    for (const [dr, dc] of JUMPS) {
      const nr = r + dr
      const nc = c + dc
      if (inside(nr, nc) && !visited[nr][nc]) explore(nr, nc, length + 1)
      if (best === total) break
    }
  }
  visited[r][c] = false
}

explore(y0, x0, 1)
console.log(best)
