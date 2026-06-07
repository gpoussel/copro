// 🎮 CodinGame Puzzle - horse-racing-hyperduals
// https://www.codingame.com/training/easy/horse-racing-hyperduals

const n = parseInt(readline())
const horses: [number, number][] = []
for (let i = 0; i < n; i++) {
  const [v, e] = readline().split(" ").map(Number)
  horses.push([v, e])
}

// Sort by V+E (Manhattan distance on the rotated plane)
// For Manhattan distance d(A,B) = |V2-V1| + |E2-E1|,
// after rotating 45 degrees (u = V+E, w = V-E):
// d(A,B) = max(|u2-u1|, |w2-w1|)
// But a simple approach: sort by V, then check neighbors in sorted order.
// For 2D Manhattan distance, the closest pair lies among candidates sorted by V+E.
// We can sort by V+E and check consecutive pairs, then sort by V-E and check consecutive pairs.

let minDist = Infinity

// Sort by V+E
const bySum = [...horses].sort((a, b) => a[0] + a[1] - (b[0] + b[1]))
for (let i = 1; i < bySum.length; i++) {
  const dist = Math.abs(bySum[i][0] - bySum[i - 1][0]) + Math.abs(bySum[i][1] - bySum[i - 1][1])
  if (dist < minDist) minDist = dist
}

// Sort by V-E
const byDiff = [...horses].sort((a, b) => a[0] - a[1] - (b[0] - b[1]))
for (let i = 1; i < byDiff.length; i++) {
  const dist = Math.abs(byDiff[i][0] - byDiff[i - 1][0]) + Math.abs(byDiff[i][1] - byDiff[i - 1][1])
  if (dist < minDist) minDist = dist
}

console.log(minDist + 0)
