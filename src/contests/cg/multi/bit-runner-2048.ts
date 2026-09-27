// 🎮 CodinGame Multiplayer - bit-runner-2048
// https://www.codingame.com/multiplayer/bot-programming/bit-runner-2048
// Referee: https://github.com/Illedan/Bit-Runner-2048
//
// CSB-like physics with continuous collisions: cars (r 400, friction 0.15,
// ≤ 18° turn, thrust ≤ 200) pick up prisoners (r 100, no friction) by
// touching them and score by entering the centre (radius given) while
// carrying; a car-car impulse above minSwapImpulse swaps what they carry.
// Bot: an exact port of the referee's physics (Game.gameLoop, Unit.bounce;
// checked turn by turn against a replay) and an evolutionary search over
// 6-turn plans (EXPERT rotation thrust) for both cars, the enemy cars
// following a simple heuristic (carrier to the centre, others to the
// nearest prisoner or our carrier). Evaluation: goals, then carriers'
// distance to the centre, free cars' distance to prisoners, pressure on
// enemy carriers.

const EPS = 0.00001
const CAR_R = 400
const BALL_R = 100
type Car = {
  id: number
  owner: number // 0 = us, 1 = them
  x: number
  y: number
  vx: number
  vy: number
  a: number // radians
  ball: number // id of the carried prisoner, -1 none
  bx: number // velocity when the collision search started
  by: number
}
type Ball = { id: number; x: number; y: number; vx: number; vy: number; cap: boolean; bx: number; by: number }
type State = { cars: Car[]; balls: Ball[]; score: [number, number]; nextId: number }
type Params = { R: number; CR: number; SW: number }

const truncate = (x: number) => {
  const r = x < 0 ? -Math.round(-x) : Math.round(x)
  if (Math.abs(r - x) < EPS) return r
  return x < 0 ? Math.ceil(x) : Math.floor(x)
}

function clone(s: State): State {
  return {
    cars: s.cars.map(c => ({ ...c })),
    balls: s.balls.map(b => ({ ...b })),
    score: [s.score[0], s.score[1]],
    nextId: s.nextId,
  }
}

// Earliest time (≥ 0, < 1+) two discs reach distance r; -1 none.
function meet(x: number, y: number, vx: number, vy: number, r: number): number {
  // relative position / velocity
  if (Math.sqrt(x * x + y * y) <= r) return 0
  if (vx === 0 && vy === 0) return -1
  const a = vx * vx + vy * vy
  if (a <= 0) return -1
  const b = 2 * (x * vx + y * vy)
  const c = x * x + y * y - r * r
  const d = b * b - 4 * a * c
  if (d < 0) return -1
  const t = (-b - Math.sqrt(d)) / (2 * a)
  return t <= 0 ? -1 : t
}
function border(x: number, y: number, vx: number, vy: number, rad: number, R: number): number {
  if (Math.sqrt(x * x + y * y) + rad >= R) return 0
  if (vx === 0 && vy === 0) return -1
  const a = vx * vx + vy * vy
  if (a <= 0) return -1
  const b = 2 * (x * vx + y * vy)
  const c = x * x + y * y - (R - rad) * (R - rad)
  const d = b * b - 4 * a * c
  if (d <= 0) return -1
  const t = (-b + Math.sqrt(d)) / (2 * a)
  return t <= 0 ? -1 : t
}

// kind: 0 car-border, 1 center-car, 2 ball-car, 3 car-car, 4 ball-border
type Col = { t: number; kind: number; i: number; j: number }

function bounceBorder(u: { x: number; y: number; vx: number; vy: number; bx: number; by: number }, rad: number, minImp: number, R: number) {
  const nn = u.x * u.x + u.y * u.y
  const p = (u.x * u.bx + u.y * u.by) / nn
  let fx = u.x * p
  let fy = u.y * p
  u.vx -= fx
  u.vy -= fy
  const imp = Math.sqrt(fx * fx + fy * fy)
  let k = 1
  if (imp > EPS && imp < minImp) k = minImp / imp
  fx *= k
  fy *= k
  u.vx -= fx
  u.vy -= fy
  const d = Math.sqrt(u.x * u.x + u.y * u.y)
  const diff = d + rad - R
  if (diff >= 0 && d >= EPS) {
    const coef = (diff + EPS) / d
    u.x -= u.x * coef
    u.y -= u.y * coef
  }
}

