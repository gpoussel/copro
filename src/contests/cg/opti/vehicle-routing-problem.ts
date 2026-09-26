// 🎮 CodinGame Optimization - vehicle-routing-problem
// https://www.codingame.com/training/optim/vehicle-routing-problem
//
// Capacitated VRP: depot 0, unlimited identical vehicles of capacity c, each
// customer visited once, per-route demand <= c, dist = round(euclid). Output the
// routes (depot omitted) separated by ";". Score = total distance summed over
// the hidden validators (CVRPLib A/M-like instances, n <= 200), lower is better.
//
// Approach: SISR (Slack Induction by String Removals, Christiaens & Vanden
// Berghe 2020) inside simulated annealing, budgeted by wall clock. Ruin = remove
// a few strings (or split strings) from routes spatially adjacent to a random
// seed customer; recreate = greedy cheapest insertion with blinks, customers
// sorted by a random criterion (random / demand / far / close).
const T_START = Date.now()
const TIME_LIMIT = 8500
const CBAR = 10 // average removed customers
const LMAX = 10 // max string length
const SPLIT_BETA = 0.01 // split-string preserved-length parameter
const BLINK = 0.01 // blink rate in recreate
const T0_F = 0.2 // start temperature, as a fraction of mean edge length
const TF_F = 0.002 // final temperature, same unit

let rngState = 0x9e3779b9 | 0
function rnd(): number {
  rngState ^= rngState << 13
  rngState ^= rngState >>> 17
  rngState ^= rngState << 5
  return (rngState >>> 0) / 4294967296
}

const nPts = parseInt(readline())
const capa = parseInt(readline())
const px: number[] = new Array(nPts)
const py: number[] = new Array(nPts)
const dem: number[] = new Array(nPts)
for (let i = 0; i < nPts; i++) {
  const [id, x, y, d] = readline().split(" ").map(Number)
  px[id] = x
  py[id] = y
  dem[id] = d
}
const D = new Int32Array(nPts * nPts)
for (let i = 0; i < nPts; i++)
  for (let j = 0; j < nPts; j++) D[i * nPts + j] = Math.round(Math.sqrt((px[i] - px[j]) ** 2 + (py[i] - py[j]) ** 2))

// neighbour lists of customers (customers only, self first)
const neigh: number[][] = []
for (let i = 0; i < nPts; i++) {
  const l: number[] = []
  for (let j = 1; j < nPts; j++) l.push(j)
  l.sort((a, b) => D[i * nPts + a] - D[i * nPts + b] || (a === i ? -1 : b === i ? 1 : 0))
  neigh.push(l)
}

function routeCost(r: number[]): number {
  let c = 0
  let p = 0
  for (const v of r) {
    c += D[p * nPts + v]
    p = v
  }
  return c + D[p * nPts]
}

type Sol = { routes: number[][]; loads: number[]; cost: number }

function cloneSol(s: Sol): Sol {
  return { routes: s.routes.map(r => r.slice()), loads: s.loads.slice(), cost: s.cost }
}

const routeOf = new Int32Array(nPts)
const stamp = new Int32Array(nPts + 1)
let stampId = 0

// sorting keys for recreate
const keyBuf = new Float64Array(nPts)

function recreate(s: Sol, removed: number[]): void {
  const mode = rnd() * 11
  for (const c of removed) {
    if (mode < 4) keyBuf[c] = rnd()
    else if (mode < 8) keyBuf[c] = -dem[c]
    else if (mode < 10) keyBuf[c] = -D[c]
    else keyBuf[c] = D[c]
  }
  removed.sort((a, b) => keyBuf[a] - keyBuf[b])
  for (const c of removed) {
    let bestR = -1
    let bestP = 0
    let bestD = Infinity
    const dc = c * nPts
    for (let ri = 0; ri < s.routes.length; ri++) {
      if (s.loads[ri] + dem[c] > capa) continue
      const r = s.routes[ri]
      let prev = 0
      for (let p = 0; p <= r.length; p++) {
        const nx = p < r.length ? r[p] : 0
        const delta = D[prev * nPts + c] + D[dc + nx] - D[prev * nPts + nx]
        if (delta < bestD && rnd() >= BLINK) {
          bestD = delta
          bestR = ri
          bestP = p
        }
        prev = nx
      }
    }
    if (bestR < 0) {
      s.routes.push([c])
      s.loads.push(dem[c])
      s.cost += 2 * D[c]
    } else {
      s.routes[bestR].splice(bestP, 0, c)
      s.loads[bestR] += dem[c]
      s.cost += bestD
    }
  }
}

