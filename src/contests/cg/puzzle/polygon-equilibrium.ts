// 🎮 CodinGame Puzzle - polygon-equilibrium
// https://www.codingame.com/training/medium/polygon-equilibrium

type Point = [number, number]

const n = parseInt(readline())
const pts: Point[] = []
for (let i = 0; i < n; i++) {
  const [x, y] = readline().split(" ").map(Number)
  pts.push([x, y])
}

// Centroid kept as exact integers: G = (gx / s, gy / s) with s = 6 * signed area
let s = 0
let gx = 0
let gy = 0
for (let i = 0; i < n; i++) {
  const [x0, y0] = pts[i]
  const [x1, y1] = pts[(i + 1) % n]
  const cr = x0 * y1 - x1 * y0
  s += 3 * cr
  gx += (x0 + x1) * cr
  gy += (y0 + y1) * cr
}
if (s < 0) {
  s = -s
  gx = -gx
  gy = -gy
}

// Supporting segments are exactly the edges of the strict convex hull
const cross = (o: Point, a: Point, b: Point): number =>
  (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
const sorted = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1])
const hull: Point[] = []
for (const pass of [sorted, sorted.slice().reverse()]) {
  const start = hull.length
  for (const p of pass) {
    while (hull.length >= start + 2 && cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) hull.pop()
    hull.push(p)
  }
  hull.pop()
}

let equilibria = 0
for (let i = 0; i < hull.length; i++) {
  const p = hull[i]
  const q = hull[(i + 1) % hull.length]
  const dx = q[0] - p[0]
  const dy = q[1] - p[1]
  // Projection of the centroid on PQ must fall inside the segment (bounds included)
  const proj = (gx - p[0] * s) * dx + (gy - p[1] * s) * dy
  if (proj >= 0 && proj <= (dx * dx + dy * dy) * s) equilibria++
}

console.log(hull.length)
console.log(equilibria)
