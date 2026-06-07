// 🎮 CodinGame Optimization - Code vs Zombies
// https://www.codingame.com/training/optim/code-vs-zombies
//
// Ash (you) moves 1000/turn, shoots every zombie within 2000 at end of turn.
// Zombies move 400/turn toward the nearest human (Ash included) and eat a human
// they reach. Turn order: zombies move -> Ash moves -> Ash kills zombies in
// range -> surviving zombies on a human eat it.
//
// Score per killed zombie = (humans still alive)^2 * 10, and the n-th kill in a
// single turn is multiplied by the n-th Fibonacci value (1,2,3,5,8,...). Losing
// every human scores 0 for the test. So keeping humans alive (squared!) dominates;
// multi-kill combos are the secondary lever.
//
// STRATEGY (v1): defend the most-threatened human we can still reach in time
// (move onto it so incoming zombies enter our 2000 kill radius). If no threatened
// human is savable, go to the densest zombie cluster to at least farm kills/combos.

interface P {
  x: number
  y: number
}
const dist = (a: P, b: P): number => Math.hypot(a.x - b.x, a.y - b.y)

const ASH_STEP = 1000
const ZOMBIE_STEP = 400
const KILL_RADIUS = 2000

interface Human extends P {
  id: number
}
interface Zombie extends P {
  id: number
  nx: number
  ny: number
}

// Turns for a zombie at distance d to reach (and eat) a human.
const zombieEta = (d: number): number => Math.ceil(d / ZOMBIE_STEP)
// Turns for Ash at distance d to get within the kill radius of a point.
const ashEta = (d: number): number => Math.max(0, Math.ceil((d - KILL_RADIUS) / ASH_STEP))

for (;;) {
  const line = readline()
  if (line === undefined || line === null) break
  const [ax, ay] = line.split(" ").map(Number)
  const ash: P = { x: ax, y: ay }

  const humanCount = parseInt(readline())
  const humans: Human[] = []
  for (let i = 0; i < humanCount; i++) {
    const [id, hx, hy] = readline().split(" ").map(Number)
    humans.push({ id, x: hx, y: hy })
  }

  const zombieCount = parseInt(readline())
  const zombies: Zombie[] = []
  for (let i = 0; i < zombieCount; i++) {
    const [id, zx, zy, zxn, zyn] = readline().split(" ").map(Number)
    zombies.push({ id, x: zx, y: zy, nx: zxn, ny: zyn })
  }

  // Per human: soonest zombie arrival (zEta) and how fast Ash can defend (aEta).
  const info = humans.map((h) => {
    let nearest = Infinity
    for (const z of zombies) {
      const d = dist(z, h)
      if (d < nearest) nearest = d
    }
    return { h, zEta: zombieEta(nearest), aEta: ashEta(dist(ash, h)) }
  })

  let target: P
  const savable = info.filter((o) => o.aEta < o.zEta)
  if (savable.length > 0) {
    // Defend the most urgent human we can actually reach in time.
    savable.sort((a, b) => a.zEta - b.zEta)
    target = { x: savable[0].h.x, y: savable[0].h.y }
  } else {
    // None strictly savable. If any human is threatened soon, rush to save the
    // closest one (never abandon everyone — losing all humans scores 0).
    const threatened = info.filter((o) => o.zEta <= 15)
    if (threatened.length > 0) {
      threatened.sort((a, b) => a.aEta - b.aEta)
      target = { x: threatened[0].h.x, y: threatened[0].h.y }
    } else {
      // Everyone safe: farm the densest zombie cluster for Fibonacci combos.
      let bestCount = -1
      let best: Zombie = zombies[0]
      for (const z of zombies) {
        let c = 0
        for (const w of zombies) {
          if (Math.hypot(z.nx - w.nx, z.ny - w.ny) <= KILL_RADIUS) c++
        }
        if (c > bestCount) {
          bestCount = c
          best = z
        }
      }
      target = { x: best.nx, y: best.ny }
    }
  }

  console.log(`${Math.round(target.x)} ${Math.round(target.y)}`)
}
