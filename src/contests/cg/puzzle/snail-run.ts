// 🎮 CodinGame Puzzle - snail-run
// https://www.codingame.com/

const numberSnails: number = parseInt(readline(), 10)
const speeds: number[] = []
for (let i = 0; i < numberSnails; i++) {
  speeds.push(parseInt(readline(), 10))
}
const mapHeight: number = parseInt(readline(), 10)
readline() // mapWidth (unused; rows give their own width)
const grid: string[] = []
for (let r = 0; r < mapHeight; r++) {
  grid.push(readline())
}

const width: number = grid[0].length
const starts: Array<[number, number]> = new Array(numberSnails + 1)
for (let r = 0; r < mapHeight; r++) {
  for (let c = 0; c < width; c++) {
    const ch: string = grid[r][c]
    if (ch >= "1" && ch <= "9") {
      starts[parseInt(ch, 10)] = [r, c]
    }
  }
}

const distTo = (sr: number, sc: number): number => {
  const dist: number[][] = []
  for (let r = 0; r < mapHeight; r++) {
    dist.push(new Array<number>(width).fill(-1))
  }
  dist[sr][sc] = 0
  const queue: Array<[number, number]> = [[sr, sc]]
  let head: number = 0
  const dr: number[] = [-1, 1, 0, 0]
  const dc: number[] = [0, 0, -1, 1]
  let best: number = Infinity
  while (head < queue.length) {
    const cell: [number, number] = queue[head++]
    const r: number = cell[0]
    const c: number = cell[1]
    if (grid[r][c] === "#") {
      best = Math.min(best, dist[r][c])
      continue
    }
    for (let k = 0; k < 4; k++) {
      const nr: number = r + dr[k]
      const nc: number = c + dc[k]
      if (nr < 0 || nr >= mapHeight || nc < 0 || nc >= width) continue
      if (dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1
      queue.push([nr, nc])
    }
  }
  return best
}

let winner: number = 1
let bestTime: number = Infinity
let bestDist: number = Infinity
for (let s = 1; s <= numberSnails; s++) {
  const d: number = distTo(starts[s][0], starts[s][1])
  const speed: number = speeds[s - 1]
  const time: number = speed > 0 ? Math.ceil(d / speed) : Infinity
  if (time < bestTime || (time === bestTime && d < bestDist)) {
    bestTime = time
    bestDist = d
    winner = s
  }
}

console.log(winner)
