// 🎮 CodinGame Puzzle - flood-fill-example
// https://www.codingame.com/training/medium/flood-fill-example

const width = parseInt(readline())
const height = parseInt(readline())
const map: string[][] = []
for (let r = 0; r < height; r++) map.push(readline().split("").slice(0, width))

const CONFLICT = -2
const UNSEEN = -1
// Each cell goes to the tower with the strictly smallest walking distance; ties become "+"
const owner: number[][] = map.map(row => row.map(() => UNSEEN))
const bestDist: number[][] = map.map(row => row.map(() => Infinity))
const symbols: string[] = []

const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

for (let tr = 0; tr < height; tr++)
  for (let tc = 0; tc < width; tc++) {
    if (map[tr][tc] === "." || map[tr][tc] === "#") continue
    const tower = symbols.length
    symbols.push(map[tr][tc])
    const dist: number[][] = map.map(row => row.map(() => -1))
    dist[tr][tc] = 0
    const queue: [number, number][] = [[tr, tc]]
    for (let qi = 0; qi < queue.length; qi++) {
      const [r, c] = queue[qi]
      const d = dist[r][c]
      if (d < bestDist[r][c]) {
        bestDist[r][c] = d
        owner[r][c] = tower
      } else if (d === bestDist[r][c]) owner[r][c] = CONFLICT
      for (const [dr, dc] of DIRS) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nr >= height || nc < 0 || nc >= width || map[nr][nc] !== "." || dist[nr][nc] >= 0) continue
        dist[nr][nc] = d + 1
        queue.push([nr, nc])
      }
    }
  }

const output = map.map((row, r) =>
  row
    .map((ch, c) => {
      const who = owner[r][c]
      if (who === CONFLICT) return "+"
      if (who === UNSEEN) return ch
      return symbols[who]
    })
    .join(""),
)
console.log(output.join("\n"))
