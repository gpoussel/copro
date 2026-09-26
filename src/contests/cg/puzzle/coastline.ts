// 🎮 CodinGame Puzzle - coastline
// https://www.codingame.com/training/medium/coastline

const EPS = 1e-9

// Each islet can be reached from a transmitter anywhere in an x-interval of the coast;
// the minimum number of transmitters is the minimum number of points stabbing all intervals.
function minTransmitters(r: number, points: [number, number][]): number {
  const intervals: [number, number][] = []
  for (const [x, y] of points) {
    if (y > r) return -1
    const d = Math.sqrt(r * r - y * y)
    intervals.push([x - d, x + d])
  }
  intervals.sort((a, b) => a[1] - b[1])
  let count = 0
  let last = -Infinity
  for (const [lo, hi] of intervals) {
    if (lo <= last + EPS) continue
    count++
    last = hi
  }
  return count
}

const n = parseInt(readline())
for (let i = 0; i < n; i++) {
  const [p, r, ...coords] = readline().trim().split(/\s+/).map(Number)
  const points: [number, number][] = []
  for (let j = 0; j < p; j++) points.push([coords[2 * j], coords[2 * j + 1]])
  console.log(minTransmitters(r, points))
}
