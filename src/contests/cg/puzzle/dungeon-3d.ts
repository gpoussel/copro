// 🎮 CodinGame Puzzle - dungeon-3d
// https://www.codingame.com/training/medium/dungeon-3d

const [levels, rowCount, colCount] = readline().split(" ").map(Number)
readline() // number of following lines
const dungeon: string[][] = []
for (let l = 0; l < levels; l++) {
  readline() // blank separator line
  const plan: string[] = []
  for (let r = 0; r < rowCount; r++) plan.push(readline())
  dungeon.push(plan)
}

const cellAt = (l: number, r: number, c: number): string =>
  l >= 0 && l < levels && r >= 0 && r < rowCount && c >= 0 && c < colCount ? dungeon[l][r][c] || "#" : "#"

let startIdx = -1
for (let l = 0; l < levels; l++)
  for (let r = 0; r < rowCount; r++) for (let c = 0; c < colCount; c++) if (cellAt(l, r, c) === "A") startIdx = (l * rowCount + r) * colCount + c

const distance: number[] = []
for (let i = 0; i < levels * rowCount * colCount; i++) distance.push(-1)
distance[startIdx] = 0
const queue = [startIdx]
const moves = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]
let answer = "NO PATH"
for (let head = 0; head < queue.length; head++) {
  const idx = queue[head]
  const c = idx % colCount
  const r = Math.floor(idx / colCount) % rowCount
  const l = Math.floor(idx / (colCount * rowCount))
  if (cellAt(l, r, c) === "S") {
    answer = String(distance[idx])
    break
  }
  for (const [dl, dr, dc] of moves) {
    const nl = l + dl
    const nr = r + dr
    const nc = c + dc
    if (cellAt(nl, nr, nc) === "#") continue
    const nIdx = (nl * rowCount + nr) * colCount + nc
    if (distance[nIdx] >= 0) continue
    distance[nIdx] = distance[idx] + 1
    queue.push(nIdx)
  }
}
console.log(answer)