function bounceCars(a: Car, b: Car, SW: number) {
  const mcoeff = 2 // (1 + 1) / (1 * 1)
  const nx = a.x - b.x
  const ny = a.y - b.y
  const nn = nx * nx + ny * ny
  const dvx = a.bx - b.bx
  const dvy = a.by - b.by
  const p = (nx * dvx + ny * dvy) / (nn * mcoeff)
  let fx = nx * p
  let fy = ny * p
  a.vx -= fx
  a.vy -= fy
  b.vx += fx
  b.vy += fy
  let imp = Math.sqrt(fx * fx + fy * fy)
  if ((a.ball >= 0 || b.ball >= 0) && imp > SW) {
    const t = a.ball
    a.ball = b.ball
    b.ball = t
  }
  let k = 1
  if (imp > EPS && imp < 120) {
    k = 120 / imp
    imp = 120
  }
  fx *= k
  fy *= k
  a.vx -= fx
  a.vy -= fy
  b.vx += fx
  b.vy += fy
  const d = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y))
  const diff = (d - 2 * CAR_R) / 2
  if (diff <= 0 && d >= EPS) {
    // a.moveTo(b, diff - EPS), then b.moveTo(a, diff - EPS) with a moved
    let coef = (diff - EPS) / d
    const ax = a.x + (b.x - a.x) * coef
    const ay = a.y + (b.y - a.y) * coef
    a.x = ax
    a.y = ay
    const d2 = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y))
    if (d2 >= EPS) {
      coef = (diff - EPS) / d2
      b.x += (a.x - b.x) * coef
      b.y += (a.y - b.y) * coef
    }
  }
}

// One turn after the inputs were applied (angles / thrust already added).
function play(s: State, P: Params) {
  let t = 0
  for (let guard = 0; guard < 60 && t < 1; guard++) {
    for (const c of s.cars) {
      c.bx = c.vx
      c.by = c.vy
    }
    for (const b of s.balls) {
      b.bx = b.vx
      b.by = b.vy
    }
    let maxT = 1 - t
    const cols: Col[] = []
    const add = (ct: number, kind: number, i: number, j: number) => {
      if (ct < 0) return
      if (Math.abs(ct - maxT) < EPS) cols.push({ t: ct, kind, i, j })
      else if (ct < maxT) {
        cols.length = 0
        cols.push({ t: ct, kind, i, j })
        maxT = ct
      }
    }
    const n = s.cars.length
    for (let i = 0; i < n; i++) {
      const a = s.cars[i]
      add(border(a.x, a.y, a.vx, a.vy, CAR_R, P.R), 0, i, -1)
      if (a.ball >= 0) add(meet(-a.x, -a.y, -a.vx, -a.vy, P.CR), 1, i, -1)
      if (a.ball < 0)
        for (let k = 0; k < s.balls.length; k++) {
          const b = s.balls[k]
          if (b.cap) continue
          add(meet(b.x - a.x, b.y - a.y, b.vx - a.vx, b.vy - a.vy, CAR_R - 1), 2, k, i)
        }
      for (let j = i + 1; j < n; j++) {
        const b = s.cars[j]
        add(meet(a.x - b.x, a.y - b.y, a.vx - b.vx, a.vy - b.vy, 2 * CAR_R), 3, i, j)
      }
    }
    for (let k = 0; k < s.balls.length; k++) {
      const b = s.balls[k]
      if (b.cap) continue
      add(border(b.x, b.y, b.vx, b.vy, BALL_R, P.R), 4, k, -1)
    }
    if (!cols.length) break
    cols.sort((p, q) => p.t - q.t)
    const dt = cols[0].t
    t += dt
    for (const c of s.cars) {
      c.x += c.vx * dt
      c.y += c.vy * dt
    }
    for (const b of s.balls) {
      b.x += b.vx * dt
      b.y += b.vy * dt
    }
    for (const col of cols) {
      if (col.kind === 0) bounceBorder(s.cars[col.i], CAR_R, 600, P.R)
      else if (col.kind === 4) {
        const b = s.balls[col.i]
        if (!b.cap) bounceBorder(b, BALL_R, 42, P.R)
      } else if (col.kind === 3) bounceCars(s.cars[col.i], s.cars[col.j], P.SW)
      else if (col.kind === 2) {
        const b = s.balls[col.i]
        const c = s.cars[col.j]
        if (b.cap || c.ball >= 0) continue
        b.cap = true
        c.ball = b.id
      } else if (col.kind === 1) {
        const c = s.cars[col.i]
        if (c.ball < 0) continue
        s.score[c.owner]++
        c.ball = -1
        const d = Math.sqrt(c.x * c.x + c.y * c.y)
        let x = 0
        let y = 4000
        if (d > EPS) {
          x = (c.x / d) * 4000
          y = (c.y / d) * 4000
        }
        const nb: Ball = { id: s.nextId++, x, y, vx: 0, vy: 0, cap: false, bx: 0, by: 0 }
        const sp = Math.sqrt(c.bx * c.bx + c.by * c.by)
        if (sp > EPS) {
          nb.vx = (-c.bx / sp) * 300
          nb.vy = (-c.by / sp) * 300
        }
        s.balls.push(nb)
      }
    }
  }
  if (t < 1) {
    const dt = 1 - t
    for (const c of s.cars) {
      c.x += c.vx * dt
      c.y += c.vy * dt
    }
    for (const b of s.balls) {
      b.x += b.vx * dt
      b.y += b.vy * dt
    }
  }
  for (const c of s.cars) {
    c.x = truncate(c.x)
    c.y = truncate(c.y)
    c.vx = truncate(c.vx * 0.85)
    c.vy = truncate(c.vy * 0.85)
    let deg = Math.round((c.a * 180) / Math.PI)
    let a = (deg * Math.PI) / 180
    while (a > Math.PI * 2) a -= Math.PI * 2
    while (a < 0) a += Math.PI * 2
    c.a = a
  }
  for (const b of s.balls) {
    b.x = truncate(b.x)
    b.y = truncate(b.y)
    b.vx = truncate(b.vx)
    b.vy = truncate(b.vy)
  }
  s.balls = s.balls.filter(b => !b.cap)
}

