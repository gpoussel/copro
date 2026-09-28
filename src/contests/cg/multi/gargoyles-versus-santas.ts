// 🎮 CodinGame Multiplayer - gargoyles-versus-santas
// https://www.codingame.com/multiplayer/bot-programming/gargoyles-versus-santas
//
// Presents fall at constant speed (y = 0 is the ground); a gargoyle flying
// ≤ 150 per turn destroys one within 30 at the end of a turn. Each gargoyle
// goes for the present it can intercept soonest (penalised when the enemy
// gets there first) and flies to the interception point.

const perPlayer = parseInt(readline())
const SPEED = 150
const REACH = 30

while (true) {
  readline() // presents left to fall
  readline() // my score
  const mine: [number, number][] = []
  for (let i = 0; i < perPlayer; i++) {
    const [x, y] = readline().split(" ").map(Number)
    mine.push([x, y])
  }
  readline() // foe score
  const foes: [number, number][] = []
  for (let i = 0; i < perPlayer; i++) {
    const [x, y] = readline().split(" ").map(Number)
    foes.push([x, y])
  }
  const n = parseInt(readline())
  const presents: { id: number; value: number; x: number; y: number; vy: number }[] = []
  for (let i = 0; i < n; i++) {
    const [id, value, x, y, vy] = readline().split(" ").map(Number)
    presents.push({ id, value, x, y, vy })
  }
  // Presents fall: y decreases by |vy| per turn.
  const at = (p: (typeof presents)[0], t: number): [number, number] => [p.x, p.y - Math.abs(p.vy) * t]
  const earliest = (gx: number, gy: number, p: (typeof presents)[0]) => {
    for (let t = 1; t <= 20; t++) {
      const [px, py] = at(p, t)
      if (py < 0) return Infinity
      if (Math.hypot(px - gx, py - gy) <= SPEED * t + REACH) return t
    }
    return Infinity
  }
  const taken = new Set<number>()
  const out: string[] = []
  for (const [gx, gy] of mine) {
    let best: (typeof presents)[0] | null = null
    let bestT = Infinity
    let bestScore = -Infinity
    for (const p of presents) {
      if (taken.has(p.id)) continue
      const t = earliest(gx, gy, p)
      if (t === Infinity) continue
      const foeT = Math.min(...foes.map(([fx, fy]) => earliest(fx, fy, p)))
      const score = p.value * 10 - t * 2 - (foeT < t ? 5 : 0)
      if (score > bestScore) {
        bestScore = score
        best = p
        bestT = t
      }
    }
    if (best) {
      taken.add(best.id)
      const [tx, ty] = at(best, bestT)
      out.push(`FLY ${Math.round(tx)} ${Math.round(Math.max(0, ty))}`)
    } else out.push(`FLY 960 600`) // wait high in the middle
  }
  console.log(out.join("\n"))
}
