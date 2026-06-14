// 🎮 CodinGame Puzzle - longest-coast
// https://www.codingame.com/training/easy/longest-coast

const n: number = parseInt(readline())
const g: string[] = []
for (let i = 0; i < n; i++) g.push(readline())

const visited: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false))
const dr = [1, -1, 0, 0]
const dc = [0, 0, 1, -1]

let idx = 0
let bestIdx = -1
let bestWater = -1

for (let r = 0; r < n; r++) {
  for (let c = 0; c < n; c++) {
    if (g[r][c] === "#" && !visited[r][c]) {
      idx++
      const waterSet: Set<number> = new Set()
      const stack: [number, number][] = [[r, c]]
      visited[r][c] = true
      while (stack.length) {
        const [cr, cc] = stack.pop()!
        for (let k = 0; k < 4; k++) {
          const nr = cr + dr[k]
          const nc = cc + dc[k]
          if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue
          if (g[nr][nc] === "~") {
            waterSet.add(nr * n + nc)
          } else if (!visited[nr][nc]) {
            visited[nr][nc] = true
            stack.push([nr, nc])
          }
        }
      }
      const water = waterSet.size
      if (water > bestWater) {
        bestWater = water
        bestIdx = idx
      }
    }
  }
}
console.log(bestIdx + " " + bestWater)
