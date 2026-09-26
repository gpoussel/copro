// 🎮 CodinGame Puzzle - how-many-triangles-and-rectangles
// https://www.codingame.com/training/medium/how-many-triangles-and-rectangles

const [h, w] = readline().split(" ").map(Number)
const grid: string[] = []
for (let i = 0; i < h; i++) grid.push(readline())

const ids: number[][] = grid.map(() => new Array<number>(w).fill(-1))
const points: [number, number][] = []
for (let r = 0; r < h; r++) {
  for (let c = 0; c < w; c++) {
    if (grid[r].charAt(c) === "+") {
      ids[r][c] = points.length
      points.push([r, c])
    }
  }
}
const n = points.length

// Two corners are linked when a straight stroke (possibly through other corners) joins them
const linked: boolean[][] = points.map(() => new Array<boolean>(n).fill(false))
const directions: [number, number, string][] = [
  [0, 1, "-"],
  [1, 0, "|"],
  [1, 1, "\\"],
  [1, -1, "/"],
]
for (let i = 0; i < n; i++) {
  const [r0, c0] = points[i]
  for (const [dr, dc, stroke] of directions) {
    let r = r0 + dr
    let c = c0 + dc
    while (r < h && c >= 0 && c < w) {
      const ch = grid[r].charAt(c)
      if (ch === "+") {
        const j = ids[r][c]
        linked[i][j] = linked[j][i] = true
      } else if (ch !== stroke) break
      r += dr
      c += dc
    }
  }
}

const neighbors: number[][] = linked.map(row => {
  const list: number[] = []
  row.forEach((isLinked, j) => {
    if (isLinked) list.push(j)
  })
  return list
})

let triangles = 0
for (let a = 0; a < n; a++) {
  for (const b of neighbors[a]) {
    if (b <= a) continue
    for (const c of neighbors[b]) {
      if (c <= b || !linked[a][c]) continue
      const [ar, ac] = points[a]
      const [br, bc] = points[b]
      const [cr, cc] = points[c]
      if ((br - ar) * (cc - ac) - (bc - ac) * (cr - ar) !== 0) triangles++
    }
  }
}

let rectangles = 0
for (let a = 0; a < n; a++) {
  const [ar, ac] = points[a]
  for (const b of neighbors[a]) {
    const [br, bc] = points[b]
    if (br !== ar || bc <= ac) continue
    for (const c of neighbors[a]) {
      const [cr, cc] = points[c]
      if (cc !== ac || cr <= ar) continue
      const d = ids[cr][bc]
      if (d >= 0 && linked[b][d] && linked[c][d]) rectangles++
    }
  }
}

console.log(triangles)
console.log(rectangles)
