// 🎮 CodinGame Multiplayer - fantastic-bits
// https://www.codingame.com/multiplayer/bot-programming/fantastic-bits
//
// 2 wizards each; a wizard touching a snaffle grabs it and may THROW it next
// turn (power ≤ 500). Team 0 scores on the right (x = 16000), goal posts at
// y = 1750 / 5750 (radius 300). From Bronze: magic (+1 per turn, ≤ 100) and
// spells applied next turn: PETRIFICUS 10, ACCIO 15, FLIPENDO 20 (pushes the
// target away from the wizard, min(6000 / (d/1000)², 1000) / mass).
// Per wizard, in order:
// - holding: throw at the goal (aim corrected by our velocity, away from
//   the posts);
// - PETRIFICUS a snaffle about to cross our goal line;
// - FLIPENDO a free snaffle whose line from the wizard hits the enemy goal;
// - else chase a snaffle (distinct targets; the second wizard prefers the
//   one closest to our goal).

const team = parseInt(readline())
const GX = team === 0 ? 16000 : 0
const MY_GX = 16000 - GX
const GY = 3750

type E = { id: number; type: string; x: number; y: number; vx: number; vy: number; state: number }
const d2 = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)

// Where the line from (ax, ay) through (bx, by) crosses x = gx (NaN if it
// points away).
function crossY(ax: number, ay: number, bx: number, by: number, gx: number): number {
  if (bx === ax || Math.sign(gx - bx) !== Math.sign(bx - ax)) return NaN
  return by + ((gx - bx) * (by - ay)) / (bx - ax)
}

while (true) {
  let [, magic] = readline().split(" ").map(Number)
  readline() // opponent score / magic
  const n = parseInt(readline())
  const ents: E[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    ents.push({ id: +p[0], type: p[1], x: +p[2], y: +p[3], vx: +p[4], vy: +p[5], state: +p[6] })
  }
  const wizards = ents.filter(e => e.type === "WIZARD").sort((a, b) => a.id - b.id)
  const free = ents.filter(e => e.type === "SNAFFLE" && e.state === 0)
  const out: string[] = []
  const taken = new Set<number>()
  let casted = false

  for (const w of wizards) {
    if (w.state === 1) {
      // Aim inside the posts, cancelling our momentum.
      const ty = Math.max(2300, Math.min(5200, w.y + w.vy * 2))
      out.push(`THROW ${GX - w.vx * 2} ${Math.round(ty - w.vy * 2)} 500`)
      continue
    }
    if (!casted) {
      // Defence: a snaffle crossing our goal line within two turns.
      const danger = free.find(s => {
        const nx = s.x + 2 * s.vx
        const ny = s.y + 2 * s.vy
        return (MY_GX === 0 ? nx < 0 : nx > 16000) && ny > 1900 && ny < 5600
      })
      if (danger && magic >= 10) {
        out.push(`PETRIFICUS ${danger.id}`)
        magic -= 10
        casted = true
        continue
      }
      // Attack: flip a snaffle whose line from us hits the goal.
      if (magic >= 20) {
        let best: E | null = null
        let bestD = Infinity
        for (const s of free) {
          const wx = w.x + w.vx
          const wy = w.y + w.vy
          const sx = s.x + s.vx
          const sy = s.y + s.vy
          const dist = Math.hypot(sx - wx, sy - wy)
          // Full force (1000 / 0.5 per turn for 3 turns) within ~2450.
          if (dist < 400 || dist > 3500) continue
          const y = crossY(wx, wy, sx, sy, GX)
          if (!(y > 2200 && y < 5300)) continue
          if (dist < bestD) {
            bestD = dist
            best = s
          }
        }
        if (best) {
          out.push(`FLIPENDO ${best.id}`)
          magic -= 20
          casted = true
          taken.add(best.id)
          continue
        }
      }
    }
    // Chase: first wizard the nearest snaffle, second the most threatening.
    const options = free.filter(s => !taken.has(s.id) || free.length === 1)
    const key = (s: E) => (out.length === 0 ? d2(s, w) : d2(s, w) + Math.abs(s.x - MY_GX) * 0.7)
    const target = options.sort((a, b) => key(a) - key(b))[0]
    if (target) {
      taken.add(target.id)
      out.push(`MOVE ${Math.round(target.x + target.vx - w.vx)} ${Math.round(target.y + target.vy - w.vy)} 150`)
    } else out.push(`MOVE ${MY_GX === 0 ? 2500 : 13500} ${GY} 150`)
  }
  console.log(out.join("\n"))
}
