// 🎮 CodinGame Puzzle - connect-the-hyper-dots
// https://www.codingame.com/training/medium/connect-the-hyper-dots

const [count, n] = readline().split(" ").map(Number)
const labels: string[] = []
const points: number[][] = []
for (let i = 0; i < count; i++) {
  const parts = readline().trim().split(/\s+/)
  labels.push(parts[0])
  points.push(parts.slice(1).map(Number))
}

const dist2 = (a: number[], b: number[]) => {
  let s = 0
  for (let k = 0; k < n; k++) s += (a[k] - b[k]) ** 2
  return s
}

const used: boolean[] = new Array(count).fill(false)
// Last non-zero sign seen on each axis (0 = none yet)
const orthant: number[] = new Array(n).fill(0)
let current: number[] = new Array(n).fill(0)
let phrase = ""
for (let step = 0; step < count; step++) {
  let best = -1
  for (let i = 0; i < count; i++) {
    if (used[i]) continue
    if (best < 0 || dist2(current, points[i]) < dist2(current, points[best])) best = i
  }
  used[best] = true
  const p = points[best]
  let crossed = false
  for (let k = 0; k < n; k++) {
    const s = Math.sign(p[k])
    if (s === 0) continue
    if (orthant[k] !== 0 && orthant[k] !== s) crossed = true
    orthant[k] = s
  }
  if (crossed) phrase += " "
  phrase += labels[best]
  current = p
}
console.log(phrase)
