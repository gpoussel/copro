// 🎮 CodinGame Puzzle - the-crime-scene
// https://www.codingame.com/training/expert/the-crime-scene

// The shortest line keeping every clue at least 3 feet away is the convex hull
// offset by 3: its length is the hull perimeter plus a full circle of radius 3
// (the arcs at the corners add up to one turn). Hull by Andrew's monotone
// chain, then ceil(length / 5) rolls.

const clueTotal = Number(readline())
const pts: [number, number][] = []
for (let i = 0; i < clueTotal; i++) {
  const [x, y] = readline().trim().split(/\s+/).map(Number)
  pts.push([x, y])
}
pts.sort((a, b) => a[0] - b[0] || a[1] - b[1])

const cross = (o: [number, number], a: [number, number], b: [number, number]): number =>
  (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

const hull: [number, number][] = []
for (const p of pts) {
  while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) hull.pop()
  hull.push(p)
}
const lowerSize = hull.length + 1
for (let i = pts.length - 2; i >= 0; i--) {
  const p = pts[i]
  while (hull.length >= lowerSize && cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) hull.pop()
  hull.push(p)
}
hull.pop()

let perimeter = 0
for (let i = 0; i < hull.length; i++) {
  const a = hull[i]
  const b = hull[(i + 1) % hull.length]
  perimeter += Math.hypot(a[0] - b[0], a[1] - b[1])
}
console.log(Math.ceil((perimeter + 6 * Math.PI) / 5))
