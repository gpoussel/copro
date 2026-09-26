// 🎮 CodinGame Puzzle - escaping-the-cat
// https://www.codingame.com/training/medium/escaping-the-cat

const POOL_RADIUS = 500
const MOUSE_SPEED = 10
const OPPOSITE_TOLERANCE = 0.03
const SAFE_ARC = 88 // arc left to the cat when the mouse reaches the border (chord >= 80)

const catSpeed = Number(readline())
const catAngularSpeed = catSpeed / POOL_RADIUS
// Largest radius where the mouse is angularly faster than the cat
const criticalRadius = (POOL_RADIUS * MOUSE_SPEED) / catSpeed
const outerRadius = Math.min(0.98 * criticalRadius, 400)
const innerRadius = Math.min(0.5 * criticalRadius, 200)

/** Normalizes an angle into (-PI, PI]. */
function wrap(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI
  while (a <= -Math.PI) a += 2 * Math.PI
  return a
}

/** Cat angle after one turn chasing the projection of the mouse at angle `mouse`. */
function nextCatAngle(cat: number, mouse: number): number {
  const d = wrap(mouse - cat)
  if (Math.abs(d) <= catAngularSpeed) return mouse
  return cat + Math.sign(d) * catAngularSpeed
}

let dashing = false
while (true) {
  const [mx, my, cx, cy] = readline().split(" ").map(Number)
  const r = Math.hypot(mx, my)
  const mouseAngle = Math.atan2(my, mx)
  const catAngle = Math.atan2(cy, cx)
  const gap = Math.abs(wrap(mouseAngle - catAngle))

  // Straight dash to the border: arc left between the cat and the exit point
  const dashMargin = gap * POOL_RADIUS - (catSpeed * (POOL_RADIUS - r)) / MOUSE_SPEED
  if (dashing || dashMargin >= SAFE_ARC) {
    dashing = true
    const a = r > 0 ? mouseAngle : 0
    console.log(`${Math.round(Math.cos(a) * 1000)} ${Math.round(Math.sin(a) * 1000)} Run!`)
    continue
  }

  // Otherwise: far from the antipode, swim at a small radius to gain angle on the cat;
  // once opposite to it, swim outwards while staying opposite
  const opposite = gap >= Math.PI - OPPOSITE_TOLERANCE
  let best = -Infinity
  let bestTarget: [number, number] = [0, 0]
  for (let k = 0; k < 720; k++) {
    const dir = (k * Math.PI) / 360
    const nx = mx + Math.cos(dir) * MOUSE_SPEED
    const ny = my + Math.sin(dir) * MOUSE_SPEED
    const nr = Math.hypot(nx, ny)
    if (nr > POOL_RADIUS - 5) continue
    const na = Math.atan2(ny, nx)
    const newCat = nextCatAngle(catAngle, na)
    const newGap = Math.abs(wrap(na - newCat))
    // Never get within reach of the cat
    const catDist = Math.hypot(nx - Math.cos(newCat) * POOL_RADIUS, ny - Math.sin(newCat) * POOL_RADIUS)
    if (catDist < 90) continue
    let score: number
    if (opposite) {
      const stillOpposite = newGap >= Math.PI - OPPOSITE_TOLERANCE
      score = (stillOpposite ? 1e6 : 0) + newGap * POOL_RADIUS * (stillOpposite ? 0 : 1) - Math.abs(nr - outerRadius)
    } else {
      score = -(Math.PI - newGap) * POOL_RADIUS - Math.abs(nr - innerRadius)
    }
    if (score > best) {
      best = score
      bestTarget = [Math.round(mx + Math.cos(dir) * 1000), Math.round(my + Math.sin(dir) * 1000)]
    }
  }
  console.log(`${bestTarget[0]} ${bestTarget[1]} Swimming`)
}
