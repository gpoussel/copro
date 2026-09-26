// 🎮 CodinGame Puzzle - encounter-surface
// https://www.codingame.com/training/hard/encounter-surface

// Vertices come unordered: rebuild each convex polygon with a convex hull
// (monotone chain), clip one by the other (Sutherland-Hodgman) and take the
// shoelace area of the intersection, rounded up.
type P = [number, number]

const n = parseInt(readline())
const m = parseInt(readline())
const read = (k: number): P[] => {
  const pts: P[] = []
  for (let i = 0; i < k; i++) {
    const [x, y] = readline().split(" ").map(Number)
    pts.push([x, y])
  }
  return pts
}
const cross = (o: P, a: P, b: P): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

// Counter-clockwise hull
const hull = (pts: P[]): P[] => {
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const build = (list: P[]): P[] => {
    const h: P[] = []
    for (const p of list) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop()
      h.push(p)
    }
    h.pop()
    return h
  }
  return [...build(s), ...build([...s].reverse())]
}

const p1 = hull(read(n))
const p2 = hull(read(m))

// Point of segment pq on the clipping line, given the signed distances of p and q
const intersect = (p: P, q: P, dp: number, dq: number): P => {
  const t = dp / (dp - dq)
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]
}

// Keep the part of `poly` on the left of each edge of the (CCW) clipper
let poly: P[] = p1
for (let i = 0; i < p2.length && poly.length; i++) {
  const a = p2[i]
  const b = p2[(i + 1) % p2.length]
  const input = poly
  poly = []
  for (let j = 0; j < input.length; j++) {
    const cur = input[j]
    const prev = input[(j + input.length - 1) % input.length]
    const dc = cross(a, b, cur)
    const dp = cross(a, b, prev)
    if (dc >= 0) {
      if (dp < 0) poly.push(intersect(prev, cur, dp, dc))
      poly.push(cur)
    } else if (dp > 0) poly.push(intersect(prev, cur, dp, dc))
  }
}

let area = 0
for (let i = 0; i < poly.length; i++) {
  const [x1, y1] = poly[i]
  const [x2, y2] = poly[(i + 1) % poly.length]
  area += x1 * y2 - x2 * y1
}
console.log(String(Math.ceil(Math.abs(area) / 2 - 1e-9)))
