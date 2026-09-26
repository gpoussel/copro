// 🎮 CodinGame Multiplayer - space-shooter
// https://www.codingame.com/multiplayer/bot-programming/space-shooter
//
// League 1: ships (10 HP, acceleration ≤ 10) and bullets (speed ≤ 100
// relative to the ship, blow up when they stop closing on the nearest enemy,
// 10 damage fading to 0 at 120, hurting everyone). The map edge kills.
// Heuristic: fire whenever ready, aimed at the enemy's predicted position;
// accelerate to keep ~350 from the enemy, away from the walls and from any
// bullet close by.

const W = 1700
const H = 1080
const KEEP = 350

interface Unit {
  id: number
  faction: number
  type: string
  hp: number
  x: number
  y: number
  vx: number
  vy: number
  cd: number
}

const clip = (x: number, y: number, max: number): [number, number] => {
  const n = Math.hypot(x, y)
  return n > max ? [(x / n) * max, (y / n) * max] : [x, y]
}

while (true) {
  const n = parseInt(readline())
  const units: Unit[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    units.push({
      id: parseInt(p[0]),
      faction: parseInt(p[1]),
      type: p[2],
      hp: parseFloat(p[3]),
      x: parseFloat(p[4]),
      y: parseFloat(p[5]),
      vx: parseFloat(p[6]),
      vy: parseFloat(p[7]),
      cd: parseFloat(p[8]),
    })
  }
  const me = units.find(u => u.faction === 1 && u.type[0] === "S")!
  const enemy = units.find(u => u.faction === -1 && u.type[0] === "S")
  const bullets = units.filter(u => u.type[0] === "B")

  // Desired acceleration: a sum of steering forces.
  let ax = 0
  let ay = 0
  // Walls: push back in proportion to how close (and fast) we approach them.
  const nx = me.x + me.vx * 3
  const ny = me.y + me.vy * 3
  const margin = 250
  if (nx < margin) ax += (margin - nx) / 10
  if (nx > W - margin) ax -= (nx - (W - margin)) / 10
  if (ny < margin) ay += (margin - ny) / 10
  if (ny > H - margin) ay -= (ny - (H - margin)) / 10
  // Keep our distance to the enemy.
  if (enemy) {
    const dx = enemy.x - me.x
    const dy = enemy.y - me.y
    const d = Math.hypot(dx, dy) || 1
    const push = (d - KEEP) / 40
    ax += (dx / d) * push
    ay += (dy / d) * push
  }
  // Dodge bullets that are close (ours too).
  for (const b of bullets) {
    const bx = b.x + b.vx
    const by = b.y + b.vy
    const dx = me.x - bx
    const dy = me.y - by
    const d = Math.hypot(dx, dy) || 1
    if (d < 260) {
      ax += ((dx / d) * (260 - d)) / 8
      ay += ((dy / d) * (260 - d)) / 8
    }
  }
  // Damp the speed a little so we stay controllable.
  ax -= me.vx * 0.1
  ay -= me.vy * 0.1
  const [cax, cay] = clip(ax, ay, 10)
  let command = `${me.id} | A ${cax.toFixed(2)} ${cay.toFixed(2)}`

  if (enemy && me.cd <= 0) {
    // Lead the target: where it will be when a 100-speed bullet arrives.
    const d = Math.hypot(enemy.x - me.x, enemy.y - me.y)
    const t = d / 100
    const tx = enemy.x + enemy.vx * t - me.x
    const ty = enemy.y + enemy.vy * t - me.y
    const [fx, fy] = clip(tx * 10, ty * 10, 100)
    // The bullet speed is relative to our ship: remove our own velocity.
    const [rx, ry] = clip(fx - me.vx, fy - me.vy, 100)
    if (d > 180) command += ` | F ${rx.toFixed(2)} ${ry.toFixed(2)}`
  }
  console.log(command)
}
