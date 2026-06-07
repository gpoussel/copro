// 🎮 CodinGame Optimization - Code vs Zombies
// https://www.codingame.com/training/optim/code-vs-zombies
//
// Ash moves 1000/turn, shoots every zombie within 2000 at end of turn. Zombies
// move 400/turn toward the nearest human (Ash included) and eat one they reach.
// Turn order: zombies move -> Ash moves -> Ash shoots <=2000 -> surviving zombies
// on a human eat it. Score per kill = aliveHumans^2 * 10 * fib(n) for the n-th
// kill that turn (fib = 1,2,3,5,8,...). Losing every human => 0 for the test.
//
// STRATEGY: per-turn GENETIC SEARCH over Ash's future move-angle sequence,
// evaluated with a faithful internal simulator (the rules are deterministic).
// The population is seeded with a defensive heuristic (so we never score below it)
// and the previous turn's best plan; we evolve until ~TIME_BUDGET_MS, then output
// the first move. This lines up Fibonacci multi-kill combos while keeping humans
// alive — offline it scores ~5x the pure heuristic on the visible cases.
// See code-vs-zombies-tools/ for the offline scorer.

const TIME_BUDGET_MS = 90 // hard turn limit is 100ms; leave margin for slow CG hw
const HORIZON = 40 // planning depth in turns
const POP = 60 // population size
const W = 16000
const H = 9000
const ASH = 1000
const ZS = 400
const KILL = 2000

const fib: number[] = [1, 2]
for (let i = 2; i < 400; i++) fib[i] = fib[i - 1] + fib[i - 2]

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v)
const hyp = (dx: number, dy: number): number => Math.sqrt(dx * dx + dy * dy)

// Current-turn state (flat arrays for a fast eval hot loop).
let ashX = 0
let ashY = 0
let hx: number[] = []
let hy: number[] = []
let zx: number[] = []
let zy: number[] = []

// Simulate following `genome` (one move-angle per turn) from the current state.
// Returns the score, with a big penalty for losing every human and a small bonus
// for survivors (to break ties toward keeping people alive).
function evalGenome(genome: number[]): number {
  const ahx = hx.slice()
  const ahy = hy.slice()
  const azx = zx.slice()
  const azy = zy.slice()
  let nh = ahx.length
  let nz = azx.length
  let ax = ashX
  let ay = ashY
  let score = 0

  for (let t = 0; t < genome.length; t++) {
    if (nz === 0) break
    if (nh === 0) return -1e9

    // 1. zombies move toward nearest human (Ash included), 400 units, floored.
    for (let i = 0; i < nz; i++) {
      let bx = ax
      let by = ay
      let bd = hyp(azx[i] - ax, azy[i] - ay)
      for (let j = 0; j < nh; j++) {
        const d = hyp(azx[i] - ahx[j], azy[i] - ahy[j])
        if (d < bd) {
          bd = d
          bx = ahx[j]
          by = ahy[j]
        }
      }
      if (bd <= ZS) {
        azx[i] = bx
        azy[i] = by
      } else {
        azx[i] = Math.floor(azx[i] + ((bx - azx[i]) / bd) * ZS)
        azy[i] = Math.floor(azy[i] + ((by - azy[i]) / bd) * ZS)
      }
    }

    // 2. Ash moves 1000 along the genome's angle.
    const ang = genome[t]
    const tx = clamp(ax + Math.cos(ang) * ASH, 0, W - 1)
    const ty = clamp(ay + Math.sin(ang) * ASH, 0, H - 1)
    const d = hyp(tx - ax, ty - ay)
    if (d <= ASH || d === 0) {
      ax = Math.floor(tx)
      ay = Math.floor(ty)
    } else {
      ax = Math.floor(ax + ((tx - ax) / d) * ASH)
      ay = Math.floor(ay + ((ty - ay) / d) * ASH)
    }

    // 3. kill zombies within 2000 of Ash; Fibonacci-weighted combo.
    let k = 0
    let w = 0
    for (let i = 0; i < nz; i++) {
      if (hyp(azx[i] - ax, azy[i] - ay) <= KILL) {
        score += nh * nh * 10 * fib[k]
        k++
      } else {
        azx[w] = azx[i]
        azy[w] = azy[i]
        w++
      }
    }
    nz = w

    // 4. surviving zombies standing on a human eat it.
    if (nz > 0) {
      let wh = 0
      for (let j = 0; j < nh; j++) {
        let eaten = false
        for (let i = 0; i < nz; i++) {
          if (azx[i] === ahx[j] && azy[i] === ahy[j]) {
            eaten = true
            break
          }
        }
        if (!eaten) {
          ahx[wh] = ahx[j]
          ahy[wh] = ahy[j]
          wh++
        }
      }
      nh = wh
    }
  }

  if (nh === 0) return -1e9
  return score + nh * nh * 50
}