function ruin(s: Sol): number[] {
  const nr = s.routes.length
  for (let ri = 0; ri < nr; ri++) for (const v of s.routes[ri]) routeOf[v] = ri
  const avgCard = (nPts - 1) / nr
  const lsMax = Math.min(LMAX, avgCard)
  const ksMax = (4 * CBAR) / (1 + lsMax) - 1
  const ks = Math.floor(rnd() * ksMax) + 1
  const seed = 1 + Math.floor(rnd() * (nPts - 1))
  const removed: number[] = []
  stampId++
  let done = 0
  for (const c of neigh[seed]) {
    if (done >= ks) break
    const ri = routeOf[c]
    if (ri < 0 || stamp[ri] === stampId) continue
    stamp[ri] = stampId
    done++
    const r = s.routes[ri]
    const len = r.length
    const lMax = Math.min(len, lsMax)
    const l = Math.floor(rnd() * lMax) + 1
    const pos = r.indexOf(c)
    const oldCost = routeCost(r)
    let kept: number[]
    if (l === len || rnd() < 0.5) {
      const lo = Math.max(0, pos - l + 1)
      const hi = Math.min(pos, len - l)
      const st = lo + Math.floor(rnd() * (hi - lo + 1))
      for (let k = st; k < st + l; k++) removed.push(r[k])
      kept = r.slice(0, st).concat(r.slice(st + l))
    } else {
      let m = 1
      while (l + m < len && rnd() > SPLIT_BETA) m++
      const tot = l + m
      const lo = Math.max(0, pos - tot + 1)
      const hi = Math.min(pos, len - tot)
      const st = lo + Math.floor(rnd() * (hi - lo + 1))
      const keepSt = st + Math.floor(rnd() * (l + 1))
      kept = r.slice(0, st)
      for (let k = st; k < st + tot; k++) {
        if (k >= keepSt && k < keepSt + m) kept.push(r[k])
        else removed.push(r[k])
      }
      for (let k = st + tot; k < len; k++) kept.push(r[k])
    }
    for (const v of removed) routeOf[v] = -1
    s.routes[ri] = kept
    let ld = 0
    for (const v of kept) ld += dem[v]
    s.loads[ri] = ld
    s.cost += routeCost(kept) - oldCost
  }
  // drop empty routes
  let w = 0
  for (let ri = 0; ri < s.routes.length; ri++) {
    if (s.routes[ri].length > 0) {
      s.routes[w] = s.routes[ri]
      s.loads[w] = s.loads[ri]
      w++
    }
  }
  s.routes.length = w
  s.loads.length = w
  return removed
}

let cur: Sol = { routes: [], loads: [], cost: 0 }
const all: number[] = []
for (let i = 1; i < nPts; i++) all.push(i)
recreate(cur, all)
let best = cloneSol(cur)

let meanEdge = 0
for (let i = 1; i < nPts; i++) meanEdge += D[i * nPts + neigh[i][1]]
meanEdge = Math.max(1, meanEdge / Math.max(1, nPts - 1))
const T0 = T0_F * meanEdge * 10
const TF = TF_F * meanEdge * 10

let iter = 0
let temp = T0
const tStart = Date.now()
const budget = TIME_LIMIT - (tStart - T_START)
if (nPts > 2) {
  for (;;) {
    if ((iter & 63) === 0) {
      const f = (Date.now() - tStart) / budget
      if (f >= 1) break
      temp = T0 * Math.pow(TF / T0, f)
    }
    iter++
    const s = cloneSol(cur)
    const rem = ruin(s)
    recreate(s, rem)
    if (s.cost < cur.cost - temp * Math.log(rnd() + 1e-12)) {
      cur = s
      if (cur.cost < best.cost) best = cloneSol(cur)
    }
  }
}
console.error(`iters=${iter} cost=${best.cost} routes=${best.routes.length}`)
console.log(best.routes.map(r => r.join(" ")).join(";"))
