// 🎮 CodinGame Puzzle - breakout
// https://www.codingame.com/training/hard/breakout

// Event-driven continuous simulation: at each step find the earliest surface
// the ball reaches (walls, brick faces, paddle top, bottom), move the ball
// there and reflect the matching velocity component(s).
const [bX, bY] = readline().split(" ").map(Number)
const [vX0, vY0] = readline().split(" ").map(Number)
const pN = Number(readline())
const kN = Number(readline())
const paddles: [number, number][] = []
for (let i = 0; i < pN; i++) {
  const [x, y] = readline().split(" ").map(Number)
  paddles.push([x, y])
}
interface Brick {
  x: number
  y: number
  s: number
  p: number
}
const bricks: Brick[] = []
for (let i = 0; i < kN; i++) {
  const [x, y, s, p] = readline().split(" ").map(Number)
  bricks.push({ x, y, s, p })
}

const W = 1600
const H = 2400
const EPS = 1e-9
let x = bX
let y = bY
let vx = vX0
let vy = vY0
let pi = 0
let score = 0

// An event: time, axis flipped ("x" | "y" | "lost"), optional brick / paddle
type Hit = { t: number; axis: "x" | "y" | "lost"; brick?: Brick; paddle?: boolean }

// Time to reach coordinate c from p with speed v (only forward in time)
const timeTo = (p: number, v: number, c: number): number => {
  if (v === 0) return Infinity
  const t = (c - p) / v
  return t > EPS ? t : Infinity
}
const within = (v: number, lo: number, hi: number) => v >= lo - EPS && v <= hi + EPS

for (let iter = 0; iter < 1000000; iter++) {
  const hits: Hit[] = []
  // Walls and bottom
  if (vx < 0) hits.push({ t: timeTo(x, vx, 0), axis: "x" })
  if (vx > 0) hits.push({ t: timeTo(x, vx, W), axis: "x" })
  if (vy < 0) hits.push({ t: timeTo(y, vy, 0), axis: "y" })
  if (vy > 0) hits.push({ t: timeTo(y, vy, H), axis: "lost" })
  // Paddle top
  const [px, py] = paddles[pi]
  if (vy > 0) {
    const t = timeTo(y, vy, py)
    if (t < Infinity && within(x + vx * t, px, px + 200)) hits.push({ t, axis: "y", paddle: true })
  }
  // Brick faces
  for (const b of bricks) {
    if (b.s <= 0) continue
    const fy = vy > 0 ? b.y : b.y + 30
    const ty = timeTo(y, vy, fy)
    if (ty < Infinity && within(x + vx * ty, b.x, b.x + 100)) hits.push({ t: ty, axis: "y", brick: b })
    const fx = vx > 0 ? b.x : b.x + 100
    const tx = timeTo(x, vx, fx)
    if (tx < Infinity && within(y + vy * tx, b.y, b.y + 30)) hits.push({ t: tx, axis: "x", brick: b })
  }
  let tMin = Infinity
  for (const h of hits) tMin = Math.min(tMin, h.t)
  if (tMin === Infinity) break
  const now = hits.filter(h => h.t <= tMin + 1e-7)
  if (now.some(h => h.axis === "lost") && !now.some(h => h.paddle)) break
  x += vx * tMin
  y += vy * tMin
  let flipX = false
  let flipY = false
  const damaged = new Set<Brick>()
  for (const h of now) {
    if (h.axis === "x") flipX = true
    if (h.axis === "y") flipY = true
    if (h.brick) damaged.add(h.brick)
    if (h.paddle && pi < pN - 1) pi++
  }
  for (const b of damaged) {
    b.s--
    if (b.s === 0) score += b.p
  }
  if (flipX) vx = -vx
  if (flipY) vy = -vy
}
console.log(String(score))
