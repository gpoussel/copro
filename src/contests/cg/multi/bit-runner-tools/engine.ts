// Bit Runner 2048 engine, ported from the referee (github.com/Illedan/Bit-Runner-2048:
// Game.gameLoop / findNextCollision, Unit.bounce, Car, Ball, Center).
export const EPS = 0.00001
export const CAR_R = 400
export const BALL_R = 100
export type Car = {
  id: number
  owner: number // 0 = us, 1 = them
  x: number
  y: number
  vx: number
  vy: number
  a: number // radians
  ball: number // id of the carried ball, -1 none
  bx: number // velocity when the collision search started
  by: number
}
export type Ball = { id: number; x: number; y: number; vx: number; vy: number; cap: boolean; bx: number; by: number }
export type State = { cars: Car[]; balls: Ball[]; score: [number, number]; nextId: number }
export type Params = { R: number; CR: number; SW: number }

const truncate = (x: number) => {
  const r = x < 0 ? -Math.round(-x) : Math.round(x)
  if (Math.abs(r - x) < EPS) return r
  return x < 0 ? Math.ceil(x) : Math.floor(x)
}

export function clone(s: State): State {
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
export function play(s: State, P: Params) {
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
export function expert(c: Car, rot: number, thrust: number) {
  c.a = ((c.a * 180) / Math.PI + rot) * (Math.PI / 180)
  c.vx += Math.cos(c.a) * thrust
  c.vy += Math.sin(c.a) * thrust
}
export function target(c: Car, x: number, y: number, thrust: number) {
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
