// 🎮 CodinGame Puzzle - windmill-problem
// https://www.codingame.com/training/medium/windmill-problem

const wmK = parseInt(readline())
const wmN = parseInt(readline())
const wmStart = parseInt(readline())
const wmPts: [number, number][] = []
for (let i = 0; i < wmK; i++) {
  const [x, y] = readline().split(" ").map(Number)
  wmPts.push([x, y])
}

const modPi = (a: number) => {
  let r = a % Math.PI
  if (r < 0) r += Math.PI
  return r
}
const lineAngle = (a: number, b: number) =>
  modPi(Math.atan2(wmPts[b][1] - wmPts[a][1], wmPts[b][0] - wmPts[a][0]))

// State: current pivot, previous pivot (-1 at the start) and line angle (mod pi)
let pivot = wmStart
let prevPivot = -1
let theta = 0
let counts: number[] = new Array(wmK).fill(0)
counts[pivot] = 1

const history: { pivot: number; counts: number[] }[] = [{ pivot, counts: counts.slice() }]
const seen: { [state: string]: number } = {}
seen[`${pivot},${prevPivot}`] = 0

let result: { pivot: number; counts: number[] } | null = null
for (let step = 1; step <= wmN; step++) {
  // Rotating clockwise decreases the line angle
  let best = -1
  let bestRot = Infinity
  for (let q = 0; q < wmK; q++) {
    if (q === pivot) continue
    const rot = q === prevPivot ? Math.PI : modPi(theta - lineAngle(pivot, q))
    if (rot < bestRot) {
      bestRot = rot
      best = q
    }
  }
  theta = lineAngle(pivot, best)
  prevPivot = pivot
  pivot = best
  counts = counts.slice()
  counts[pivot]++
  history.push({ pivot, counts })

  const key = `${pivot},${prevPivot}`
  if (seen[key] !== undefined) {
    const s = seen[key]
    const cycle = step - s
    const remaining = wmN - step
    const fullCycles = Math.floor(remaining / cycle)
    const rest = remaining % cycle
    const base = history[s].counts
    const target = history[s + rest].counts
    result = {
      pivot: history[s + rest].pivot,
      counts: counts.map((c, i) => c + fullCycles * (c - base[i]) + (target[i] - base[i])),
    }
    break
  }
  seen[key] = step
}
if (result === null) result = { pivot, counts }

console.log(result.pivot)
for (const c of result.counts) console.log(c)
