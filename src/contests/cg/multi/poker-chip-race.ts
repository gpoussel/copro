// 🎮 CodinGame Multiplayer - poker-chip-race
// https://www.codingame.com/multiplayer/bot-programming/poker-chip-race
//
// Chips on an 800x515 frictionless table absorb anything smaller they touch;
// each acceleration costs 1/15 of the chip's matter (ejected backwards).
// Per chip: flee a bigger enemy chip that is closing in, else go for the
// smaller object with the best size/distance, accelerating only when our
// current heading is off; otherwise WAIT to save matter.

const myId = parseInt(readline())

interface Entity {
  id: number
  owner: number
  r: number
  x: number
  y: number
  vx: number
  vy: number
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
  const out: string[] = []
  for (const c of mine.slice(0, chipCount)) {
    let order = "WAIT"
    // Threat: a bigger enemy chip getting closer.
    const threat = all
      .filter(e => e.owner !== myId && e.r > c.r) // neutral drops eat us too
      .map(e => {
        const dx = e.x - c.x
        const dy = e.y - c.y
        const d = Math.hypot(dx, dy) - e.r - c.r
        const closing = -((e.vx - c.vx) * dx + (e.vy - c.vy) * dy) / (Math.hypot(dx, dy) || 1)
        return { e, d, closing }
      })
      .filter(t => t.d < 25 || (t.closing > 0 && t.d / t.closing < 6))
      .sort((a, b) => a.d - b.d)[0]
    if (threat) {
      order = `${(c.x - (threat.e.x - c.x)).toFixed(1)} ${(c.y - (threat.e.y - c.y)).toFixed(1)}`
    } else {
      // Prey: smaller objects (accelerating shrinks us a bit, keep a margin).
      let best: Entity | null = null
      let bestValue = 0
      for (const e of all) {
        if (e.id === c.id || e.r >= c.r * 0.93 || (e.owner === myId && e.r < c.r * 0.5)) continue
        // Skip prey guarded by something bigger than us.
        if (all.some(o => o.owner !== myId && o.r > c.r && Math.hypot(o.x - e.x, o.y - e.y) < o.r + c.r + 40)) continue
        const d = Math.max(1, Math.hypot(e.x - c.x, e.y - c.y) - c.r)
        const value = (e.r * e.r) / d
        if (value > bestValue) {
          bestValue = value
          best = e
        }
      }
      if (best) {
        const t = Math.hypot(best.x - c.x, best.y - c.y) / Math.max(40, Math.hypot(c.vx, c.vy))
        const tx = best.x + (best.vx - c.vx) * Math.min(t, 10)
        const ty = best.y + (best.vy - c.vy) * Math.min(t, 10)
        const want = Math.atan2(ty - c.y, tx - c.x)
        const speed = Math.hypot(c.vx, c.vy)
        const heading = Math.atan2(c.vy, c.vx)
        const off = Math.abs(((want - heading + 3 * Math.PI) % (2 * Math.PI)) - Math.PI)
        if (speed < 30 || off > 0.3) order = `${tx.toFixed(1)} ${ty.toFixed(1)}`
      }
    }
    out.push(order)
  }
  while (out.length < chipCount) out.push("WAIT")
  console.log(out.join("\n"))
}
