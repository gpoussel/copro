// 🎮 CodinGame Puzzle - magic-coloring
// https://www.codingame.com/training/medium/magic-coloring

const [w, h] = readline().split(" ").map(Number)
const grid: string[] = []
for (let i = 0; i < h; i++) grid.push(readline())

const seen: boolean[][] = grid.map(() => new Array<boolean>(w).fill(false))
const counts: number[] = new Array<number>(10).fill(0)
for (let r = 0; r < h; r++) {
  for (let c = 0; c < w; c++) {
    const color = grid[r][c]
    if (color === "0" || seen[r][c]) continue
    counts[Number(color)]++
    seen[r][c] = true
    const stack: [number, number][] = [[r, c]]
    while (stack.length > 0) {
      const [cr, cc] = stack.pop()!
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = cr + dr
        const nc = cc + dc
        if (nr < 0 || nc < 0 || nr >= h || nc >= w) continue
        if (seen[nr][nc] || grid[nr][nc] !== color) continue
        seen[nr][nc] = true
        stack.push([nr, nc])
      }
    }
  }
}

const lines: string[] = []
for (let color = 1; color <= 9; color++) if (counts[color] > 0) lines.push(`${color} -> ${counts[color]}`)
console.log(lines.length > 0 ? lines.join("\n") : "No coloring today")
