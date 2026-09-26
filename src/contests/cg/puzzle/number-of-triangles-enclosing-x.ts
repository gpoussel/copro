// 🎮 CodinGame Puzzle - number-of-triangles-enclosing-x
// https://www.codingame.com/training/medium/number-of-triangles-enclosing-x

const parsePoint = (line: string): [number, number] => {
  const [xs, ys] = line.trim().split(" ")[1].split(";")
  return [parseFloat(xs), parseFloat(ys)]
}

const [px, py] = parsePoint(readline())
const pointCount = parseInt(readline())
const pts: [number, number][] = []
for (let i = 0; i < pointCount; i++) pts.push(parsePoint(readline()))

const cross = (a: [number, number], b: [number, number], cx: number, cy: number) =>
  (b[0] - a[0]) * (cy - a[1]) - (b[1] - a[1]) * (cx - a[0])

// X counts as inside when it lies inside or on the border of a non-degenerate triangle
let enclosing = 0
for (let i = 0; i < pointCount; i++) {
  for (let j = i + 1; j < pointCount; j++) {
    for (let k = j + 1; k < pointCount; k++) {
      const a = pts[i]
      const b = pts[j]
      const c = pts[k]
      if (cross(a, b, c[0], c[1]) === 0) continue
      const d1 = cross(a, b, px, py)
      const d2 = cross(b, c, px, py)
      const d3 = cross(c, a, px, py)
      const hasNeg = d1 < 0 || d2 < 0 || d3 < 0
      const hasPos = d1 > 0 || d2 > 0 || d3 > 0
      if (!(hasNeg && hasPos)) enclosing++
    }
  }
}
console.log(enclosing)
