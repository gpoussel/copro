// 🎮 CodinGame Puzzle - inequality-overlap-area
// https://www.codingame.com/training/medium/inequality-overlap-area

// Every constraint is normalized to a*x + b*y <= c with (a, b) a unit vector
type HalfPlane = [number, number, number]

const EPS = 1e-9
const n = parseInt(readline())
const planes: HalfPlane[] = []
let impossible = false
for (let i = 0; i < n; i++) {
  const m = readline().match(/([-+]?[\d.]+)\s*x\s*([+-])\s*([\d.]+)\s*y\s*(<=|>=)\s*([-+]?[\d.]+)/)!
  let a = parseFloat(m[1])
  let b = parseFloat(m[3]) * (m[2] === "-" ? -1 : 1)
  let c = parseFloat(m[5])
  if (m[4] === ">=") {
    a = -a
    b = -b
    c = -c
  }
  const norm = Math.hypot(a, b)
  if (norm === 0) {
    if (c < 0) impossible = true
    continue
  }
  planes.push([a / norm, b / norm, c / norm])
}

const det3 = (m: number[][]): number =>
  m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
  m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
  m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])

// Largest margin t such that a point satisfies every constraint with slack t
// (LP in (x, y, t) solved by enumerating vertices, inside a huge bounding box)
function maxMargin(): number {
  const B = 1e9
  const rows: number[][] = planes.map(([a, b, c]) => [a, b, 1, c])
  rows.push([1, 0, 0, B], [-1, 0, 0, B], [0, 1, 0, B], [0, -1, 0, B], [0, 0, 1, B])
  let best = -Infinity
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      for (let k = j + 1; k < rows.length; k++) {
        const m = [rows[i], rows[j], rows[k]]
        const d = det3(m.map(r => r.slice(0, 3)))
        if (Math.abs(d) < 1e-12) continue
        const sol = [0, 1, 2].map(col => det3(m.map(r => r.slice(0, 3).map((v, idx) => (idx === col ? r[3] : v)))) / d)
        const scale = 1 + Math.abs(sol[0]) + Math.abs(sol[1])
        if (rows.every(r => r[0] * sol[0] + r[1] * sol[1] + r[2] * sol[2] <= r[3] + 1e-9 * scale)) {
          best = Math.max(best, sol[2])
        }
      }
    }
  }
  return best
}

// The region is unbounded iff some direction d != 0 satisfies n_i . d <= 0 for all i
function unbounded(): boolean {
  if (planes.length === 0) return true
  for (const [a, b] of planes) {
    for (const d of [
      [-b, a],
      [b, -a],
    ]) {
      if (planes.every(p => p[0] * d[0] + p[1] * d[1] <= EPS)) return true
    }
  }
  return false
}

function area(): number {
  const pts: [number, number][] = []
  for (let i = 0; i < planes.length; i++) {
    for (let j = i + 1; j < planes.length; j++) {
      const [a1, b1, c1] = planes[i]
      const [a2, b2, c2] = planes[j]
      const d = a1 * b2 - a2 * b1
      if (Math.abs(d) < 1e-12) continue
      const x = (c1 * b2 - c2 * b1) / d
      const y = (a1 * c2 - a2 * c1) / d
      if (planes.every(([a, b, c]) => a * x + b * y <= c + 1e-7)) pts.push([x, y])
    }
  }
  // Convex hull (monotone chain) then shoelace formula
  pts.sort((p, q) => p[0] - q[0] || p[1] - q[1])
  const cross = (o: [number, number], p: [number, number], q: [number, number]): number =>
    (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0])
  const hull: [number, number][] = []
  for (const pass of [pts, pts.slice().reverse()]) {
    const start = hull.length
    for (const p of pass) {
      while (hull.length >= start + 2 && cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) hull.pop()
      hull.push(p)
    }
    hull.pop()
  }
  let s = 0
  for (let i = 0; i < hull.length; i++) {
    const p = hull[i]
    const q = hull[(i + 1) % hull.length]
    s += p[0] * q[1] - q[0] * p[1]
  }
  return Math.abs(s) / 2
}

if (impossible || maxMargin() <= 1e-7) console.log("No Overlap")
else if (unbounded()) console.log("Overlap, But Infinite")
else console.log(area().toFixed(3))
