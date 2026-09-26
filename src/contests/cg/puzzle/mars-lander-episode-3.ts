// 🎮 CodinGame Puzzle - mars-lander-episode-3
// https://www.codingame.com/training/expert/mars-lander-episode-3

// Rolling genetic algorithm over a faithful simulator of the lander.
// - A chromosome is a list of (delta angle, delta power) genes, one per turn.
// - Crashes are scored by an obstacle-aware distance to the landing zone,
//   precomputed once with Dijkstra on a coarse grid of the free air (so the
//   caves are handled: the path over / around the rock is what counts).
// - Hitting the flat zone is scored by how close speed/angle are to the limits.
// - When the lander is a few turns above the zone, the angle is forced to 0 in
//   both the simulation and the real control so a landing is always vertical.
// Each turn keeps evolving the population (shifted by one gene) for ~85 ms.
const GRAVITY = 3.711
const MAP_W = 7000
const MAP_H = 3000

const surfaceCount = parseInt(readline())
const sx: number[] = []
const sy: number[] = []
for (let i = 0; i < surfaceCount; i++) {
  const [x, y] = readline().split(" ").map(Number)
  sx.push(x)
  sy.push(y)
}
let zoneL = 0
let zoneR = 0
let zoneY = 0
for (let i = 0; i + 1 < surfaceCount; i++) {
  if (sy[i] === sy[i + 1] && Math.abs(sx[i + 1] - sx[i]) >= 1000) {
    zoneL = Math.min(sx[i], sx[i + 1])
    zoneR = Math.max(sx[i], sx[i + 1])
    zoneY = sy[i]
  }
}

// free air = even number of surface crossings on the vertical ray going up
const isFree = (x: number, y: number): boolean => {
  let crossings = 0
  for (let i = 0; i + 1 < surfaceCount; i++) {
    const x1 = sx[i]
    const x2 = sx[i + 1]
    if (x1 > x !== x2 > x) {
      const yy = sy[i] + ((sy[i + 1] - sy[i]) * (x - x1)) / (x2 - x1)
      if (yy > y) crossings++
    }
  }
  return crossings % 2 === 0
}

// obstacle-aware distance field (Dijkstra, 8-neighbourhood) from the zone
const CELL = 50
const GW = MAP_W / CELL
const GH = MAP_H / CELL
const field = new Float64Array(GW * GH).fill(Infinity)
{
  const free = new Uint8Array(GW * GH)
  for (let gx = 0; gx < GW; gx++)
    for (let gy = 0; gy < GH; gy++) free[gy * GW + gx] = isFree(gx * CELL + CELL / 2, gy * CELL + CELL / 2) ? 1 : 0
  const heap: [number, number][] = []
  const push = (d: number, c: number): void => {
    heap.push([d, c])
    let i = heap.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (heap[p][0] <= heap[i][0]) break
      ;[heap[p], heap[i]] = [heap[i], heap[p]]
      i = p
    }
  }
  const pop = (): [number, number] => {
    const top = heap[0]
    const last = heap.pop()!
    if (heap.length) {
      heap[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r
        if (m === i) break
        ;[heap[m], heap[i]] = [heap[i], heap[m]]
        i = m
      }
    }
    return top
  }
  for (let gx = 0; gx < GW; gx++) {
    const cx = gx * CELL + CELL / 2
    if (cx < zoneL + 100 || cx > zoneR - 100) continue
    for (let gy = 0; gy < GH; gy++) {
      const cy = gy * CELL + CELL / 2
      if (cy > zoneY && cy < zoneY + 150 && free[gy * GW + gx]) {
        field[gy * GW + gx] = 0
        push(0, gy * GW + gx)
      }
    }
  }
  while (heap.length) {
    const [d, c] = pop()
    if (d > field[c]) continue
    const gx = c % GW
    const gy = (c - gx) / GW
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) {
        const nx = gx + dx
        const ny = gy + dy
        if ((dx === 0 && dy === 0) || nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue
        const nc = ny * GW + nx
        if (!free[nc]) continue
        const nd = d + (dx && dy ? Math.SQRT2 : 1) * CELL
        if (nd < field[nc]) {
          field[nc] = nd
          push(nd, nc)
        }
      }
  }
}
const distanceAt = (x: number, y: number): number => {
  const gx = Math.min(GW - 1, Math.max(0, Math.floor(x / CELL)))
  const gy = Math.min(GH - 1, Math.max(0, Math.floor(y / CELL)))
  let best = Infinity
  // look at the 3x3 block so that points hugging the rock still get a value
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      const nx = gx + dx
      const ny = gy + dy
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue
      const d = field[ny * GW + nx]
      if (d === Infinity) continue
      const cand = d + Math.hypot(x - (nx * CELL + CELL / 2), y - (ny * CELL + CELL / 2))
      if (cand < best) best = cand
    }
  return best === Infinity ? 20000 : best
}