// Defensive heuristic move from an arbitrary state (used to seed the GA): defend
// the most-urgent savable human; else rush the closest threatened one; else farm
// the densest zombie cluster. Returns a target point.
function heuristicTarget(
  ax: number,
  ay: number,
  ahx: number[],
  ahy: number[],
  nh: number,
  azx: number[],
  azy: number[],
  nz: number,
): { x: number; y: number } {
  let bestSav = -1
  let bestSavEta = Infinity
  let bestThr = -1
  let bestThrA = Infinity
  for (let j = 0; j < nh; j++) {
    let nearest = Infinity
    for (let i = 0; i < nz; i++) {
      const d = hyp(azx[i] - ahx[j], azy[i] - ahy[j])
      if (d < nearest) nearest = d
    }
    const zE = Math.ceil(nearest / ZS)
    const aE = Math.max(0, Math.ceil((hyp(ahx[j] - ax, ahy[j] - ay) - KILL) / ASH))
    if (aE < zE && zE < bestSavEta) {
      bestSavEta = zE
      bestSav = j
    }
    if (zE <= 15 && aE < bestThrA) {
      bestThrA = aE
      bestThr = j
    }
  }
  if (bestSav >= 0) return { x: ahx[bestSav], y: ahy[bestSav] }
  if (bestThr >= 0) return { x: ahx[bestThr], y: ahy[bestThr] }
  // farm densest cluster (current zombie positions)
  let bc = -1
  let best = 0
  for (let i = 0; i < nz; i++) {
    let c = 0
    for (let j = 0; j < nz; j++) if (hyp(azx[i] - azx[j], azy[i] - azy[j]) <= KILL) c++
    if (c > bc) {
      bc = c
      best = i
    }
  }
  return { x: azx[best], y: azy[best] }
}

// Build the heuristic's angle genome by self-simulating it forward.
function heuristicGenome(): number[] {
  const ahx = hx.slice()
  const ahy = hy.slice()
  const azx = zx.slice()
  const azy = zy.slice()
  let nh = ahx.length
  let nz = azx.length
  let ax = ashX
  let ay = ashY
  const g: number[] = []
  for (let t = 0; t < HORIZON; t++) {
    if (nz === 0 || nh === 0) {
      g.push(0)
      continue
    }
    const tgt = heuristicTarget(ax, ay, ahx, ahy, nh, azx, azy, nz)
    g.push(Math.atan2(tgt.y - ay, tgt.x - ax))
    // advance one turn (same rules as evalGenome)
    for (let i = 0; i < nz; i++) {
      let bx = ax
      let by = ay
      let bd = hyp(azx[i] - ax, azy[i] - ay)
      for (let j = 0; j < nh; j++) {
        const d = hyp(azx[i] - ahx[j], azy[i] - ahy[j])
        if (d < bd) {
          bd = d
          bx = ahx[j]
          by = ahy[j]
        }
      }
      if (bd <= ZS) {
        azx[i] = bx
        azy[i] = by
      } else {
        azx[i] = Math.floor(azx[i] + ((bx - azx[i]) / bd) * ZS)
        azy[i] = Math.floor(azy[i] + ((by - azy[i]) / bd) * ZS)
      }
    }
    const dd = hyp(tgt.x - ax, tgt.y - ay)
    if (dd <= ASH || dd === 0) {
      ax = tgt.x
      ay = tgt.y
    } else {
      ax = Math.floor(ax + ((tgt.x - ax) / dd) * ASH)
      ay = Math.floor(ay + ((tgt.y - ay) / dd) * ASH)
    }
    let w = 0
    for (let i = 0; i < nz; i++) {
      if (hyp(azx[i] - ax, azy[i] - ay) > KILL) {
        azx[w] = azx[i]
        azy[w] = azy[i]
        w++
      }
    }
    nz = w
    let wh = 0
    for (let j = 0; j < nh; j++) {
      let eaten = false
      for (let i = 0; i < nz; i++) if (azx[i] === ahx[j] && azy[i] === ahy[j]) { eaten = true; break }
      if (!eaten) { ahx[wh] = ahx[j]; ahy[wh] = ahy[j]; wh++ }
    }
    nh = wh
  }
  return g
}

