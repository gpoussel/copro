// 🎮 CodinGame Puzzle - disks-intersection
// https://www.codingame.com/training/medium/disks-intersection

const [dx1, dy1, dr1] = readline().split(" ").map(Number)
const [dx2, dy2, dr2] = readline().split(" ").map(Number)

function lensArea(r1: number, r2: number, d: number): number {
  if (d >= r1 + r2) return 0
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2
  // Each circular segment: r^2 * acos(...) minus the kite triangle part
  const a1 = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1))
  const a2 = r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2))
  const kite = 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2))
  return a1 + a2 - kite
}

const dist = Math.sqrt((dx1 - dx2) ** 2 + (dy1 - dy2) ** 2)
console.log(lensArea(dr1, dr2, dist).toFixed(2))
