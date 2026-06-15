// 🎮 CodinGame Puzzle - 2nd-degree-polynomial---simple-analysis
// https://www.codingame.com/training/easy/2nd-degree-polynomial---simple-analysis

const [a, b, c] = readline()
  .split(" ")
  .map(s => parseFloat(s))

const points: [number, number][] = []

if (a !== 0) {
  const delta = b * b - 4 * a * c
  if (delta === 0) {
    points.push([-b / (2 * a), 0])
  } else if (delta > 0) {
    const r = Math.sqrt(delta)
    points.push([(-b - r) / (2 * a), 0])
    points.push([(-b + r) / (2 * a), 0])
  }
  points.push([0, c])
} else if (b !== 0) {
  points.push([-c / b, 0])
  points.push([0, c])
} else {
  // a = 0, b = 0 -> horizontal line y = c
  points.push([0, c])
}

// Normalize -0 and round to max 2 decimals
const fmt = (n: number): string => {
  const r = Math.round(n * 100) / 100
  const v = r === 0 ? 0 : r
  return String(v)
}

// Sort left-to-right by x, then by y
points.sort((p, q) => p[0] - q[0] || p[1] - q[1])

// Dedup identical points (after rounding-independent equality)
const out: string[] = []
const seen = new Set<string>()
for (const [x, y] of points) {
  const key = `${fmt(x)},${fmt(y)}`
  if (!seen.has(key)) {
    seen.add(key)
    out.push(`(${key})`)
  }
}

console.log(out.join(","))
