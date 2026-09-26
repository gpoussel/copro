// 🎮 CodinGame Puzzle - dice-galaxy
// https://www.codingame.com/training/medium/dice-galaxy

const w = +readline()
const h = +readline()
const grid: string[][] = []
for (let i = 0; i < h; i++) {
  const row = readline().split("")
  while (row.length < w) row.push(".")
  grid.push(row)
}

// Die state: which label lies on each side [top, bottom, north, south, east, west]
type Die = [string, string, string, string, string, string]
const roll = (d: Die, dir: number): Die => {
  const [top, bottom, north, south, east, west] = d
  switch (dir) {
    case 0: // towards north (row - 1)
      return [south, north, top, bottom, east, west]
    case 1: // towards south
      return [north, south, bottom, top, east, west]
    case 2: // towards east
      return [west, east, north, south, top, bottom]
    default: // towards west
      return [east, west, north, south, bottom, top]
  }
}
const DR = [-1, 1, 0, 0]
const DC = [0, 0, 1, -1]

const out: string[][] = grid.map(row => row.map(ch => (ch === "." ? "." : "#")))
for (let r = 0; r < h; r++) {
  for (let c = 0; c < w; c++) {
    if (grid[r][c] !== "1") continue
    // Roll the die over the net starting with face 1 at the bottom; face 6 is on top
    out[r][c] = "1"
    const seen: boolean[][] = grid.map(row => row.map(() => false))
    seen[r][c] = true
    const queue: [number, number, Die][] = [[r, c, ["6", "1", "a", "b", "c", "d"]]]
    while (queue.length > 0) {
      const [cr, cc, die] = queue.shift()!
      if (die[1] === "6") out[cr][cc] = "6"
      for (let d = 0; d < 4; d++) {
        const nr = cr + DR[d]
        const nc = cc + DC[d]
        if (nr < 0 || nr >= h || nc < 0 || nc >= w || seen[nr][nc] || grid[nr][nc] === ".") continue
        seen[nr][nc] = true
        queue.push([nr, nc, roll(die, d)])
      }
    }
  }
}
for (const row of out) console.log(row.join(""))
