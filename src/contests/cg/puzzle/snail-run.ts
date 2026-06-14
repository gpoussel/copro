// 🎮 CodinGame Puzzle - snail-run
// https://www.codingame.com/training/easy/snail-run

const n: number = parseInt(readline())
const speeds: number[] = []
for (let i = 0; i < n; i++) speeds.push(parseInt(readline()))
const h: number = parseInt(readline())
const w: number = parseInt(readline())
const grid: string[] = []
for (let i = 0; i < h; i++) grid.push(readline())

const dests: [number, number][] = []
const starts: { [k: number]: [number, number] } = {}
for (let r = 0; r < h; r++) {
  for (let c = 0; c < w; c++) {
    const ch = grid[r][c]
    if (ch === "#") dests.push([r, c])
    else if (ch >= "1" && ch <= "9") starts[parseInt(ch)] = [r, c]
  }
}

function bfsNearest(sr: number, sc: number): number {
  const dist: number[][] = Array.from({ length: h }, () => new Array(w).fill(-1))
  dist[sr][sc] = 0
  const q: [number, number][] = [[sr, sc]]
  let head = 0
  let best = Infinity
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  while (head < q.length) {
    const [r, c] = q[head++]
    if (grid[r][c] === "#") {
      best = Math.min(best, dist[r][c])
      continue
    }
    for (let k = 0; k < 4; k++) {
      const nr = r + dr[k]
      const nc = c + dc[k]
      if (nr < 0 || nr >= h || nc < 0 || nc >= w) continue
      if (dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1
      q.push([nr, nc])
    }
  }
  return best
}

let winner = -1
let bestTime = Infinity
for (let s = 1; s <= n; s++) {
  const pos = starts[s]
  if (!pos) continue
  const d = bfsNearest(pos[0], pos[1])
  const speed = speeds[s - 1]
  const time = speed <= 0 ? Infinity : d / speed
  if (time < bestTime) {
    bestTime = time
    winner = s
  }
}
console.log(winner)
