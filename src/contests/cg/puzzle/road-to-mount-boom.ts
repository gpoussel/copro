// 🎮 CodinGame Puzzle - road-to-mount-boom
// https://www.codingame.com/training/medium/road-to-mount-boom

const [rmH, rmW] = readline().split(" ").map(Number)
// Pad the map with one ring of empty cells: the outside is open land
const H = rmH + 2
const W = rmW + 2
const mountain: boolean[][] = []
for (let r = 0; r < H; r++) mountain.push(new Array(W).fill(false))
let startR = 0
let startC = 0
let goalR = 0
let goalC = 0
for (let r = 0; r < rmH; r++) {
  const row = readline()
  for (let c = 0; c < rmW; c++) {
    const ch = row[c] || " "
    if (ch === "^") mountain[r + 1][c + 1] = true
    else if (ch === "B") {
      startR = r + 1
      startC = c + 1
    } else if (ch === "M") {
      goalR = r + 1
      goalC = c + 1
    }
  }
}

const rmDist: number[][] = mountain.map(row => row.map(() => -1))
rmDist[startR][startC] = 0
const rmQueue: [number, number][] = [[startR, startC]]
for (let head = 0; head < rmQueue.length; head++) {
  const [r, c] = rmQueue[head]
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue
      if (mountain[nr][nc] || rmDist[nr][nc] >= 0) continue
      // No diagonal squeeze between two adjacent mountains
      if (dr !== 0 && dc !== 0 && mountain[r][nc] && mountain[nr][c]) continue
      rmDist[nr][nc] = rmDist[r][c] + 1
      rmQueue.push([nr, nc])
    }
  }
}

const leagues = rmDist[goalR][goalC]
console.log(`${leagues} ${leagues === 1 ? "league" : "leagues"}`)
