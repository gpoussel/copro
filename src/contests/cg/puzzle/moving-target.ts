// 🎮 CodinGame Puzzle - moving-target
// https://www.codingame.com/training/medium/moving-target

const pe = readline().split(" ").map(Number)
const ve = readline().split(" ").map(Number)
const pg = readline().split(" ").map(Number)
const vp = parseFloat(readline())

const dot = (a: number[], b: number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const d = [0, 1, 2].map(i => pe[i] - pg[i])

// |d + ve * t| = vp * t  =>  (ve.ve - vp^2) t^2 + 2 (d.ve) t + d.d = 0
const a = dot(ve, ve) - vp * vp
const b = 2 * dot(d, ve)
const c = dot(d, d)
const roots: number[] = []
if (Math.abs(a) < 1e-12) {
  if (b !== 0) roots.push(-c / b)
} else {
  const disc = b * b - 4 * a * c
  if (disc >= 0) {
    const sq = Math.sqrt(disc)
    roots.push((-b - sq) / (2 * a), (-b + sq) / (2 * a))
  }
}
const positive = roots.filter(t => t > 1e-12).sort((x, y) => x - y)

const fmt = (x: number): string => {
  const s = x.toFixed(4)
  return s === "-0.0000" ? "0.0000" : s
}

if (positive.length === 0) {
  console.log("Impossible")
} else {
  const t = positive[0]
  const v = [0, 1, 2].map(i => (d[i] + ve[i] * t) / t)
  console.log(v.map(fmt).join(" "))
  console.log(fmt(t))
}
