// 🎮 CodinGame Multiplayer - fantastic-bits
// https://www.codingame.com/multiplayer/bot-programming/fantastic-bits
//
// League 1: 2 wizards each; a wizard touching a snaffle grabs it and may
// THROW it next turn (power ≤ 500). Team 0 scores on the right (x = 16000).
// Per wizard: throw at the enemy goal when holding a snaffle, else chase the
// nearest free snaffle (the two wizards take different ones).

const team = parseInt(readline())
const GOAL: [number, number] = team === 0 ? [16000, 3750] : [0, 3750]

while (true) {
  readline() // my score / magic
  readline() // opponent score / magic
  const n = parseInt(readline())
  const wizards: { id: number; x: number; y: number; vx: number; vy: number; state: number }[] = []
  const snaffles: { id: number; x: number; y: number; vx: number; vy: number; state: number }[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    const e = { id: +p[0], x: +p[2], y: +p[3], vx: +p[4], vy: +p[5], state: +p[6] }
    if (p[1] === "WIZARD") wizards.push(e)
    else if (p[1] === "SNAFFLE") snaffles.push(e)
  }
  const free = snaffles.filter(s => s.state === 0)
  const out: string[] = []
  const taken = new Set<number>()
  for (const w of wizards) {
    if (w.state === 1) {
      out.push(`THROW ${GOAL[0]} ${GOAL[1]} 500`)
      continue
    }
    const options = free.filter(s => !taken.has(s.id) || free.length === 1)
    const target = options.sort((a, b) => Math.hypot(a.x - w.x, a.y - w.y) - Math.hypot(b.x - w.x, b.y - w.y))[0]
    if (target) {
      taken.add(target.id)
      // Aim where the snaffle will be, compensating our own momentum.
      out.push(`MOVE ${Math.round(target.x + target.vx - w.vx)} ${Math.round(target.y + target.vy - w.vy)} 150`)
    } else out.push(`MOVE ${GOAL[0] === 0 ? 4000 : 12000} 3750 100`)
  }
  console.log(out.join("\n"))
}