// segment (ax,ay)-(bx,by) against surface; returns index of hit segment or -1
const hitSurface = (ax: number, ay: number, bx: number, by: number): number => {
  const minX = Math.min(ax, bx)
  const maxX = Math.max(ax, bx)
  for (let i = 0; i + 1 < surfaceCount; i++) {
    const x1 = sx[i]
    const y1 = sy[i]
    const x2 = sx[i + 1]
    const y2 = sy[i + 1]
    if (Math.max(x1, x2) < minX || Math.min(x1, x2) > maxX) continue
    const d1 = (bx - ax) * (y1 - ay) - (by - ay) * (x1 - ax)
    const d2 = (bx - ax) * (y2 - ay) - (by - ay) * (x2 - ax)
    if (d1 > 0 === d2 > 0 && d1 !== 0 && d2 !== 0) continue
    const d3 = (x2 - x1) * (ay - y1) - (y2 - y1) * (ax - x1)
    const d4 = (x2 - x1) * (by - y1) - (y2 - y1) * (bx - x1)
    if (d3 > 0 === d4 > 0 && d3 !== 0 && d4 !== 0) continue
    return i
  }
  return -1
}

type Lander = { x: number; y: number; vx: number; vy: number; fuel: number; angle: number; power: number }

const GENES = 300
const SIN = new Float64Array(181)
const COS = new Float64Array(181)
for (let a = -90; a <= 90; a++) {
  SIN[a + 90] = Math.sin((a * Math.PI) / 180)
  COS[a + 90] = Math.cos((a * Math.PI) / 180)
}

// requested (angle, power) for a gene, applied identically in simulation and for real
const decide = (s: Lander, dA: number, dP: number): [number, number] => {
  let angle = Math.max(-90, Math.min(90, s.angle + Math.round(dA)))
  const power = Math.max(0, Math.min(4, s.power + Math.round(dP)))
  if (s.x > zoneL && s.x < zoneR && s.y - zoneY < Math.max(0, -s.vy) * 4 + 40) angle = 0
  return [angle, power]
}
// one physics step, mutating s; the requested values are clamped like the referee does
const step = (s: Lander, reqA: number, reqP: number): void => {
  s.angle += Math.max(-15, Math.min(15, reqA - s.angle))
  s.power += Math.max(-1, Math.min(1, reqP - s.power))
  if (s.power > s.fuel) s.power = s.fuel
  s.fuel -= s.power
  const ax = -s.power * SIN[s.angle + 90]
  const ay = s.power * COS[s.angle + 90] - GRAVITY
  s.x += s.vx + 0.5 * ax
  s.y += s.vy + 0.5 * ay
  s.vx += ax
  s.vy += ay
}

