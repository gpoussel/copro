// 🎮 CodinGame Multiplayer - poker-chip-race
// https://www.codingame.com/multiplayer/bot-programming/poker-chip-race
//
// Chips on an 800×515 frictionless table (walls bounce) absorb anything
// smaller they touch; each push costs 1/15 of the chip's matter (ejected
// backwards at 200 relative speed), so pushes must be rare.
// Per chip, with straight-line predictions (wall bounces included):
// - a bigger object predicted to touch us within 6 turns: push away from
//   it;
// - several chips: the smaller ones steer into our biggest (merging);
// - else, when our drift touches no smaller object within 20 turns, push
//   towards the best one (size / distance); otherwise WAIT.

const myId = parseInt(readline())
const W = 800
const H = 515

interface Entity {
  id: number
  owner: number
  r: number
  x: number
  y: number
  vx: number
  vy: number
}

// Position after t turns (reflect on the walls).
function at(e: Entity, t: number): [number, number] {
  const fold = (p: number, lo: number, hi: number) => {
    const span = hi - lo
    if (span <= 0) return lo
    let q = (p - lo) % (2 * span)
    if (q < 0) q += 2 * span
    return lo + (q > span ? 2 * span - q : q)
  }
  return [fold(e.x + e.vx * t, e.r, W - e.r), fold(e.y + e.vy * t, e.r, H - e.r)]
}
// First turn (≤ horizon) when a and b touch, or Infinity.
function contact(a: Entity, b: Entity, horizon: number): number {
  for (let t = 0; t <= horizon; t++) {
    const [ax, ay] = at(a, t)
    const [bx, by] = at(b, t)
    if (Math.hypot(ax - bx, ay - by) <= a.r + b.r) return t
  }
  return Infinity
}

while (true) {
  const chipCount = parseInt(readline())
  const n = parseInt(readline())
  const all: Entity[] = []
  for (let i = 0; i < n; i++) {
    const [id, owner, r, x, y, vx, vy] = readline().trim().split(" ").map(Number)
    all.push({ id, owner, r, x, y, vx, vy })
  }
  const mine = all.filter(e => e.owner === myId)
  const biggest = mine.reduce((a, b) => (b.r > a.r ? b : a), mine[0])
  const out: string[] = []
  for (const c of mine.slice(0, chipCount)) {
    let order = "WAIT"
    const bigger = all.filter(e => e.id !== c.id && e.owner !== myId && e.r >= c.r)
    let threat: Entity | null = null
    let soonest = Infinity
    for (const e of bigger) {
      const t = contact(c, e, 6)
      if (t < soonest) {
        soonest = t
        threat = e
      }
    }
    if (threat) {
      const [tx, ty] = at(threat, soonest)
      const [cx, cy] = at(c, soonest)
      let dx = cx - tx
      let dy = cy - ty
      const len = Math.hypot(dx, dy) || 1
      dx /= len
      dy /= len
      order = `${(c.x + dx * 100).toFixed(1)} ${(c.y + dy * 100).toFixed(1)}`
    } else if (mine.length > 1 && c !== biggest) {
      if (contact(c, biggest, 15) === Infinity) order = `${biggest.x.toFixed(1)} ${biggest.y.toFixed(1)}`
    } else {
      const prey = all.filter(e => e.id !== c.id && e.owner !== myId && e.r < c.r * 0.9)
      const onCourse = prey.some(e => contact(c, e, 20) < Infinity)
      if (!onCourse) {
        let best: Entity | null = null
        let bestValue = 0
        for (const e of prey) {
          if (bigger.some(o => Math.hypot(o.x - e.x, o.y - e.y) < o.r + c.r + 60)) continue
          const d = Math.max(1, Math.hypot(e.x - c.x, e.y - c.y) - c.r - e.r)
          const value = (e.r * e.r) / (d + 20)
          if (value > bestValue) {
            bestValue = value
            best = e
          }
        }
        if (best) {
          const t = Math.min(15, Math.hypot(best.x - c.x, best.y - c.y) / 40)
          const [px, py] = at(best, t)
          const tx = px - c.vx * t
          const ty = py - c.vy * t
          order = `${tx.toFixed(1)} ${ty.toFixed(1)}`
        }
      }
    }
    out.push(order)
  }
  while (out.length < chipCount) out.push("WAIT")
  console.log(out.join("\n"))
}
