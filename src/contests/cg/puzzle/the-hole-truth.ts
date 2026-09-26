// 🎮 CodinGame Puzzle - the-hole-truth
// https://www.codingame.com/training/medium/the-hole-truth

const [htW, htH] = readline().split(" ").map(Number)
const htGrid: string[] = []
for (let i = 0; i < htH; i++) htGrid.push(readline())

const visited: boolean[][] = htGrid.map(row => row.split("").map(() => false))
let holes = 0
for (let r = 0; r < htH; r++) {
  for (let c = 0; c < htW; c++) {
    if (htGrid[r][c] !== "." || visited[r][c]) continue
    // Flood fill this empty region and check whether it touches the border
    let touchesBorder = false
    visited[r][c] = true
    const stack: [number, number][] = [[r, c]]
    while (stack.length > 0) {
      const [y, x] = stack.pop()!
      if (y === 0 || x === 0 || y === htH - 1 || x === htW - 1) touchesBorder = true
      const neighbours: [number, number][] = [
        [y + 1, x],
        [y - 1, x],
        [y, x + 1],
        [y, x - 1],
      ]
      for (const [ny, nx] of neighbours) {
        if (ny < 0 || ny >= htH || nx < 0 || nx >= htW) continue
        if (htGrid[ny][nx] !== "." || visited[ny][nx]) continue
        visited[ny][nx] = true
        stack.push([ny, nx])
      }
    }
    if (!touchesBorder) holes++
  }
}
console.log(holes)
