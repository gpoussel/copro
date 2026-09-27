// 🎮 CodinGame Multiplayer - bit-runner-2048
// https://www.codingame.com/multiplayer/bot-programming/bit-runner-2048
// Referee: https://github.com/Illedan/Bit-Runner-2048
//
// CSB-like physics: rotate ≤ 18°, v += thrust·dir (≤ 200, mass 1), pos += v,
// v = trunc(0.85·v), positions truncated. Prisoners roll without friction
// and are grabbed within 399 of a car's centre; a carrier scores within
// centreRadius − 1 of the manhole. Two cars each.
// Roles: carriers go home; when a foe carries, the free car closest to its
// path rams it (a strong impact swaps the prisoner); chasers take distinct
// prisoners. Each car searches 6-turn (rotation, thrust) plans by random
// restarts + mutation against its moving target (earliest reach wins) and
// plays the first step as `EXPERT rotation thrust` (collisions ignored).

readline() // map radius
const centreRadius = parseInt(readline())
readline() // min swap impulse
const carCount = parseInt(readline())

type E = { id: number; type: number; x: number; y: number; vx: number; vy: number; angle: number; holds: number }
const DEPTH = 6
const DEG = Math.PI / 180
let firstTurn = true

// Best first move towards a target moving at (tvx, tvy), reached within `radius`.
function plan(car: E, tx: number, ty: number, tvx: number, tvy: number, radius: number, ms: number): [number, number] {
  const deadline = Date.now() + ms
  const rot = new Float64Array(DEPTH)
  const thr = new Float64Array(DEPTH)
  const bestRot = new Float64Array(DEPTH)
  const bestThr = new Float64Array(DEPTH).fill(200)
  // Seed: face the target, full thrust.
  const want = Math.atan2(ty - car.y, tx - car.x) / DEG
  let diff = ((want - car.angle + 540) % 360) - 180
  bestRot[0] = Math.max(-18, Math.min(18, diff))
  const evaluate = (r: Float64Array, t: Float64Array) => {
    let x = car.x
    let y = car.y
    let vx = car.vx
    let vy = car.vy
    let a = car.angle
    for (let k = 0; k < DEPTH; k++) {
      a += r[k]
      vx += Math.cos(a * DEG) * t[k]
      vy += Math.sin(a * DEG) * t[k]
      x += vx
      y += vy
      const px = tx + tvx * (k + 1)
      const py = ty + tvy * (k + 1)
      const d = Math.hypot(px - x, py - y)
      if (d < radius) return 100000 - k * 1000
      vx = Math.trunc(vx * 0.85)
      vy = Math.trunc(vy * 0.85)
      x = Math.trunc(x)
      y = Math.trunc(y)
    }
    const px = tx + tvx * DEPTH
    const py = ty + tvy * DEPTH
    // Not reached: distance, plus a heading bonus towards the target.
    let h = ((Math.atan2(py - y, px - x) / DEG - a + 540) % 360) - 180
    return -Math.hypot(px - x, py - y) - Math.abs(h) * 2
  }
  let bestScore = evaluate(bestRot, bestThr)
  let iter = 0
  while ((iter & 63) !== 0 || Date.now() < deadline) {
    iter++
    if (iter % 3 === 0) {
      for (let k = 0; k < DEPTH; k++) {
        rot[k] = Math.round(Math.random() * 36 - 18)
        thr[k] = Math.random() < 0.7 ? 200 : Math.round(Math.random() * 200)
      }
    } else {
      rot.set(bestRot)
      thr.set(bestThr)
      const k = Math.floor(Math.random() * DEPTH)
      rot[k] = Math.max(-18, Math.min(18, rot[k] + Math.round(Math.random() * 16 - 8)))
      thr[k] = Math.max(0, Math.min(200, thr[k] + Math.round(Math.random() * 100 - 50)))
    }
    const s = evaluate(rot, thr)
    if (s > bestScore) {
      bestScore = s
      bestRot.set(rot)
      bestThr.set(thr)
    }
  }
  void diff
  return [Math.round(bestRot[0]), Math.round(bestThr[0])]
}

while (true) {
  readline() // my score
  readline() // opp score
  readline() // current winner
  const n = parseInt(readline())
  const ents: E[] = []
  for (let i = 0; i < n; i++) {
    const [id, type, x, y, vx, vy, angle, holds] = readline().split(" ").map(Number)
    ents.push({ id, type, x, y, vx, vy, angle, holds })
  }
  const ms = firstTurn ? 300 : 18
  firstTurn = false
  const mine = ents.filter(e => e.type === 0).sort((a, b) => a.id - b.id)
  const foes = ents.filter(e => e.type === 1)
  const prisoners = ents.filter(e => e.type === 2)
  const targets = new Map<number, [number, number, number, number, number]>() // car -> tx ty tvx tvy radius
  for (const c of mine) if (c.holds >= 0) targets.set(c.id, [0, 0, 0, 0, centreRadius - 1])
  const free = mine.filter(c => !targets.has(c.id))
  const carrier = foes.find(f => f.holds >= 0)
  if (carrier && free.length > (prisoners.length ? 1 : 0)) {
    const r = free.sort((a, b) => Math.hypot(a.x - carrier.x, a.y - carrier.y) - Math.hypot(b.x - carrier.x, b.y - carrier.y))[0]
    targets.set(r.id, [carrier.x, carrier.y, carrier.vx, carrier.vy, 500])
  }
  const chasers = mine.filter(c => !targets.has(c.id))
  const pairs: { c: E; p: E; t: number }[] = []
  for (const c of chasers)
    for (const p of prisoners) pairs.push({ c, p, t: Math.hypot(c.x + c.vx * 2 - p.x - p.vx * 3, c.y + c.vy * 2 - p.y - p.vy * 3) })
  pairs.sort((a, b) => a.t - b.t)
  const usedP = new Set<number>()
  for (const { c, p } of pairs) {
    if (targets.has(c.id) || usedP.has(p.id)) continue
    usedP.add(p.id)
    targets.set(c.id, [p.x, p.y, p.vx, p.vy, 399])
  }
  const out: string[] = []
  for (let i = 0; i < carCount; i++) {
    const c = mine[i]
    if (!c) {
      out.push("0 0 0")
      continue
    }
    const t = targets.get(c.id) ?? (prisoners[0] ? [prisoners[0].x, prisoners[0].y, prisoners[0].vx, prisoners[0].vy, 399] : [0, 0, 0, 0, 400])
    const [r, thrust] = plan(c, t[0], t[1], t[2], t[3], t[4], ms)
    out.push(`EXPERT ${r} ${thrust}`)
  }
  console.log(out.join("\n"))
}
