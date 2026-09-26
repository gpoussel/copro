// 🎮 CodinGame Puzzle - optimized-coloring
// https://www.codingame.com/training/medium/optimized-coloring

const w = parseInt(readline())
const h = parseInt(readline())
const sheet: string[] = []
for (let i = 0; i < h; i++) {
  let line = readline()
  while (line.length < w) line += " "
  sheet.push(line)
}

// Label each zone (4-connected group of spaces)
const zone: number[][] = sheet.map(row => row.split("").map(() => -1))
let zones = 0
for (let r = 0; r < h; r++) {
  for (let c = 0; c < w; c++) {
    if (sheet[r][c] !== " " || zone[r][c] >= 0) continue
    const stack: [number, number][] = [[r, c]]
    zone[r][c] = zones
    while (stack.length > 0) {
      const [y, x] = stack.pop()!
      for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ny = y + dy
        const nx = x + dx
        if (ny < 0 || nx < 0 || ny >= h || nx >= w) continue
        if (sheet[ny][nx] !== " " || zone[ny][nx] >= 0) continue
        zone[ny][nx] = zones
        stack.push([ny, nx])
      }
    }
    zones++
  }
}

// Two zones are adjacent when a single non-space character separates them
const adjacent: boolean[][] = []
for (let i = 0; i < zones; i++) adjacent.push(new Array(zones).fill(false))
const link = (a: number, b: number): void => {
  if (a >= 0 && b >= 0 && a !== b) adjacent[a][b] = adjacent[b][a] = true
}
for (let r = 0; r < h; r++) {
  for (let c = 0; c < w; c++) {
    if (zone[r][c] < 0) continue
    if (c + 2 < w && zone[r][c + 1] < 0) link(zone[r][c], zone[r][c + 2])
    if (r + 2 < h && zone[r + 1][c] < 0) link(zone[r][c], zone[r + 2][c])
  }
}

const colors: number[] = new Array(zones).fill(-1)
function colorable(i: number, k: number): boolean {
  if (i === zones) return true
  for (let color = 0; color < k; color++) {
    let ok = true
    for (let j = 0; j < i && ok; j++) if (adjacent[i][j] && colors[j] === color) ok = false
    if (!ok) continue
    colors[i] = color
    if (colorable(i + 1, k)) return true
  }
  colors[i] = -1
  return false
}

let k = 1
while (zones > 0 && !colorable(0, k)) k++
console.log(zones === 0 ? 0 : k)
