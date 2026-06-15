// 🎮 CodinGame Puzzle - lines-intersections
// https://www.codingame.com/

const n: number = parseInt(readline())
const lines: number[][] = []
for (let i = 0; i < n; i++) {
  const [x1, y1, x2, y2] = readline().split(" ").map(Number)
  // Line as a*x + b*y = c
  const a: number = y2 - y1
  const b: number = x1 - x2
  const c: number = a * x1 + b * y1
  lines.push([a, b, c])
}

const fmt = (v: number): string => {
  let r: number = Math.round(v * 1000) / 1000
  if (r === 0) r = 0 // normalize -0
  return r.toFixed(3)
}

const seen: Set<string> = new Set<string>()
const points: [number, number, string][] = []
for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {
    const [a1, b1, c1] = lines[i]
    const [a2, b2, c2] = lines[j]
    const det: number = a1 * b2 - a2 * b1
    if (det === 0) continue
    const x: number = (c1 * b2 - c2 * b1) / det
    const y: number = (a1 * c2 - a2 * c1) / det
    const key: string = fmt(x) + " " + fmt(y)
    if (!seen.has(key)) {
      seen.add(key)
      points.push([x, y, key])
    }
  }
}

points.sort((p, q) => p[0] - q[0] || p[1] - q[1])

const out: string[] = [String(points.length)]
for (const p of points) out.push(p[2])
console.log(out.join("\n"))
