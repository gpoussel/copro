// 🎮 CodinGame Multiplayer - mad-pod-racing
// https://www.codingame.com/multiplayer/bot-programming/mad-pod-racing
//
// Silver league (one pod each, SHIELD unlocked). Simulates the pod physics and
// searches 6-turn plans of (rotation, thrust) by random restarts + mutation.
// Physics (Magus' notes): rotate by at most 18 degrees, v += thrust * dir,
// pos += v, v *= 0.85 truncated, pos rounded. BOOST = 650 thrust, once.

const DEPTH = 6
const FIRST_TURN_MS = 800
const TURN_MS = 60
const CP_RADIUS = 600
const MAX_ROT = 18
const BOOST_THRUST = 650
const DEG = Math.PI / 180

// --- Checkpoint learning ----------------------------------------------------

// Checkpoints are only revealed one at a time; the list is complete once the
// first one comes back (end of lap 1).
const cps: [number, number][] = []
let lapKnown = false
let cpIndex = 0 // index in cps of the current next checkpoint
let passed = 0 // checkpoints passed so far

function observeCheckpoint(x: number, y: number) {
  const known = cps.findIndex(([cx, cy]) => cx === x && cy === y)
  if (known < 0) {
    cps.push([x, y])
    if (cps.length > 1) passed++
    cpIndex = cps.length - 1
  } else if (known !== cpIndex) {
    if (known === 0 && cps.length > 1) lapKnown = true
    passed++
    cpIndex = known
  }
}

const cpAfter = (k: number): [number, number] | null =>
  lapKnown ? cps[(cpIndex + k) % cps.length] : k === 0 ? cps[cpIndex] : null

// --- Simulation ---------------------------------------------------------------

interface Pod {
  x: number
  y: number
  vx: number
  vy: number
  angle: number // degrees
  next: number // how many checkpoints ahead of cpIndex the target is
  passed: number
}

// Plan steps: rotation delta in [-18, 18], thrust in [0, 100], or -1 = BOOST.
const planRot = new Float64Array(DEPTH)
const planThrust = new Int16Array(DEPTH)
const bestRot = new Float64Array(DEPTH)
const bestThrust = new Int16Array(DEPTH)

function step(p: Pod, rot: number, thrust: number) {
  p.angle += rot
  const a = p.angle * DEG
  const t = thrust < 0 ? BOOST_THRUST : thrust
  p.vx += Math.cos(a) * t
  p.vy += Math.sin(a) * t
  p.x += p.vx
  p.y += p.vy
  const cp = cpAfter(p.next)
  if (cp) {
    const dx = cp[0] - p.x
    const dy = cp[1] - p.y
    if (dx * dx + dy * dy < CP_RADIUS * CP_RADIUS) {
      p.passed++
      p.next++
    }
  }
  p.vx = Math.trunc(p.vx * 0.85)
  p.vy = Math.trunc(p.vy * 0.85)
  p.x = Math.round(p.x)
  p.y = Math.round(p.y)
}

const simPod: Pod = { x: 0, y: 0, vx: 0, vy: 0, angle: 0, next: 0, passed: 0 }

function evaluate(start: Pod, boostAllowed: boolean): number {
  const p = simPod
  Object.assign(p, start)
  let score = 0
  for (let i = 0; i < DEPTH; i++) {
    const thrust = planThrust[i] < 0 && !(boostAllowed && i === 0) ? 100 : planThrust[i]
    step(p, planRot[i], thrust)
    if (p.passed > start.passed && score === 0) score = (DEPTH - i) * 200 // pass early
  }
  const cp = cpAfter(p.next)
  if (!cp) return p.passed * 100000 + score
  const dist = Math.hypot(cp[0] - p.x, cp[1] - p.y)
  // Heading bonus: facing the next target makes the following turns faster.
  const dir = Math.atan2(cp[1] - p.y, cp[0] - p.x) / DEG
  const off = Math.abs(((dir - p.angle + 540) % 360) - 180)
  return p.passed * 100000 + score - dist - off * 8
}

