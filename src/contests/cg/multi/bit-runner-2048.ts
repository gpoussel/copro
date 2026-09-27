// 🎮 CodinGame Multiplayer - bit-runner-2048
// https://www.codingame.com/multiplayer/bot-programming/bit-runner-2048
// Referee: https://github.com/Illedan/Bit-Runner-2048
//
// CSB-like physics (rotate ≤ 18°, thrust ≤ 200, friction 0.85). Two cars:
// a carrier drives to the manhole; a free car chases the free prisoner it
// reaches first (aiming ahead of the prisoner's velocity); when an enemy car
// carries a prisoner, the car closest to its path to the centre rams it (a
// strong collision swaps the prisoner). Targets are corrected by −3·velocity
// to cancel drift, thrust drops when facing away.

readline() // map radius
readline() // centre radius
readline() // min swap impulse
const carCount = parseInt(readline())

type E = { id: number; type: number; x: number; y: number; vx: number; vy: number; angle: number; holds: number }

const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by)

function drive(car: E, tx: number, ty: number, msg: string): string {
  const cx = tx - 3 * car.vx
  const cy = ty - 3 * car.vy
  const want = (Math.atan2(cy - car.y, cx - car.x) * 180) / Math.PI
  let diff = Math.abs(want - car.angle) % 360
  if (diff > 180) diff = 360 - diff
  const thrust = diff > 90 ? 20 : diff > 45 ? 120 : 200
  return `${Math.round(cx)} ${Math.round(cy)} ${thrust} ${msg}`
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
  const mine = ents.filter(e => e.type === 0).sort((a, b) => a.id - b.id)
  const foes = ents.filter(e => e.type === 1)
  const prisoners = ents.filter(e => e.type === 2)
  const orders = new Map<number, string>()
  // Carriers score.
  for (const c of mine) if (c.holds >= 0) orders.set(c.id, drive(c, 0, 0, "home"))
  const free = mine.filter(c => !orders.has(c.id))
  // Rammer: when a foe carries, the free car nearest to its centre path.
  const carrier = foes.find(f => f.holds >= 0)
  if (carrier && free.length > (prisoners.length ? 1 : 0)) {
    const px = carrier.x * 0.5 + carrier.vx * 2
    const py = carrier.y * 0.5 + carrier.vy * 2
    const r = free.sort((a, b) => dist(a.x, a.y, px, py) - dist(b.x, b.y, px, py))[0]
    const tx = carrier.x + carrier.vx * 2
    const ty = carrier.y + carrier.vy * 2
    orders.set(r.id, `${Math.round(tx)} ${Math.round(ty)} 200 ram`)
  }
  // Chasers: pair cars and prisoners by estimated time, best pairs first.
  const chasers = mine.filter(c => !orders.has(c.id))
  const pairs: { c: E; p: E; t: number }[] = []
  for (const c of chasers)
    for (const p of prisoners) {
      const t = dist(c.x + c.vx * 2, c.y + c.vy * 2, p.x + p.vx * 3, p.y + p.vy * 3)
      pairs.push({ c, p, t })
    }
  pairs.sort((a, b) => a.t - b.t)
  const usedP = new Set<number>()
  for (const { c, p, t } of pairs) {
    if (orders.has(c.id) || usedP.has(p.id)) continue
    usedP.add(p.id)
    const k = Math.min(8, t / 400)
    orders.set(c.id, drive(c, p.x + p.vx * k, p.y + p.vy * k, "chase"))
  }
  for (const c of mine) {
    if (orders.has(c.id)) continue
    const p = prisoners[0]
    orders.set(c.id, p ? drive(c, p.x, p.y, "help") : drive(c, 0, 0, "wait"))
  }
  const out: string[] = []
  for (let i = 0; i < carCount; i++) out.push(mine[i] ? orders.get(mine[i].id)! : "0 0 0")
  console.log(out.join("\n"))
}
