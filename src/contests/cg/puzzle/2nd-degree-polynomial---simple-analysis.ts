// 🎮 CodinGame Puzzle - 2nd-degree-polynomial---simple-analysis
// https://www.codingame.com/training/easy/2nd-degree-polynomial---simple-analysis

const [a, b, c] = readline().split(" ").map(Number)

function fmt(n: number): string {
  let r = Math.round(n * 100) / 100
  if (r === 0) r = 0
  return r.toString()
}

const pts: { x: number; y: number }[] = []
if (a === 0) {
  if (b !== 0) {
    pts.push({ x: -c / b, y: 0 })
  }
} else {
  const delta = b * b - 4 * a * c
  if (delta === 0) {
    pts.push({ x: -b / (2 * a), y: 0 })
  } else if (delta > 0) {
    const s = Math.sqrt(delta)
    pts.push({ x: (-b - s) / (2 * a), y: 0 })
    pts.push({ x: (-b + s) / (2 * a), y: 0 })
  }
}
pts.push({ x: 0, y: c })

const seen = new Set<string>()
const uniq: { x: number; y: number }[] = []
for (const p of pts) {
  const key = `${p.x}|${p.y}`
  if (!seen.has(key)) {
    seen.add(key)
    uniq.push(p)
  }
}
uniq.sort((p, q) => p.x - q.x)

console.log(uniq.map(p => `(${fmt(p.x)},${fmt(p.y)})`).join(","))
