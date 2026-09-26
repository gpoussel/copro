// 🎮 CodinGame Puzzle - snooker-ball-collision
// https://www.codingame.com/training/hard/snooker-ball-collision

// With a = -0.8 v, speed decreases linearly with travelled distance
// (dv/ds = -0.8), so a ball launched at speed v travels exactly v / 0.8.
// The moving ball goes straight until it touches the other one (centres
// 2R apart); an equal-mass elastic collision gives the normal component of
// the velocity to the static ball, the tangential one stays. Both then glide.

const RADIUS = 0.03075
const FRICTION = 0.8
// The reference stops a hair before the theoretical end point (ties round back)
const SHORT = 1e-9

const [x0, y0] = readline().split(" ").map(Number)
const [x1, y1] = readline().split(" ").map(Number)
const [vx, vy] = readline().split(" ").map(Number)

const fmt = (v: number): string => String(Math.round(v * 100) / 100 + 0)

let ax = x0
let ay = y0
let bx = x1
let by = y1
const speed = Math.hypot(vx, vy)
if (speed > 0) {
  const dx = vx / speed
  const dy = vy / speed
  const reach = speed / FRICTION
  // Solve |P0 + s d - P1| = 2R for the smallest s >= 0
  const px = x0 - x1
  const py = y0 - y1
  const b = px * dx + py * dy
  const c = px * px + py * py - 4 * RADIUS * RADIUS
  const disc = b * b - c
  let hit = -1
  if (disc >= 0) {
    const s = -b - Math.sqrt(disc)
    if (s >= 0 && s <= reach) hit = s
  }
  if (hit < 0) {
    ax += dx * (reach - SHORT)
    ay += dy * (reach - SHORT)
  } else {
    ax += dx * hit
    ay += dy * hit
    const v = speed - FRICTION * hit
    const wx = dx * v
    const wy = dy * v
    // Line of centres
    const nl = Math.hypot(x1 - ax, y1 - ay)
    const nx = (x1 - ax) / nl
    const ny = (y1 - ay) / nl
    const vn = wx * nx + wy * ny
    const ux = wx - vn * nx
    const uy = wy - vn * ny
    const glide = (w: number): number => Math.max(0, 1 / FRICTION - SHORT / Math.max(w, 1e-12))
    const un = Math.hypot(ux, uy)
    ax += ux * glide(un)
    ay += uy * glide(un)
    bx += vn * nx * glide(Math.abs(vn))
    by += vn * ny * glide(Math.abs(vn))
  }
}
console.log(`${fmt(ax)} ${fmt(ay)}\n${fmt(bx)} ${fmt(by)}`)
