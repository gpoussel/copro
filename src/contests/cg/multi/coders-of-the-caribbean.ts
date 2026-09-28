// 🎮 CodinGame Multiplayer - coders-of-the-caribbean
// https://www.codingame.com/multiplayer/bot-programming/coders-of-the-caribbean
// Referee: https://github.com/CodinGame/coders-of-the-caribbean
//
// Hex grid 23×21 (odd rows shifted right), ships 3 cells long; rum drops by
// 1 per turn, barrels refill it. Wood 3: one ship, MOVE / SLOWER / WAIT.
// Bot: each ship heads to the barrel with the best rum / hex distance
// (distinct targets); with no barrel left it shadows the enemy ship.
// Wood 2 adds mines and cannons (FIRE = true): fire every other turn at
// the enemy's predicted centre (straight line, flight 1 + d/3) when within
// 10 of our bow and our rum is > 50 (or no barrel is left), unless a
// cannonball is about to land on us; skip barrels next to a mine.

const FIRE = true
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
// Neighbour of an offset (odd-r) cell in orientation d (0 = east, then
// counter-clockwise).
const NEIGH = [
  [
    [1, 0],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
  ],
  [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [0, 1],
    [1, 1],
  ],
]
const neighbour = (p: P, d: number): P => {
  const [dx, dy] = NEIGH[p.y & 1][d]
  return { x: p.x + dx, y: p.y + dy }
}
const lastFire = new Map<number, number>()
let turn = 0

while (true) {
  turn++
  readline() // my ship count
  const n = parseInt(readline())
  const ships: { id: number; x: number; y: number; rot: number; speed: number; rum: number; mine: boolean }[] = []
  const barrels: { x: number; y: number; rum: number }[] = []
  const mines: P[] = []
  const balls: { x: number; y: number; eta: number }[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    const [x, y, a1, a2, a3, a4] = p.slice(2).map(Number)
    if (p[1] === "SHIP") ships.push({ id: +p[0], x, y, rot: a1, speed: a2, rum: a3, mine: a4 === 1 })
    else if (p[1] === "BARREL") barrels.push({ x, y, rum: a1 })
    else if (p[1] === "MINE") mines.push({ x, y })
    else if (p[1] === "CANNONBALL") balls.push({ x, y, eta: a2 })
  }
  const mine = ships.filter(s => s.mine).sort((a, b) => a.id - b.id)
  const enemies = ships.filter(s => !s.mine)
  const taken = new Set<number>()
  const out: string[] = []
  for (const s of mine) {
    const enemy = enemies.sort((a, b) => hexDist(s, a) - hexDist(s, b))[0]
    // Incoming cannonball on our ship soon: keep moving (never fire then).
    const bow = neighbour(s, s.rot)
    const stern = neighbour(s, (s.rot + 3) % 6)
    const threatened = balls.some(b => b.eta <= 2 && [s, bow, stern].some(c => c.x === b.x && c.y === b.y))
    if (FIRE && enemy && !threatened && turn - (lastFire.get(s.id) ?? -9) >= 2 && (s.rum > 50 || !barrels.length)) {
      // Lead the target: its centre after the flight time, moving straight.
      let target: P = { x: enemy.x, y: enemy.y }
      for (let k = 0; k < 3; k++) {
        const eta = 1 + Math.round(hexDist(bow, target) / 3)
        let c: P = { x: enemy.x, y: enemy.y }
        for (let t = 0; t < eta * enemy.speed; t++) c = neighbour(c, enemy.rot)
        target = c
      }
      if (hexDist(bow, target) <= 10 && target.x >= 0 && target.y >= 0 && target.x <= 22 && target.y <= 20) {
        lastFire.set(s.id, turn)
        out.push(`FIRE ${target.x} ${target.y}`)
        continue
      }
    }
    let best = -1
    let bestScore = -Infinity
    barrels.forEach((b, i) => {
      if (taken.has(i) || mines.some(m => hexDist(m, b) <= 1)) return
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
