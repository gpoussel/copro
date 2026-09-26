// 🎮 CodinGame Puzzle - the-flight-of-birds
// https://www.codingame.com/training/hard/the-flight-of-birds

// Rewind time: reverse every velocity and run an exact event-driven simulation
// for t time units. Events are a bird reaching distance d from a wall (flip the
// matching velocity component) or two approaching birds reaching distance d
// (each bird mirrors its velocity across the line joining them, like a wall).
// If events keep firing without time advancing, nothing can move.

type Bird = { id: number; x: number; y: number; vx: number; vy: number }

const [fbH, fbW] = readline().trim().split(/\s+/).map(Number)
const fbT = parseFloat(readline())
const fbD = parseFloat(readline())
const fbN = parseInt(readline())
const birds: Bird[] = []
for (let i = 0; i < fbN; i++) {
  const [id, x, y, vx, vy] = readline().trim().split(/\s+/).map(Number)
  birds.push({ id, x, y, vx: -vx, vy: -vy })
}

const TOL = 1e-9
let now = 0
let stalled = 0
let stuck = false
while (now < fbT) {
  let best = fbT - now
  let kind = "" // "x" | "y" | "b"
  let ei = -1
  let ej = -1
  const consider = (s: number, k: string, i: number, j: number) => {
    if (s > -TOL && s < best - TOL) {
      best = Math.max(s, 0)
      kind = k
      ei = i
      ej = j
    }
  }
  for (let i = 0; i < fbN; i++) {
    const b = birds[i]
    if (b.vx < 0) consider((fbD - b.x) / b.vx, "x", i, -1)
    if (b.vx > 0) consider((fbW - fbD - b.x) / b.vx, "x", i, -1)
    if (b.vy < 0) consider((fbD - b.y) / b.vy, "y", i, -1)
    if (b.vy > 0) consider((fbH - fbD - b.y) / b.vy, "y", i, -1)
    for (let j = i + 1; j < fbN; j++) {
      const c = birds[j]
      const px = c.x - b.x
      const py = c.y - b.y
      const qx = c.vx - b.vx
      const qy = c.vy - b.vy
      const qa = qx * qx + qy * qy
      const qb = 2 * (px * qx + py * qy)
      if (qb >= 0 || qa === 0) continue // not approaching
      const qc = px * px + py * py - fbD * fbD
      const disc = qb * qb - 4 * qa * qc
      if (disc < 0) continue
      consider((-qb - Math.sqrt(disc)) / (2 * qa), "b", i, j)
    }
  }
  for (const b of birds) {
    b.x += b.vx * best
    b.y += b.vy * best
  }
  now += best
  if (kind === "") break
  if (best > TOL) stalled = 0
  else if (++stalled > 1000) {
    stuck = true
    break
  }
  if (kind === "x") birds[ei].vx *= -1
  else if (kind === "y") birds[ei].vy *= -1
  else {
    const a = birds[ei]
    const c = birds[ej]
    const dist = Math.hypot(c.x - a.x, c.y - a.y)
    const ux = (c.x - a.x) / dist
    const uy = (c.y - a.y) / dist
    for (const b of [a, c]) {
      const p = b.vx * ux + b.vy * uy
      b.vx -= 2 * p * ux
      b.vy -= 2 * p * uy
    }
  }
}

if (stuck) console.log("No movement possible!")
else birds.sort((a, b) => a.id - b.id).forEach(b => console.log(`${b.id} [${Math.round(b.x)},${Math.round(b.y)}]`))
