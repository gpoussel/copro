// 🎮 CodinGame Puzzle - flood-the-world
// https://www.codingame.com/training/expert/flood-the-world

// Event-driven simulation of the water. The relief is split by its local
// maxima ("rims") into pits; both ends of the map fall into the abyss (sinks).
// Each step routes the portal flow: a pit below its spill level accumulates,
// a full pit overflows over its lower rim (half/half on ties). We jump to the
// next moment a pit reaches its spill level, merge full neighbouring pits, and
// record for each town the moment the water level at its x rises above it.

const EPS = 1e-9
const nPts = parseInt(readline())
const px: number[] = []
const py: number[] = []
for (let i = 0; i < nPts; i++) {
  const [x, y] = readline().split(" ").map(Number)
  if (px.length && px[px.length - 1] === x) {
    py[py.length - 1] = y
    continue
  }
  px.push(x)
  py.push(y)
}
const xPortal = parseInt(readline())
const townCount = parseInt(readline())
const townX: number[] = []
const townY: number[] = []
const townName: string[] = []
const heightAt = (x: number): number => {
  for (let i = 0; i + 1 < px.length; i++) {
    if (x >= px[i] && x <= px[i + 1]) {
      return py[i] + ((py[i + 1] - py[i]) * (x - px[i])) / (px[i + 1] - px[i])
    }
  }
  return x < px[0] ? py[0] : py[py.length - 1]
}
for (let i = 0; i < townCount; i++) {
  const [x, nm] = readline().split(" ")
  townX.push(Number(x))
  townY.push(heightAt(Number(x)))
  townName.push(nm)
}

// Rims: maximal runs of equal height whose both neighbours are lower (abyss beyond the ends)
interface Rim {
  fx: number
  lx: number
  h: number
}
const rims: Rim[] = []
for (let i = 0; i < px.length; ) {
  let j = i
  while (j + 1 < px.length && py[j + 1] === py[i]) j++
  const lh = i > 0 ? py[i - 1] : -Infinity
  const rh = j + 1 < px.length ? py[j + 1] : -Infinity
  if (lh < py[i] && rh < py[i]) rims.push({ fx: px[i], lx: px[j], h: py[i] })
  i = j + 1
}

interface Pool {
  xl: number
  xr: number
  level: number
  sink: boolean
  hl: number // height of left rim
  hr: number // height of right rim
}
const volume = (p: Pool, lv: number): number => {
  let v = 0
  for (let i = 0; i + 1 < px.length; i++) {
    const x1 = px[i]
    const x2 = px[i + 1]
    if (x1 < p.xl || x2 > p.xr) continue
    const lo = Math.min(py[i], py[i + 1])
    const hi = Math.max(py[i], py[i + 1])
    if (lv <= lo) continue
    if (lv >= hi) v += (x2 - x1) * (lv - (py[i] + py[i + 1]) / 2)
    else v += (((lv - lo) / (hi - lo)) * (x2 - x1) * (lv - lo)) / 2
  }
  return v
}

const pools: Pool[] = []
if (rims.length) {
  pools.push({ xl: -Infinity, xr: rims[0].fx, level: -Infinity, sink: true, hl: -Infinity, hr: rims[0].h })
  for (let i = 0; i + 1 < rims.length; i++) {
    const p: Pool = { xl: rims[i].lx, xr: rims[i + 1].fx, level: 0, sink: false, hl: rims[i].h, hr: rims[i + 1].h }
    let bottom = Infinity
    for (let k = 0; k < px.length; k++) if (px[k] >= p.xl && px[k] <= p.xr) bottom = Math.min(bottom, py[k])
    p.level = bottom
    pools.push(p)
  }
  const last = rims[rims.length - 1]
  pools.push({ xl: last.lx, xr: Infinity, level: -Infinity, sink: true, hl: last.h, hr: -Infinity })
}

const floodTime: number[] = new Array(townCount).fill(Infinity)
let now = 0
for (let iter = 0; iter < 100000 && pools.length; iter++) {
  // merge full neighbours
  for (let i = 0; i + 1 < pools.length; ) {
    const a = pools[i]
    const b = pools[i + 1]
    const h = a.hr
    if (!a.sink && !b.sink && a.level >= h - EPS && b.level >= h - EPS) {
      pools.splice(i, 2, { xl: a.xl, xr: b.xr, level: h, sink: false, hl: a.hl, hr: b.hr })
    } else i++
  }
  // route the flow
  const rate: number[] = new Array(pools.length).fill(0)
  const deliver = (i: number, r: number, from: number): void => {
    const p = pools[i]
    if (p.sink) return
    const spill = Math.min(p.hl, p.hr)
    if (p.level < spill - EPS) {
      rate[i] += r
      return
    }
    // on a tie the full pool is a flat surface: the water keeps its direction
    // (or splits evenly when it comes straight from the portal)
    let goL = p.hl <= p.hr + EPS
    let goR = p.hr <= p.hl + EPS
    if (goL && goR && from >= 0) {
      goL = from > i
      goR = from < i
    }
    if (goL && goR) {
      deliver(i - 1, r / 2, i)
      deliver(i + 1, r / 2, i)
    } else if (goL) deliver(i - 1, r, i)
    else if (goR) deliver(i + 1, r, i)
  }
  let placed = false
  for (let i = 0; i < pools.length && !placed; i++) {
    if (xPortal > pools[i].xl && xPortal < pools[i].xr) {
      deliver(i, 1, -1)
      placed = true
    }
  }
  if (!placed) {
    for (let i = 0; i + 1 < pools.length && !placed; i++) {
      if (xPortal >= pools[i].xr && xPortal <= pools[i + 1].xl) {
        deliver(i, 0.5, i + 1)
        deliver(i + 1, 0.5, i)
        placed = true
      }
    }
  }
  // next event: a pool reaching its spill level
  let dt = Infinity
  let who = -1
  pools.forEach((p, i) => {
    if (rate[i] <= 0) return
    const d = (volume(p, Math.min(p.hl, p.hr)) - volume(p, p.level)) / rate[i]
    if (d < dt) {
      dt = d
      who = i
    }
  })
  if (who < 0) break
  pools.forEach((p, i) => {
    const r = rate[i]
    if (r <= 0) return
    const spill = Math.min(p.hl, p.hr)
    const v0 = volume(p, p.level)
    let newLevel = spill
    if (i !== who) {
      const target = v0 + r * dt
      let lo = p.level
      let hi = spill
      for (let k = 0; k < 100; k++) {
        const mid = (lo + hi) / 2
        if (volume(p, mid) < target) lo = mid
        else hi = mid
      }
      newLevel = (lo + hi) / 2
    }
    for (let t = 0; t < townCount; t++) {
      if (floodTime[t] < Infinity || townX[t] < p.xl || townX[t] > p.xr) continue
      if (townY[t] >= p.level - EPS && townY[t] < newLevel - EPS) {
        floodTime[t] = now + (volume(p, Math.max(townY[t], p.level)) - v0) / r
      }
    }
    p.level = newLevel
  })
  now += dt
}

let best = 0
for (let t = 1; t < townCount; t++) if (floodTime[t] > floodTime[best]) best = t
console.log(townName[best])