let rng = 12345
const rand = () => {
  rng ^= rng << 13
  rng ^= rng >>> 17
  rng ^= rng << 5
  return (rng >>> 0) / 4294967296
}
const randomRot = () => (rand() < 0.3 ? (rand() < 0.5 ? -MAX_ROT : MAX_ROT) : (rand() * 2 - 1) * MAX_ROT)
const randomThrust = () => (rand() < 0.5 ? 100 : rand() < 0.3 ? 0 : Math.round(rand() * 100))

function search(pod: Pod, deadline: number, boostAllowed: boolean): number {
  let bestScore = -Infinity
  // Seed with the previous plan shifted by one turn.
  for (let i = 0; i < DEPTH; i++) {
    planRot[i] = i + 1 < DEPTH ? bestRot[i + 1] : 0
    planThrust[i] = i + 1 < DEPTH ? Math.max(0, bestThrust[i + 1]) : 100
  }
  let iterations = 0
  while (Date.now() < deadline) {
    for (let k = 0; k < 32; k++) {
      iterations++
      if (iterations > 1) {
        if (rand() < 0.2) {
          for (let i = 0; i < DEPTH; i++) {
            planRot[i] = randomRot()
            planThrust[i] = randomThrust()
          }
        } else {
          planRot.set(bestRot)
          planThrust.set(bestThrust)
          const i = Math.floor(rand() * DEPTH)
          if (rand() < 0.5) planRot[i] = randomRot()
          else planThrust[i] = randomThrust()
        }
        if (boostAllowed && rand() < 0.05) planThrust[0] = -1
      }
      const s = evaluate(pod, boostAllowed)
      if (s > bestScore) {
        bestScore = s
        bestRot.set(planRot)
        bestThrust.set(planThrust)
      }
    }
  }
  console.error(`it=${iterations} score=${bestScore.toFixed(0)}`)
  return bestScore
}

// --- Game loop ----------------------------------------------------------------

let firstTurn = true
let prevX = 0
let prevY = 0
let boostUsed = false
let predX = 0
let predY = 0

while (true) {
  const [x, y, ncx, ncy, , ncAngle] = readline().split(" ").map(Number)
  readline() // opponent position: ignored so far
  const deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  observeCheckpoint(ncx, ncy)

  // Facing = direction to the checkpoint minus the angle the referee reports.
  const toCp = Math.atan2(ncy - y, ncx - x) / DEG
  const facing = firstTurn ? toCp : toCp - ncAngle
  const vx = firstTurn ? 0 : Math.trunc((x - prevX) * 0.85)
  const vy = firstTurn ? 0 : Math.trunc((y - prevY) * 0.85)
  prevX = x
  prevY = y

  if (!firstTurn) console.error(`pred err ${x - predX} ${y - predY}`)
  const pod: Pod = { x, y, vx, vy, angle: facing, next: 0, passed: 0 }
  // Boost only once the track is known, on a long enough straight.
  const boostAllowed = !boostUsed && lapKnown && !firstTurn
  search(pod, deadline, boostAllowed)

  const rot = firstTurn ? 0 : bestRot[0]
  const target = (facing + rot) * DEG
  const tx = Math.round(x + Math.cos(target) * 10000)
  const ty = Math.round(y + Math.sin(target) * 10000)
  let thrust: string
  if (bestThrust[0] < 0 && boostAllowed) {
    thrust = "BOOST"
    boostUsed = true
  } else {
    thrust = String(Math.max(0, bestThrust[0]))
  }
  const check: Pod = { ...pod }
  step(check, rot, thrust === "BOOST" ? -1 : Number(thrust))
  predX = check.x
  predY = check.y
  firstTurn = false
  console.log(`${tx} ${ty} ${thrust}`)
}
