// 🎮 CodinGame Puzzle - shape-recognition
// https://www.codingame.com/training/hard/shape-recognition

// Denoise by keeping the largest 4-connected blob, then template-match: for
// each candidate shape, search centre / size / rotation around the blob's
// centroid and area-derived size, rasterise the template on the 20x20 grid
// (clipping comes for free) and keep the best intersection-over-union.
const S = 20
const grid: boolean[] = []
for (let y = 0; y < S; y++) for (const c of readline().trim().split(/\s+/)) grid.push(c === "#")

// largest 4-connected component
const comp = new Array<number>(S * S).fill(-1)
let best: number[] = []
for (let i = 0; i < S * S; i++) {
  if (!grid[i] || comp[i] >= 0) continue
  const cells = [i]
  comp[i] = i
  for (let k = 0; k < cells.length; k++) {
    const c = cells[k]
    const x = c % S
    const y = (c / S) | 0
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= S || ny >= S) continue
      const n = ny * S + nx
      if (grid[n] && comp[n] < 0) {
        comp[n] = i
        cells.push(n)
      }
    }
  }
  if (cells.length > best.length) best = cells
}
const blob = new Array<boolean>(S * S).fill(false)
let mx = 0
let my = 0
for (const c of best) {
  blob[c] = true
  mx += c % S
  my += (c / S) | 0
}
const area = best.length
mx /= area
my /= area

type Inside = (px: number, py: number) => boolean
// intersection over union between the blob and a shape
function iou(inside: Inside): number {
  let inter = 0
  let union = 0
  for (let i = 0; i < S * S; i++) {
    const t = inside(i % S, (i / S) | 0)
    if (t && blob[i]) inter++
    if (t || blob[i]) union++
  }
  return union ? inter / union : 0
}

// best score of a shape family: size0 is the area-based size estimate,
// sym the rotational symmetry in degrees, make builds the inside test
function search(size0: number, sym: number, make: (cx: number, cy: number, size: number, a: number) => Inside): number {
  let top = 0
  for (let dx = -2; dx <= 2; dx += 0.5)
    for (let dy = -2; dy <= 2; dy += 0.5)
      for (let f = 0.9; f <= 1.31; f += 0.05)
        for (let deg = 0; deg < sym; deg += sym > 1 ? 5 : 360) {
          const s = iou(make(mx + dx, my + dy, size0 * f, (deg * Math.PI) / 180))
          if (s > top) top = s
        }
  return top
}

const circle = search(Math.sqrt(area / Math.PI), 1, (cx, cy, r) => (px, py) => (px - cx) ** 2 + (py - cy) ** 2 <= r * r)
const square = search(Math.sqrt(area) / 2, 90, (cx, cy, h, a) => {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return (px, py) => {
    const u = (px - cx) * c + (py - cy) * s
    const v = -(px - cx) * s + (py - cy) * c
    return Math.abs(u) <= h && Math.abs(v) <= h
  }
})
// size = inradius; equilateral triangle area = 3√3 r²
const triangle = search(Math.sqrt(area / (3 * Math.sqrt(3))), 120, (cx, cy, r, a) => {
  const normals = [0, 1, 2].map(k => [Math.cos(a + (k * 2 * Math.PI) / 3), Math.sin(a + (k * 2 * Math.PI) / 3)])
  return (px, py) => normals.every(([nx, ny]) => (px - cx) * nx + (py - cy) * ny <= r)
})

const scores: [string, number][] = [
  ["Circle", circle],
  ["Square", square],
  ["Triangle", triangle],
]
scores.sort((a, b) => b[1] - a[1])
console.log(scores[0][0])
