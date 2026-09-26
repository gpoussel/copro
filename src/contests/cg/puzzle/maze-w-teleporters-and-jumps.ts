// 🎮 CodinGame Puzzle - maze-w-teleporters-and-jumps
// https://www.codingame.com/training/medium/maze-w-teleporters-and-jumps

const width = parseInt(readline())
const height = parseInt(readline())
const grid: string[] = []
for (let i = 0; i < height; i++) grid.push(readline())

const JUMPS: { [c: string]: [number, number] } = { "<": [0, -2], ">": [0, 2], "^": [-2, 0], v: [2, 0] }
const exits: { [c: string]: [number, number] } = {}
let start: [number, number] = [0, 0]
for (let r = 0; r < height; r++) {
  for (let c = 0; c < width; c++) {
    const ch = grid[r][c]
    if (ch === "S") start = [r, c]
    else if (ch >= "A" && ch <= "Z" && ch !== "E") exits[ch] = [r, c]
  }
}

const isEntry = (ch: string) => ch >= "a" && ch <= "z" && ch !== "v"

// Follow teleporters and jump pods until landing on a plain cell (null on an endless loop)
const resolve = (r: number, c: number): [number, number] | null => {
  const seen = new Set<number>()
  while (true) {
    if (seen.has(r * width + c)) return null
    seen.add(r * width + c)
    const ch = grid[r][c]
    if (JUMPS[ch]) {
      r += JUMPS[ch][0]
      c += JUMPS[ch][1]
    } else if (isEntry(ch) && exits[ch.toUpperCase()]) {
      ;[r, c] = exits[ch.toUpperCase()]
    } else return [r, c]
    if (r < 0 || r >= height || c < 0 || c >= width || grid[r][c] === "#") return null
  }
}

const dist: number[] = new Array(width * height).fill(-1)
dist[start[0] * width + start[1]] = 0
const queue: [number, number][] = [start]
let answer = -1
for (let head = 0; head < queue.length; head++) {
  const [r, c] = queue[head]
  const d = dist[r * width + c]
  if (grid[r][c] === "E") {
    answer = d
    break
  }
  for (const [dr, dc] of [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ]) {
    const nr = r + dr
    const nc = c + dc
    if (nr < 0 || nr >= height || nc < 0 || nc >= width || grid[nr][nc] === "#") continue
    const landing = resolve(nr, nc)
    if (!landing) continue
    const idx = landing[0] * width + landing[1]
    if (dist[idx] !== -1) continue
    dist[idx] = d + 1
    queue.push(landing)
  }
}
console.log(answer)
