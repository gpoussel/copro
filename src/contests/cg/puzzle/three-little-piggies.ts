// 🎮 CodinGame Puzzle - three-little-piggies
// https://www.codingame.com/training/hard/three-little-piggies

// Brute force: try every rotation/position of the three tiles (no mirroring),
// without overlaps, trees or the wolf. By day no tile may cover a pig; by
// night every pig must lie under a house (H).
const field: string[][] = []
for (let i = 0; i < 4; i++) field.push(readline().trim().split(""))
const night = field.some(row => row.includes("W"))

type Cell = [number, number, string]
// Base shapes as (row, col, letter)
const shapes: Cell[][] = [
  [
    [0, 0, "H"],
    [0, 1, "s"],
    [1, 0, "s"],
  ],
  [
    [0, 0, "S"],
    [0, 1, "H"],
    [0, 2, "S"],
  ],
  [
    [0, 0, "H"],
    [0, 1, "B"],
    [0, 2, "B"],
    [1, 0, "B"],
  ],
]

// The 4 rotations of a shape, normalized to a (0, 0) origin
const rotations = (shape: Cell[]): Cell[][] => {
  const res: Cell[][] = []
  let cur = shape
  for (let k = 0; k < 4; k++) {
    const minR = Math.min(...cur.map(c => c[0]))
    const minC = Math.min(...cur.map(c => c[1]))
    res.push(cur.map(([r, c, l]) => [r - minR, c - minC, l]))
    cur = cur.map(([r, c, l]) => [c, -r, l])
  }
  return res
}

const placements: Cell[][][] = shapes.map(shape => {
  const list: Cell[][] = []
  for (const rot of rotations(shape))
    for (let dr = 0; dr < 4; dr++)
      for (let dc = 0; dc < 4; dc++) {
        const cells: Cell[] = rot.map(([r, c, l]) => [r + dr, c + dc, l])
        if (cells.some(([r, c]) => r > 3 || c > 3)) continue
        const ok = cells.every(([r, c, l]) => {
          const f = field[r][c]
          if (f === "." || f === "W") return false
          if (f === "P") return night && l === "H"
          return true
        })
        if (ok) list.push(cells)
      }
  return list
})

const pigs: [number, number][] = []
for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (field[r][c] === "P") pigs.push([r, c])

const grid = field.map(row => [...row])
const search = (t: number): boolean => {
  if (t === 3) return !night || pigs.every(([r, c]) => grid[r][c] === "H")
  for (const cells of placements[t]) {
    if (cells.some(([r, c]) => !"XP".includes(grid[r][c]))) continue
    const saved = cells.map(([r, c]) => grid[r][c])
    for (const [r, c, l] of cells) grid[r][c] = l
    if (search(t + 1)) return true
    cells.forEach(([r, c], i) => (grid[r][c] = saved[i]))
  }
  return false
}
search(0)
console.log(grid.map(row => row.join("")).join("\n"))