// full rollout score (higher is better)
const evaluate = (start: Lander, da: Float64Array, dp: Float64Array): number => {
  const s: Lander = { ...start }
  for (let t = 0; t < GENES; t++) {
    const [ra, rp] = decide(s, da[t], dp[t])
    const px = s.x
    const py = s.y
    step(s, ra, rp)
    if (s.x < 0 || s.x >= MAP_W || s.y < 0 || s.y >= MAP_H) return -30000 - distanceAt(px, py)
    const hit = hitSurface(px, py, s.x, s.y)
    if (hit < 0) continue
    const onZone = sy[hit] === sy[hit + 1] && sy[hit] === zoneY && s.x >= zoneL && s.x <= zoneR
    if (!onZone) return -distanceAt(px, py) - 0.5 * Math.hypot(s.vx, s.vy)
    const ex = Math.max(0, Math.abs(s.vx) - 17)
    const ey = Math.max(0, -s.vy - 37)
    const edge = Math.max(0, zoneL + 30 - s.x, s.x - (zoneR - 30))
    if (ex === 0 && ey === 0 && edge === 0 && s.angle === 0) return 100000 + s.fuel
    return 50000 - 30 * ex - 30 * ey - 10 * Math.abs(s.angle) - edge
  }
  return -distanceAt(s.x, s.y) - 1000
}

const POP = 60
const ELITE = 8
const MUT = 0.02
let popA: Float64Array[] = []
let popP: Float64Array[] = []
const randA = (): number => Math.random() * 30 - 15
const randP = (): number => Math.random() * 3 - 1.5
for (let i = 0; i < POP; i++) {
  const a = new Float64Array(GENES)
  const p = new Float64Array(GENES)
  for (let g = 0; g < GENES; g++) {
    a[g] = randA()
    p[g] = randP()
  }
  popA.push(a)
  popP.push(p)
}

let predicted: Lander | null = null
let firstTurn = true
for (;;) {
  const line = readline()
  if (!line) break
  const t0 = Date.now()
  const [X, Y, HS, VS, F, R, P] = line.split(" ").map(Number)
  let cur: Lander = { x: X, y: Y, vx: HS, vy: VS, fuel: F, angle: R, power: P }
  // keep sub-integer precision when our own prediction agrees with the rounded input
  if (
    predicted &&
    Math.round(predicted.x) === X &&
    Math.round(predicted.y) === Y &&
    Math.round(predicted.vx) === HS &&
    Math.round(predicted.vy) === VS &&
    predicted.angle === R &&
    predicted.power === P
  )
    cur = predicted
  const budget = firstTurn ? 700 : 85
  firstTurn = false
  let scores = popA.map((_, i) => evaluate(cur, popA[i], popP[i]))
  while (Date.now() - t0 < budget) {
    const order = scores.map((_, i) => i).sort((i, j) => scores[j] - scores[i])
    const nextA: Float64Array[] = []
    const nextP: Float64Array[] = []
    const nextS: number[] = []
    for (let e = 0; e < ELITE; e++) {
      nextA.push(popA[order[e]])
      nextP.push(popP[order[e]])
      nextS.push(scores[order[e]])
    }
    const pick = (): number => {
      // tournament of 3 among ranked population
      let b = order[Math.floor(Math.random() * POP)]
      for (let k = 0; k < 2; k++) {
        const c = order[Math.floor(Math.random() * POP)]
        if (scores[c] > scores[b]) b = c
      }
      return b
    }
    while (nextA.length < POP) {
      const m = pick()
      const f = pick()
      const r = Math.random()
      const a = new Float64Array(GENES)
      const p = new Float64Array(GENES)
      for (let g = 0; g < GENES; g++) {
        a[g] = r * popA[m][g] + (1 - r) * popA[f][g]
        p[g] = r * popP[m][g] + (1 - r) * popP[f][g]
        if (Math.random() < MUT) a[g] = randA()
        if (Math.random() < MUT) p[g] = randP()
      }
      nextA.push(a)
      nextP.push(p)
      nextS.push(evaluate(cur, a, p))
    }
    popA = nextA
    popP = nextP
    scores = nextS
  }
  let best = 0
  for (let i = 1; i < POP; i++) if (scores[i] > scores[best]) best = i
  const [ra, rp] = decide(cur, popA[best][0], popP[best][0])
  predicted = { ...cur }
  step(predicted, ra, rp)
  console.log(`${ra} ${rp}`)
  // shift every chromosome by one turn
  for (let i = 0; i < POP; i++) {
    popA[i].copyWithin(0, 1)
    popP[i].copyWithin(0, 1)
    popA[i][GENES - 1] = randA()
    popP[i][GENES - 1] = randP()
  }
}
