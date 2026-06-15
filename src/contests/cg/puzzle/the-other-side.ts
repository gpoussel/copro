// 🎮 CodinGame Puzzle - the-other-side
// https://www.codingame.com/training/easy/the-other-side

const h = parseInt(readline())
const w = parseInt(readline())
const grid: string[][] = []
for (let i = 0; i < h; i++) grid.push(readline().split(" "))

function reaches(sr: number): boolean {
  if (grid[sr][0] !== "+") return false
  const visited: boolean[][] = Array.from({ length: h }, () => new Array<boolean>(w).fill(false))
  const stack: [number, number][] = [[sr, 0]]
  visited[sr][0] = true
  while (stack.length) {
    const [r, c] = stack.pop()!
    if (c === w - 1) return true
    const dirs: [number, number][] = [
      [r + 1, c],
      [r - 1, c],
      [r, c + 1],
      [r, c - 1],
    ]
    for (const [nr, nc] of dirs) {
      if (nr >= 0 && nr < h && nc >= 0 && nc < w && !visited[nr][nc] && grid[nr][nc] === "+") {
        visited[nr][nc] = true
        stack.push([nr, nc])
      }
    }
  }
  return false
}

let count = 0
for (let r = 0; r < h; r++) if (reaches(r)) count++
console.log(count)
