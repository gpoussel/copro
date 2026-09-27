// 🎮 CodinGame Multiplayer - coders-of-the-caribbean
// https://www.codingame.com/multiplayer/bot-programming/coders-of-the-caribbean
// Referee: https://github.com/CodinGame/coders-of-the-caribbean
//
// Hex grid 23×21 (odd rows shifted right), ships 3 cells long; rum drops by
// 1 per turn, barrels refill it. Wood 3: one ship, MOVE / SLOWER / WAIT.
// Bot: each ship heads to the barrel with the best rum / hex distance
// (distinct targets); with no barrel left it shadows the enemy ship.
// FIRE (later leagues): when FIRE = true, shoot the enemy's predicted
// position every other turn when it is within range 10.

const FIRE = false
type P = { x: number; y: number }
const toCube = (p: P) => {
  const q = p.x - (p.y - (p.y & 1)) / 2
  return [q, p.y, -q - p.y]
}
const hexDist = (a: P, b: P) => {
  const [ax, ay, az] = toCube(a)
  const [bx, by, bz] = toCube(b)
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by), Math.abs(az - bz))
}
const lastFire = new Map<number, number>()
let turn = 0

while (true) {
  turn++
  readline() // my ship count
  const n = parseInt(readline())
  const ships: { id: number; x: number; y: number; rot: number; speed: number; rum: number; mine: boolean }[] = []
  const barrels: { x: number; y: number; rum: number }[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    const [x, y, a1, a2, a3, a4] = p.slice(2).map(Number)
    if (p[1] === "SHIP") ships.push({ id: +p[0], x, y, rot: a1, speed: a2, rum: a3, mine: a4 === 1 })
    else if (p[1] === "BARREL") barrels.push({ x, y, rum: a1 })
  }
  const mine = ships.filter(s => s.mine).sort((a, b) => a.id - b.id)
  const enemies = ships.filter(s => !s.mine)
  const taken = new Set<number>()
  const out: string[] = []
  for (const s of mine) {
    const enemy = enemies.sort((a, b) => hexDist(s, a) - hexDist(s, b))[0]
    if (FIRE && enemy && hexDist(s, enemy) <= 10 && turn - (lastFire.get(s.id) ?? -9) >= 2) {
      lastFire.set(s.id, turn)
      out.push(`FIRE ${enemy.x} ${enemy.y}`)
      continue
    }
    let best = -1
    let bestScore = -Infinity
    barrels.forEach((b, i) => {
      if (taken.has(i)) return
      const score = b.rum / (hexDist(s, b) + 1)
      if (score > bestScore) {
        bestScore = score
        best = i
      }
    })
    if (best >= 0) {
      taken.add(best)
      out.push(`MOVE ${barrels[best].x} ${barrels[best].y}`)
    } else if (enemy) out.push(`MOVE ${enemy.x} ${enemy.y}`)
    else out.push("WAIT")
  }
  console.log(out.join("\n"))
}
