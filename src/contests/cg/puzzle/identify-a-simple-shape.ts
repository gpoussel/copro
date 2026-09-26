// 🎮 CodinGame Puzzle - identify-a-simple-shape
// https://www.codingame.com/training/medium/identify-a-simple-shape

type Point = [number, number]

const grid: string[][] = []
for (let y = 0; y < 20; y++) grid.push(readline().trim().split(" "))
const points: Point[] = []
for (let x = 0; x < 20; x++) for (let y = 0; y < 20; y++) if (grid[y][x] === "#") points.push([x, y])

const cross = (o: Point, a: Point, b: Point) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

// Convex hull (monotone chain) without collinear points: its vertices are the corners
const convexHull = (pts: Point[]): Point[] => {
  if (pts.length <= 1) return pts.slice()
  const build = (list: Point[]) => {
    const chain: Point[] = []
    for (const p of list) {
      while (chain.length >= 2 && cross(chain[chain.length - 2], chain[chain.length - 1], p) <= 0) chain.pop()
      chain.push(p)
    }
    chain.pop()
    return chain
  }
  const lower = build(pts)
  const upper = build(pts.slice().reverse())
  return lower.concat(upper)
}

const hull = convexHull(points) // counter-clockwise order (in a y-down frame: consistent orientation)
const corners = hull.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1])
const coords = corners.map(([x, y]) => `(${x},${y})`).join(" ")

// A shape is filled when some lattice point strictly inside the hull is painted
const hasFilledInterior = () => {
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 20; y++) {
      if (grid[y][x] !== "#") continue
      let inside = true
      for (let i = 0; i < hull.length && inside; i++)
        if (cross(hull[i], hull[(i + 1) % hull.length], [x, y]) <= 0) inside = false
      if (inside) return true
    }
  }
  return false
}

const dist2 = (a: Point, b: Point) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2

let name: string
if (hull.length === 1) name = "POINT"
else if (hull.length === 2) name = "LINE"
else {
  const fill = hasFilledInterior() ? "FILLED" : "EMPTY"
  if (hull.length === 3) name = `${fill} TRIANGLE`
  else {
    const square = dist2(hull[0], hull[1]) === dist2(hull[1], hull[2])
    name = `${fill} ${square ? "SQUARE" : "RECTANGLE"}`
  }
}
console.log(`${name} ${coords}`)
