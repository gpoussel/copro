// 🎮 CodinGame Puzzle - mars-lander-episode-2
// https://www.codingame.com/training/medium/mars-lander-episode-2

const GRAVITY = 3.711
const MAX_THRUST = 4
const LANDING_V = -32

const surfaceN = Number(readline())
const ground: [number, number][] = []
for (let i = 0; i < surfaceN; i++) {
  const [x, y] = readline().split(" ").map(Number)
  ground.push([x, y])
}

// Flat landing zone
let flatStart = 0
let flatEnd = 0
let flatY = 0
for (let i = 1; i < surfaceN; i++) {
  if (ground[i][1] === ground[i - 1][1] && ground[i][0] - ground[i - 1][0] >= 1000) {
    flatStart = ground[i - 1][0]
    flatEnd = ground[i][0]
    flatY = ground[i][1]
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// Highest ground altitude over [x1, x2]
function highestGround(x1: number, x2: number): number {
  let best = 0
  for (let i = 1; i < surfaceN; i++) {
    const [ax, ay] = ground[i - 1]
    const [bx, by] = ground[i]
    if (bx < x1 || ax > x2) continue
    const yAt = (x: number) => ay + ((by - ay) * (x - ax)) / (bx - ax)
    best = Math.max(best, yAt(Math.max(ax, x1)), yAt(Math.min(bx, x2)))
  }
  return best
}

while (true) {
  const [X, Y, hSpeed, vSpeed] = readline().split(" ").map(Number)

  const targetX = clamp(X, flatStart + 150, flatEnd - 150)
  const dx = targetX - X
  const overZone = X > flatStart + 50 && X < flatEnd - 50
  const height = Y - flatY

  // Horizontal speed goal: cruise toward the zone, braking early enough (~0.8 m/s²)
  const desiredH = Math.sign(dx) * Math.min(50, Math.sqrt(2 * 0.8 * Math.abs(dx)))

  // Vertical speed goal: the lander can barely slow down a fall (0.29 m/s² at best),
  // so only descend as fast as it can stop above the obstacles on the way to the zone
  const safeAltitude = highestGround(Math.min(X, targetX) - 100, Math.max(X, targetX) + 100) + 150
  const settled = overZone && Math.abs(hSpeed) <= 10
  let desiredV: number
  if (settled) desiredV = LANDING_V
  else if (Y > safeAltitude) desiredV = Math.max(LANDING_V + 4, -Math.sqrt(2 * 0.25 * (Y - safeAltitude)))
  else desiredV = Math.min(10, (safeAltitude - Y) / 20)

  // Ground reached within the next few seconds: vertical control gets full priority.
  // Otherwise never spend more than the hover thrust vertically, to keep some braking power.
  const ahead = X + hSpeed * 10
  const danger = Y < highestGround(Math.min(X, ahead) - 150, Math.max(X, ahead) + 150) + 150
  const maxAccY = danger || settled ? MAX_THRUST : GRAVITY
  const accY = clamp(GRAVITY + 0.5 * (desiredV - vSpeed), 0, maxAccY)
  const maxAccX = Math.sqrt(MAX_THRUST * MAX_THRUST - accY * accY)
  let accX = clamp(0.4 * (desiredH - hSpeed), -maxAccX, maxAccX)
  // Stay upright once the horizontal speed is safe above the zone, or when about to touch down
  if (settled || (overZone && height < 100)) accX = 0

  const thrust = Math.sqrt(accX * accX + accY * accY)
  const angle = thrust === 0 ? 0 : Math.round((Math.atan2(-accX, accY) * 180) / Math.PI)
  const power = clamp(Math.round(thrust), 0, MAX_THRUST)
  console.log(`${angle} ${power}`)
}
