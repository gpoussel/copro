// 🎮 CodinGame Puzzle - 2-5d-maze
// https://www.codingame.com/training/medium/2-5d-maze

const [mzStartY, mzStartX] = readline().split(" ").map(Number)
const [mzEndY, mzEndX] = readline().split(" ").map(Number)
const [mzH, mzW] = readline().split(" ").map(Number)
const maze: string[] = []
for (let i = 0; i < mzH; i++) maze.push(readline())

// Levels: 0 = floor, 1 = top of short walls / bridges, 2 = standing on a slope
const SLOPE = 2

function tileAt(y: number, x: number): string {
  if (y < 0 || y >= mzH || x < 0 || x >= mzW) return "#"
  return maze[y][x] || "#"
}

function supportsLevel(tile: string, level: number): boolean {
  if (level === 0) return tile === "." || tile === "X" || tile === "O"
  return tile === "+" || tile === "X"
}

const isSlope = (tile: string) => tile === "|" || tile === "-"
const slopeAllows = (tile: string, dy: number) => (tile === "|" ? dy !== 0 : dy === 0)

const mzKey = (y: number, x: number, level: number) => (y * mzW + x) * 3 + level
const mzDist: number[] = new Array(mzH * mzW * 3).fill(-1)
const mzQueue: [number, number, number][] = [[mzStartY, mzStartX, 0]]
mzDist[mzKey(mzStartY, mzStartX, 0)] = 0
const MZ_DIRS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

let answer = -1
for (let head = 0; head < mzQueue.length && answer < 0; head++) {
  const [y, x, level] = mzQueue[head]
  const d = mzDist[mzKey(y, x, level)]
  if (y === mzEndY && x === mzEndX && level === 0) {
    answer = d
    break
  }
  const here = tileAt(y, x)
  for (const [dy, dx] of MZ_DIRS) {
    if (level === SLOPE && !slopeAllows(here, dy)) continue
    const ny = y + dy
    const nx = x + dx
    const next = tileAt(ny, nx)
    const targets: number[] = []
    if (isSlope(next)) {
      if (slopeAllows(next, dy)) targets.push(SLOPE)
    } else if (level === SLOPE) {
      for (const l of [0, 1]) if (supportsLevel(next, l)) targets.push(l)
    } else if (supportsLevel(next, level)) targets.push(level)
    for (const nl of targets) {
      const k = mzKey(ny, nx, nl)
      if (mzDist[k] >= 0) continue
      mzDist[k] = d + 1
      mzQueue.push([ny, nx, nl])
    }
  }
}

console.log(answer)
