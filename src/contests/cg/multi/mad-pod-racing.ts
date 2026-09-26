// 🎮 CodinGame Multiplayer - mad-pod-racing
// https://www.codingame.com/multiplayer/bot-programming/mad-pod-racing
//
// Gold league: 2 pods each, full checkpoint list, exact speeds and angles.
// Physics (Magus' notes, verified in Silver): rotate by at most 18°, v +=
// thrust·dir, pos += v, v = trunc(0.85·v), pos rounded; BOOST = 650.
// Each pod searches 6-turn (rotation, thrust) plans by random restarts and
// mutation; collisions are not simulated yet. One BOOST, on a long straight.
// (The Silver single-pod bot is in git history.)

const DEPTH = 6
const FIRST_TURN_MS = 400
const TURN_MS = 28 // per pod
const CP_RADIUS = 600
const MAX_ROT = 18
const BOOST_THRUST = 650
const DEG = Math.PI / 180

const laps = parseInt(readline())
const cpCount = parseInt(readline())
const cps: [number, number][] = []
for (let i = 0; i < cpCount; i++) cps.push(readline().split(" ").map(Number) as [number, number])
const totalCps = laps * cpCount

interface Pod {
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  next: number // index of the next checkpoint
  passed: number // checkpoints passed so far (progress)
}

function step(p: Pod, rot: number, thrust: number) {
  p.angle += rot
  const a = p.angle * DEG
  const t = thrust < 0 ? BOOST_THRUST : thrust
  p.vx += Math.cos(a) * t
  p.vy += Math.sin(a) * t
  p.x += p.vx
  p.y += p.vy
  const [cx, cy] = cps[p.next]
  if ((cx - p.x) ** 2 + (cy - p.y) ** 2 < CP_RADIUS * CP_RADIUS) {
    p.passed++
    p.next = (p.next + 1) % cpCount
  }
  p.vx = Math.trunc(p.vx * 0.85)
  p.vy = Math.trunc(p.vy * 0.85)
  p.x = Math.round(p.x)
  p.y = Math.round(p.y)
}

const planRot = new Float64Array(DEPTH)
const planThrust = new Int16Array(DEPTH)
const sim: Pod = { x: 0, y: 0, vx: 0, vy: 0, angle: 0, next: 0, passed: 0 }

function evaluate(start: Pod, boostAllowed: boolean): number {
  Object.assign(sim, start)
  let early = 0
  for (let i = 0; i < DEPTH; i++) {
    const thrust = planThrust[i] < 0 && !(boostAllowed && i === 0) ? 100 : planThrust[i]
    const before = sim.passed
    step(sim, planRot[i], thrust)
    if (sim.passed > before) early += (DEPTH - i) * 300
    if (sim.passed >= totalCps) return 1e9 - i
  }
  const [cx, cy] = cps[sim.next]
  const dist = Math.hypot(cx - sim.x, cy - sim.y)
  // Facing the next checkpoint (and moving towards it) pays later.
  const dir = Math.atan2(cy - sim.y, cx - sim.x) / DEG
  const off = Math.abs(((dir - sim.angle + 540) % 360) - 180)
  return sim.passed * 100000 + early - dist - off * 10
}

let rng = 88172645
const rand = () => {
  rng ^= rng << 13
  rng ^= rng >>> 17
  rng ^= rng << 5
  return (rng >>> 0) / 4294967296
}
const randomRot = () => (rand() < 0.3 ? (rand() < 0.5 ? -MAX_ROT : MAX_ROT) : (rand() * 2 - 1) * MAX_ROT)
const randomThrust = () => (rand() < 0.5 ? 100 : rand() < 0.3 ? 0 : Math.round(rand() * 100))

// Best plans per pod, kept between turns (shifted by one turn).
const bestRot = [new Float64Array(DEPTH), new Float64Array(DEPTH)]
const bestThrust = [new Int16Array(DEPTH).fill(100), new Int16Array(DEPTH).fill(100)]

function search(k: number, pod: Pod, deadline: number, boostAllowed: boolean) {
  const br = bestRot[k]
  const bt = bestThrust[k]
  for (let i = 0; i < DEPTH; i++) {
    planRot[i] = i + 1 < DEPTH ? br[i + 1] : 0
    planThrust[i] = i + 1 < DEPTH ? Math.max(0, bt[i + 1]) : 100
  }
  let bestScore = evaluate(pod, boostAllowed)
  br.set(planRot)
  bt.set(planThrust)
  let iterations = 0
  while (Date.now() < deadline) {
    for (let r = 0; r < 32; r++) {
      iterations++
      if (rand() < 0.2) {
        for (let i = 0; i < DEPTH; i++) {
          planRot[i] = randomRot()
          planThrust[i] = randomThrust()
        }
      } else {
        planRot.set(br)
        planThrust.set(bt)
        const i = Math.floor(rand() * DEPTH)
        if (rand() < 0.5) planRot[i] = randomRot()
        else planThrust[i] = randomThrust()
      }
      if (boostAllowed && rand() < 0.05) planThrust[0] = -1
      const s = evaluate(pod, boostAllowed)
      if (s > bestScore) {
        bestScore = s
        br.set(planRot)
        bt.set(planThrust)
      }
    }
  }
  return iterations
}

let firstTurn = true
let boostUsed = false
const progress = [0, 0] // checkpoints passed by our pods
const lastNext = [1, 1]

while (true) {
  const pods: Pod[] = []
  for (let k = 0; k < 4; k++) {
    const [x, y, vx, vy, angle, next] = readline().split(" ").map(Number)
    pods.push({ x, y, vx, vy, angle, next, passed: 0 })
  }
  const start = Date.now()
  const out: string[] = []
  for (let k = 0; k < 2; k++) {
    const pod = pods[k]
    if (pod.next !== lastNext[k]) {
      progress[k]++
      lastNext[k] = pod.next
    }
    pod.passed = progress[k]
    // First turn: the pod may face anywhere; face the next checkpoint.
    if (firstTurn || pod.angle < 0) {
      const [cx, cy] = cps[pod.next]
      pod.angle = Math.atan2(cy - pod.y, cx - pod.x) / DEG
    }
    const [cx, cy] = cps[pod.next]
    const far = Math.hypot(cx - pod.x, cy - pod.y) > 5000
    const boostAllowed = !boostUsed && !firstTurn && far
    const budget = firstTurn ? FIRST_TURN_MS / 2 : TURN_MS
    search(k, pod, start + budget * (k + 1), boostAllowed)
    const rot = firstTurn ? 0 : bestRot[k][0]
    const target = (pod.angle + rot) * DEG
    const tx = Math.round(pod.x + Math.cos(target) * 10000)
    const ty = Math.round(pod.y + Math.sin(target) * 10000)
    let thrust = String(Math.max(0, bestThrust[k][0]))
    if (bestThrust[k][0] < 0 && boostAllowed) {
      thrust = "BOOST"
      boostUsed = true
    }
    out.push(`${tx} ${ty} ${thrust}`)
  }
  firstTurn = false
  console.log(out.join("\n"))
}
