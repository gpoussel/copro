// 🎮 CodinGame Puzzle - forest-fire
// https://www.codingame.com/training/medium/forest-fire

// Game-loop puzzle: read L and water once, then each turn read the remaining
// fires and output exactly ONE unit to dispatch. The referee removes the covered
// fires and feeds the rest back next turn.
//
// The catch is "least amount of water": this is a min-cost cover problem
// (Canadair 3x3/2100, Helicopter 2x2/1200, Smoke-Jumper 1x1/600). No single
// greedy rule is optimal — maximising coverage overspends on scattered fires,
// while minimising water-per-fire mis-sets up dense clusters. So on the first
// turn we know every fire: we build a full plan with several greedy heuristics,
// keep the cheapest, and then emit it one move per turn.

const UNITS = [
  { code: "C", size: 3, water: 2100 },
  { code: "H", size: 2, water: 1200 },
  { code: "J", size: 1, water: 600 },
]

const L = parseInt(readline())
const totalWater = parseInt(readline())

function coverageAt(fires: Set<string>, ux: number, uy: number, size: number) {
  let c = 0
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      if (fires.has(`${ux + dx};${uy + dy}`)) c++
    }
  }
  return c
}

// Build a full extinguishing plan from a fire set using a per-step scoring rule.
// `gated` restricts big units to "worth it" coverage (C if ≥4 fires, H if ≥2),
// `byRatio` ranks by water-per-fire instead of raw coverage.
interface Candidate {
  code: string
  x: number
  y: number
  cov: number
  water: number
}

function buildPlan(initialFires: Set<string>, gated: boolean, byRatio: boolean) {
  const fires = new Set<string>(initialFires)
  const moves: string[] = []
  let cost = 0

  while (fires.size > 0) {
    let best: Candidate | null = null
    for (const unit of UNITS) {
      const maxPos = L - unit.size
      for (let uy = 0; uy <= maxPos; uy++) {
        for (let ux = 0; ux <= maxPos; ux++) {
          const cov = coverageAt(fires, ux, uy, unit.size)
          if (cov === 0) continue
          if (gated) {
            if (unit.code === "C" && cov < 4) continue
            if (unit.code === "H" && cov < 2) continue
          }
          const cand = { code: unit.code, x: ux, y: uy, cov, water: unit.water }
          if (best === null || better(cand, best, byRatio)) best = cand
        }
      }
    }
    // Fallback: if gating filtered everything, allow a single Smoke-Jumper.
    if (best === null) {
      const any = [...fires][0].split(";").map(Number)
      best = { code: "J", x: any[0], y: any[1], cov: 1, water: 600 }
    }
    const size = best.code === "C" ? 3 : best.code === "H" ? 2 : 1
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) fires.delete(`${best.x + dx};${best.y + dy}`)
    }
    moves.push(`${best.code} ${best.x} ${best.y}`)
    cost += best.water
  }
  return { moves, cost }
}

function better(a: Candidate, b: Candidate, byRatio: boolean) {
  if (byRatio) {
    const ra = a.water / a.cov,
      rb = b.water / b.cov
    if (ra !== rb) return ra < rb
    if (a.cov !== b.cov) return a.cov > b.cov
    return a.water < b.water
  }
  if (a.cov !== b.cov) return a.cov > b.cov
  return a.water < b.water
}

// Collect every initial fire (first turn), then choose the cheapest plan.
const firstN = parseInt(readline())
const initialFires = new Set<string>()
for (let i = 0; i < firstN; i++) {
  const [x, y] = readline().split(/\s+/).map(Number)
  initialFires.add(`${x};${y}`)
}

const candidates = [
  buildPlan(initialFires, false, false), // max coverage
  buildPlan(initialFires, false, true), // min water-per-fire
  buildPlan(initialFires, true, false), // gated max coverage
  buildPlan(initialFires, true, true), // gated min water-per-fire
]
let plan = candidates[0]
for (const c of candidates) {
  if (c.cost < plan.cost || (c.cost === plan.cost && c.moves.length < plan.moves.length)) plan = c
}

// Emit the plan one move per turn. The first turn's fires were already consumed
// above, so output its move immediately, then keep pace with the game loop.
let step = 0
console.log(plan.moves[step++])

while (step < plan.moves.length) {
  const n = parseInt(readline())
  if (isNaN(n)) break
  for (let i = 0; i < n; i++) readline() // remaining fires — already accounted for
  console.log(plan.moves[step++])
}
