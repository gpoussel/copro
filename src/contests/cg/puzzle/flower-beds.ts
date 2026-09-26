// 🎮 CodinGame Puzzle - flower-beds
// https://www.codingame.com/training/hard/flower-beds

// Pick's theorem: interior lattice points I = A - B/2 + 1, with the doubled
// area from the shoelace formula and B the boundary points (sum of gcds).
const n = Number(readline())
const pts: [number, number][] = []
for (let i = 0; i < n; i++) {
  const [x, y] = readline().split(" ").map(Number)
  pts.push([x, y])
}
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
let area2 = 0
let boundary = 0
for (let i = 0; i < n; i++) {
  const [x1, y1] = pts[i]
  const [x2, y2] = pts[(i + 1) % n]
  area2 += x1 * y2 - x2 * y1
  boundary += gcd(Math.abs(x2 - x1), Math.abs(y2 - y1))
}
console.log((Math.abs(area2) - boundary + 2) / 2)