// Inputs.
function expert(c: Car, rot: number, thrust: number) {
  c.a = ((c.a * 180) / Math.PI + rot) * (Math.PI / 180)
  c.vx += Math.cos(c.a) * thrust
  c.vy += Math.sin(c.a) * thrust
}
function target(c: Car, x: number, y: number, thrust: number) {
  if (c.x === x && c.y === y) return
  let ang = Math.atan2(y - c.y, x - c.x)
  const max = Math.PI * 2
  const da = (ang - c.a) % max
  const rel = ((2 * da) % max) - da
  if (Math.abs(rel) >= Math.PI / 10) ang = c.a + (Math.PI / 10) * Math.sign(rel)
  c.a = ang
  c.vx += Math.cos(c.a) * thrust
  c.vy += Math.sin(c.a) * thrust
}

const P: Params = { R: parseInt(readline()), CR: parseInt(readline()), SW: parseInt(readline()) }
const carCount = parseInt(readline())
const DEPTH = 6
type Plan = { rot: Int8Array; thrust: Uint8Array } // [car * DEPTH + turn]
const THRUSTS = [0, 100, 200, 200]
const rand = (n: number) => Math.floor(Math.random() * n)
function randomize(p: Plan, i: number) {
  p.rot[i] = rand(37) - 18
  p.thrust[i] = Math.random() < 0.15 ? THRUSTS[rand(THRUSTS.length)] : 200
}
const newPlan = (): Plan => ({ rot: new Int8Array(carCount * DEPTH), thrust: new Uint8Array(carCount * DEPTH) })
const copyPlan = (p: Plan): Plan => ({ rot: p.rot.slice(), thrust: p.thrust.slice() })

const dist = (ax: number, ay: number, bx: number, by: number) => Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by))

// Enemy model: carrier to the centre, else the nearest free prisoner (or
// our carrier when none is free), full thrust.
function enemyMove(s: State) {
  for (const c of s.cars) {
    if (c.owner !== 1) continue
    if (c.ball >= 0) {
      target(c, 0, 0, 200)
      continue
    }
    let tx = 0
    let ty = 0
    let best = Infinity
    for (const b of s.balls) {
      const d = dist(c.x, c.y, b.x, b.y)
      if (d < best) {
        best = d
        tx = b.x + b.vx
        ty = b.y + b.vy
      }
    }
    // Ramming a carrier (a hard hit swaps what they carry) is preferred
    // when about as close.
    for (const o of s.cars)
      if (o.owner === 0 && o.ball >= 0) {
        const d = dist(c.x, c.y, o.x, o.y) * 0.8
        if (d < best) {
          best = d
          tx = o.x + o.vx
          ty = o.y + o.vy
        }
      }
    target(c, Math.round(tx), Math.round(ty), 200)
  }
}

