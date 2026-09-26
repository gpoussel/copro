// 🎮 CodinGame Puzzle - snowflakes
// https://www.codingame.com/training/medium/snowflakes

const [h, w] = readline().split(" ").map(Number)
const grid: string[] = []
for (let i = 0; i < h; i++) grid.push(readline())

const seen: boolean[][] = grid.map(row => row.split("").map(() => false))

// Canonical form of a shape: the smallest serialization over the 8 symmetries
function canonical(cells: [number, number][]): string {
  const transforms: ((r: number, c: number) => [number, number])[] = [
    (r, c) => [r, c],
    (r, c) => [c, -r],
    (r, c) => [-r, -c],
    (r, c) => [-c, r],
    (r, c) => [r, -c],
    (r, c) => [-c, -r],
    (r, c) => [-r, c],
    (r, c) => [c, r],
  ]
  let best: string | null = null
  for (const t of transforms) {
    const pts = cells.map(([r, c]) => t(r, c))
    const minR = Math.min(...pts.map(p => p[0]))
    const minC = Math.min(...pts.map(p => p[1]))
    const key = pts
      .map(([r, c]) => [r - minR, c - minC])
      .sort((a, b) => a[0] - b[0] || a[1] - b[1])
      .map(p => p.join(","))
      .join(";")
    if (best === null || key < best) best = key
  }
  return best!
}

let total = 0
const shapes = new Set<string>()
for (let i = 0; i < h; i++) {
  for (let j = 0; j < w; j++) {
    if (grid[i][j] !== "*" || seen[i][j]) continue
    total++
    const cells: [number, number][] = []
    const stack: [number, number][] = [[i, j]]
    seen[i][j] = true
    while (stack.length > 0) {
      const [r, c] = stack.pop()!
      cells.push([r, c])
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nc < 0 || nr >= h || nc >= w) continue
        if (grid[nr][nc] !== "*" || seen[nr][nc]) continue
        seen[nr][nc] = true
        stack.push([nr, nc])
      }
    }
    shapes.add(canonical(cells))
  }
}

console.log(total)
console.log(shapes.size)
