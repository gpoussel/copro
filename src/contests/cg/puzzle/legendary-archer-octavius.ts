// 🎮 CodinGame Puzzle - legendary-archer-octavius
// https://www.codingame.com/training/hard/legendary-archer-octavius

// For each launch point / speed the fastest (flat) trajectory time follows
// from R² + (h + g t²/2)² = v² t², a quadratic in t². A plan is a number of
// shots from tower 1 (3 s each), then optionally the zip line (20 s), shots at
// speed 60 (3 s each), and after a milkshake (8 s) shots at speed 80 (2 s).
// Each shot slot has a firing time, and a UFO in a slot is hit at firing
// time + flight time. For every split of counts we find the smallest
// bottleneck completion with a binary search over candidate times and a
// bipartite matching UFO -> slot (pruned by the best answer found so far).
const n = parseInt(readline())
const ufos: number[][] = []
for (let i = 0; i < n; i++) ufos.push(readline().split(" ").map(Number))

const G = 9.8
const flight = (from: number[], v: number, to: number[]): number => {
  const dx = to[0] - from[0]
  const h = to[1] - from[1]
  const dz = to[2] - from[2]
  const r2 = dx * dx + dz * dz + h * h
  if (r2 === 0) return 0
  const a = (G * G) / 4
  const b = G * h - v * v
  const disc = b * b - 4 * a * r2
  if (disc < 0) return Infinity
  const u = (-b - Math.sqrt(disc)) / (2 * a)
  return u > 0 ? Math.sqrt(u) : Infinity
}

const TOWER1 = [0, 80, 0]
const TOWER2 = [200, 20, 0]
// Flight times per phase kind: 0 = tower 1 @60, 1 = tower 2 @60, 2 = tower 2 @80
const flights = [
  ufos.map(u => flight(TOWER1, 60, u)),
  ufos.map(u => flight(TOWER2, 60, u)),
  ufos.map(u => flight(TOWER2, 80, u)),
]

type Slot = { time: number; kind: number }

// Smallest achievable max completion for the given slots, if below `bound`
const solve = (slots: Slot[], bound: number): number => {
  const cost = (i: number, s: number): number => slots[s].time + flights[slots[s].kind][i]
  const feasible = (limit: number): boolean => {
    const owner = new Array<number>(slots.length).fill(-1)
    for (let i = 0; i < n; i++) {
      const seen = new Array<boolean>(slots.length).fill(false)
      const tryAssign = (u: number): boolean => {
        for (let s = 0; s < slots.length; s++) {
          if (seen[s] || !(cost(u, s) <= limit + 1e-9)) continue
          seen[s] = true
          if (owner[s] < 0 || tryAssign(owner[s])) {
            owner[s] = u
            return true
          }
        }
        return false
      }
      if (!tryAssign(i)) return false
    }
    return true
  }
  if (!feasible(bound - 1e-7)) return Infinity
  const candidates: number[] = []
  for (let i = 0; i < n; i++) {
    for (let s = 0; s < slots.length; s++) {
      const c = cost(i, s)
      if (c < bound) candidates.push(c)
    }
  }
  candidates.sort((x, y) => x - y)
  let lo = 0
  let hi = candidates.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (feasible(candidates[mid])) hi = mid
    else lo = mid + 1
  }
  return candidates[lo]
}

const phaseSlots = (start: number, draw: number, count: number, kind: number): Slot[] =>
  Array.from({ length: count }, (_, j) => ({ time: start + (j + 1) * draw, kind }))

// Everything from tower 1
let best = Math.min(1e9, solve(phaseSlots(0, 3, n, 0), 1e9))
for (let a = 0; a <= n; a++) {
  for (let b = 0; a + b <= n; b++) {
    const c = n - a - b
    if (b + c === 0) continue
    const zipEnd = 3 * a + 20
    const slots = [
      ...phaseSlots(0, 3, a, 0),
      ...phaseSlots(zipEnd, 3, b, 1),
      ...phaseSlots(zipEnd + 3 * b + 8, 2, c, 2),
    ]
    best = Math.min(best, solve(slots, best))
  }
}
console.log(best.toFixed(2))