const TAU = Math.PI * 2
const rand = (): number => Math.random()

let prevBest: number[] | null = null

function plan(): number[] {
  const start = Date.now()
  const seed = heuristicGenome()
  const pop: number[][] = [seed.slice()]
  if (prevBest) {
    const g = prevBest.slice(1)
    while (g.length < HORIZON) g.push(rand() * TAU)
    pop.push(g)
  }
  for (let i = 0; i < 4; i++) {
    const g = seed.slice()
    for (let t = 0; t < HORIZON; t++) if (rand() < 0.3) g[t] = (g[t] + (rand() - 0.5)) % TAU
    pop.push(g)
  }
  while (pop.length < POP) {
    const g: number[] = []
    for (let t = 0; t < HORIZON; t++) g.push(rand() * TAU)
    pop.push(g)
  }

  let best = seed
  let bestScore = evalGenome(seed)

  while (Date.now() - start < TIME_BUDGET_MS) {
    const scored = pop.map((g) => ({ g, s: evalGenome(g) })).sort((a, b) => b.s - a.s)
    if (scored[0].s > bestScore) {
      bestScore = scored[0].s
      best = scored[0].g.slice()
    }
    const eliteN = Math.max(3, POP >> 2)
    const elite = scored.slice(0, eliteN).map((x) => x.g)
    const next: number[][] = elite.map((g) => g.slice())
    next.push(seed.slice())
    while (next.length < POP) {
      const a = elite[(rand() * eliteN) | 0]
      const b = elite[(rand() * eliteN) | 0]
      const c: number[] = []
      for (let t = 0; t < HORIZON; t++) {
        let v = rand() < 0.5 ? a[t] : b[t]
        if (rand() < 0.15) v = rand() * TAU
        else if (rand() < 0.35) v = (v + (rand() - 0.5)) % TAU
        c.push(v)
      }
      next.push(c)
    }
    for (let i = 0; i < POP; i++) pop[i] = next[i]
  }

  return best
}

// game loop
for (;;) {
  const line = readline()
  if (!line) break
  const a = line.split(" ").map(Number)
  ashX = a[0]
  ashY = a[1]

  const humanCount = parseInt(readline())
  hx = []
  hy = []
  for (let i = 0; i < humanCount; i++) {
    const [, hxi, hyi] = readline().split(" ").map(Number)
    hx.push(hxi)
    hy.push(hyi)
  }

  const zombieCount = parseInt(readline())
  zx = []
  zy = []
  for (let i = 0; i < zombieCount; i++) {
    const [, zxi, zyi] = readline().split(" ").map(Number)
    zx.push(zxi)
    zy.push(zyi)
  }

  const best = plan()
  prevBest = best
  const ang = best[0]
  const tx = clamp(Math.round(ashX + Math.cos(ang) * ASH), 0, W - 1)
  const ty = clamp(Math.round(ashY + Math.sin(ang) * ASH), 0, H - 1)
  console.log(`${tx} ${ty} combo`)
}
