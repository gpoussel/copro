// 🎮 CodinGame Puzzle - cows-in-a-maze
// https://www.codingame.com/training/medium/cows-in-a-maze

const [c, n, m] = readline().split(" ").map(Number)
const cows: number[] = []
for (let i = 0; i < c; i++) cows.push(Number(readline()))
const grid: number[][] = []
for (let i = 0; i < n; i++) grid.push(readline().trim().split(/\s+/).map(Number))

function canPass(limit: number): boolean {
  if (grid[0][0] > limit) return false
  const seen: boolean[][] = grid.map(row => row.map(() => false))
  seen[0][0] = true
  const stack: [number, number][] = [[0, 0]]
  while (stack.length > 0) {
    const [r, col] = stack.pop()!
    if (r === n - 1 && col === m - 1) return true
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr
      const nc = col + dc
      if (nr < 0 || nr >= n || nc < 0 || nc >= m || seen[nr][nc] || grid[nr][nc] > limit) continue
      seen[nr][nc] = true
      stack.push([nr, nc])
    }
  }
  return false
}

console.log(cows.filter(canPass).length)