function evaluate(s: State): number {
  let v = 0
  const mine = s.cars.filter(c => c.owner === 0)
  const foes = s.cars.filter(c => c.owner === 1)
  for (const c of mine) {
    if (c.ball < 0) continue
    v += 3000 - dist(c.x, c.y, 0, 0)
    // Enemy free cars close to our carrier can steal it.
    for (const f of foes) if (f.ball < 0) v -= Math.max(0, 1500 - dist(f.x, f.y, c.x, c.y)) * 0.5
  }
  for (const f of foes) {
    if (f.ball < 0) continue
    v -= 3000 - dist(f.x, f.y, 0, 0)
    // Our nearest free car should be on it (a hard hit steals).
    let near = Infinity
    for (const c of mine) if (c.ball < 0) near = Math.min(near, dist(c.x + c.vx, c.y + c.vy, f.x + f.vx, f.y + f.vy))
    if (near < Infinity) v -= near * 0.4
  }
  // Free cars chase free prisoners (each prisoner by its nearest car).
  const free = mine.filter(c => c.ball < 0)
  const used = new Set<Car>()
  for (const b of s.balls) {
    let best: Car | null = null
    let bd = Infinity
    for (const c of free) {
      if (used.has(c)) continue
      const d = dist(c.x, c.y, b.x, b.y)
      if (d < bd) {
        bd = d
        best = c
      }
    }
    if (best) {
      used.add(best)
      v -= bd * 0.5
    }
  }
  return v
}

function simulate(start: State, plan: Plan, mine: number[]): number {
  const s = clone(start)
  let v = 0
  let w = 1
  for (let t = 0; t < DEPTH; t++) {
    for (let k = 0; k < mine.length; k++) expert(s.cars[mine[k]], plan.rot[k * DEPTH + t], plan.thrust[k * DEPTH + t])
    enemyMove(s)
    const before0 = s.score[0]
    const before1 = s.score[1]
    play(s, P)
    v += (s.score[0] - before0) * 100000 * w - (s.score[1] - before1) * 100000 * w
    w *= 0.9
  }
  return v + evaluate(s)
}

let best: Plan | null = null
let turn = 0
while (true) {
  const my = parseInt(readline())
  const opp = parseInt(readline())
  readline() // current winner
  const n = parseInt(readline())
  const state: State = { cars: [], balls: [], score: [my, opp], nextId: 1000 }
  for (let i = 0; i < n; i++) {
    const [id, type, x, y, vx, vy, ang, holds] = readline().split(" ").map(Number)
    if (type === 2) state.balls.push({ id, x, y, vx, vy, cap: false, bx: 0, by: 0 })
    else state.cars.push({ id, owner: type, x, y, vx, vy, a: (ang * Math.PI) / 180, ball: holds, bx: 0, by: 0 })
  }
  // The referee processes units in id order (player 0's cars first).
  const ourIds = state.cars.filter(c => c.owner === 0).map(c => c.id)
  state.cars.sort((a, b) => a.id - b.id)
  state.balls.sort((a, b) => a.id - b.id)
  const mine = ourIds.map(id => state.cars.findIndex(c => c.id === id))
  const deadline = Date.now() + (turn === 0 ? 400 : 38)
  turn++
  // Previous best shifted by one turn, plus random plans.
  let cur = newPlan()
  for (let i = 0; i < cur.rot.length; i++) randomize(cur, i)
  if (best) {
    for (let k = 0; k < carCount; k++)
      for (let t = 0; t + 1 < DEPTH; t++) {
        cur.rot[k * DEPTH + t] = best.rot[k * DEPTH + t + 1]
        cur.thrust[k * DEPTH + t] = best.thrust[k * DEPTH + t + 1]
      }
  }
  let curV = simulate(state, cur, mine)
  let sims = 1
  while (Date.now() < deadline) {
    for (let rep = 0; rep < 8; rep++) {
      const cand = copyPlan(cur)
      if (Math.random() < 0.05) for (let i = 0; i < cand.rot.length; i++) randomize(cand, i)
      else {
        const m = 1 + rand(3)
        for (let j = 0; j < m; j++) {
          const i = rand(cand.rot.length)
          if (Math.random() < 0.5) randomize(cand, i)
          else {
            cand.rot[i] = Math.max(-18, Math.min(18, cand.rot[i] + rand(13) - 6))
            if (Math.random() < 0.3) cand.thrust[i] = THRUSTS[rand(THRUSTS.length)]
          }
        }
      }
      const v = simulate(state, cand, mine)
      sims++
      if (v >= curV) {
        cur = cand
        curV = v
      }
    }
  }
  best = cur
  const out: string[] = []
  for (let k = 0; k < carCount; k++) out.push(`EXPERT ${cur.rot[k * DEPTH]} ${cur.thrust[k * DEPTH]} ${k === 0 ? sims : ""}`.trim())
  console.log(out.join("\n"))
}
