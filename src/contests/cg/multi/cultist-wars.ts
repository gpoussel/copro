// 🎮 CodinGame Multiplayer - cultist-wars
// https://www.codingame.com/multiplayer/bot-programming/cultist-wars
// Referee: https://github.com/kgeilmann/cultist-wars-referee
//
// 13×7, one action per player per turn, 150 rounds, score = units left.
// Leader converts an adjacent (Manhattan 1) neutral or enemy cultist;
// cultists shoot within Manhattan 6 for 7 − distance (hp 10) — the bullet
// stops at the first obstacle or unit on the referee's Bresenham line (drawn
// from the shooter when it is above the target, else from the target, the
// hit then being the blocker closest to the shooter); friendly fire exists.
// Bot: 2-ply search (our action, then the opponent's best reply) on an exact
// simulation; eval = units (10 + 0.3·hp, +40 leader), each leader's BFS
// path distance to the nearest neutral (×2.5; enemy cultists once the
// neutrals are gone) and its exposure to enemy shots.

const myId = parseInt(readline())
const [W, H] = readline().split(" ").map(Number)
const grid: string[] = []
for (let y = 0; y < H; y++) grid.push(readline())
const floor = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && grid[y][x] !== "x"
const DIRS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

interface Unit {
  id: number
  type: number // 0 cultist, 1 leader
  hp: number
  x: number
  y: number
  owner: number // 0/1 players, 2 neutral
}

// Cells strictly between, in the referee's trace order.
function trace(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy
  let x = x0
  let y = y0
  const out: [number, number][] = []
  for (let guard = 0; guard < 64; guard++) {
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x += sx
    }
    if (e2 < dx) {
      err += dx
      y += sy
    }
    if (x === x1 && y === y1) break
    out.push([x, y])
  }
  return out
}
// The unit a shot from s at t hits (null: an obstacle), given the units.
function hit(units: Unit[], s: Unit, t: Unit): Unit | null {
  const at = (x: number, y: number) => units.find(u => u.hp > 0 && u.x === x && u.y === y)
  const blocked = (x: number, y: number) => !floor(x, y) || at(x, y) !== undefined
  if (s.y < t.y) {
    for (const [x, y] of trace(s.x, s.y, t.x, t.y)) if (blocked(x, y)) return at(x, y) ?? null
    return t
  }
  let res: [number, number] | null = null
  for (const [x, y] of trace(t.x, t.y, s.x, s.y)) if (blocked(x, y)) res = [x, y]
  if (!res) return t
  return at(res[0], res[1]) ?? null
}

type Act = { unit: number; kind: string; a: number; b: number }
function actions(units: Unit[], side: number): Act[] {
  const out: Act[] = [{ unit: -1, kind: "WAIT", a: 0, b: 0 }]
  const occupied = (x: number, y: number) => units.some(u => u.hp > 0 && u.x === x && u.y === y)
  for (const u of units) {
    if (u.owner !== side || u.hp <= 0) continue
    for (const [dx, dy] of DIRS) {
      const nx = u.x + dx
      const ny = u.y + dy
      if (floor(nx, ny) && !occupied(nx, ny)) out.push({ unit: u.id, kind: "MOVE", a: nx, b: ny })
    }
    if (u.type === 1) {
      for (const v of units)
        if (v.hp > 0 && v.type === 0 && v.owner !== side && Math.abs(v.x - u.x) + Math.abs(v.y - u.y) === 1)
          out.push({ unit: u.id, kind: "CONVERT", a: v.id, b: 0 })
    } else {
      for (const v of units)
        if (v.hp > 0 && v.owner !== side && v.owner !== 2 && Math.abs(v.x - u.x) + Math.abs(v.y - u.y) <= 6)
          out.push({ unit: u.id, kind: "SHOOT", a: v.id, b: 0 })
    }
  }
  return out
}
function apply(units: Unit[], act: Act): Unit[] {
  const next = units.map(u => ({ ...u }))
  if (act.kind === "WAIT") return next
  const u = next.find(v => v.id === act.unit)!
  if (act.kind === "MOVE") {
    u.x = act.a
    u.y = act.b
  } else if (act.kind === "CONVERT") {
    next.find(v => v.id === act.a)!.owner = u.owner
  } else {
    const t = next.find(v => v.id === act.a)!
    const h = hit(next, u, t)
    if (h) h.hp = Math.max(0, h.hp - (7 - (Math.abs(h.x - u.x) + Math.abs(h.y - u.y))))
  }
  return next
}
// Path distance (walls and units block) from (x, y) to the nearest cell
// next to one of the targets; 99 when unreachable or no target.
function pathTo(units: Unit[], x0: number, y0: number, targets: Unit[]): number {
  if (!targets.length) return 99
  const block = new Uint8Array(W * H)
  for (const u of units) if (u.hp > 0) block[u.y * W + u.x] = 1
  const goal = new Uint8Array(W * H)
  for (const t of targets)
    for (const [dx, dy] of DIRS) {
      const x = t.x + dx
      const y = t.y + dy
      if (floor(x, y)) goal[y * W + x] = 1
    }
  const dist = new Int16Array(W * H).fill(-1)
  const q = [y0 * W + x0]
  dist[q[0]] = 0
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    if (goal[c]) return dist[c]
    for (const [dx, dy] of DIRS) {
      const x = (c % W) + dx
      const y = Math.floor(c / W) + dy
      const n = y * W + x
      if (!floor(x, y) || block[n] || dist[n] >= 0) continue
      dist[n] = dist[c] + 1
      q.push(n)
    }
  }
  return 99
}
// Damage the enemy's cultists could deal to u with one shot each.
function danger(units: Unit[], u: Unit): number {
  let d = 0
  for (const e of units) {
    if (e.hp <= 0 || e.type !== 0 || e.owner === u.owner || e.owner === 2) continue
    const m = Math.abs(e.x - u.x) + Math.abs(e.y - u.y)
    if (m <= 6 && hit(units, e, u) === u) d += 7 - m
  }
  return d
}
function evaluate(units: Unit[], me: number): number {
  let s = 0
  for (const u of units) {
    if (u.hp <= 0) continue
    const sign = u.owner === me ? 1 : u.owner === 1 - me ? -1 : 0
    s += sign * (10 + 0.3 * u.hp + (u.type === 1 ? 40 : 0))
  }
  const neutrals = units.filter(u => u.hp > 0 && u.owner === 2)
  for (const side of [me, 1 - me]) {
    const leader = units.find(u => u.owner === side && u.type === 1 && u.hp > 0)
    if (!leader) continue
    const sign = side === me ? 1 : -1
    // The race for neutrals, then for enemy cultists.
    const targets = neutrals.length ? neutrals : units.filter(u => u.hp > 0 && u.type === 0 && u.owner === 1 - side)
    const d = pathTo(units, leader.x, leader.y, targets)
    s -= sign * Math.min(d, 20) * (neutrals.length ? 2.5 : 1)
    // Leader exposure (the boss focuses leaders).
    s -= sign * danger(units, leader) * (side === me ? 1.5 : 1)
  }
  return s
}

while (true) {
  const n = parseInt(readline())
  const units: Unit[] = []
  for (let i = 0; i < n; i++) {
    const [id, type, hp, x, y, owner] = readline().split(" ").map(Number)
    units.push({ id, type, hp, x, y, owner })
  }
  const deadline = Date.now() + 45 // a 70 ms budget timed out in the arena
  let best: Act = { unit: -1, kind: "WAIT", a: 0, b: 0 }
  let bestV = -Infinity
  const mine = actions(units, myId)
  // Order by the immediate value so the best candidates are searched first.
  const ranked = mine.map(a => ({ a, s: apply(units, a) })).map(o => ({ ...o, v: evaluate(o.s, myId) }))
  ranked.sort((p, q) => q.v - p.v)
  for (const { a, s } of ranked) {
    let worst = Infinity
    let cut = false
    for (const r of actions(s, 1 - myId)) {
      const v = evaluate(apply(s, r), myId)
      if (v < worst) worst = v
      if (worst <= bestV) break
      if (Date.now() > deadline) {
        cut = true
        break
      }
    }
    if (cut) break // an unfinished reply scan is not a real worst case
    if (worst > bestV) {
      bestV = worst
      best = a
    }
    if (Date.now() > deadline) break
  }
  if (best.kind === "WAIT") console.log("WAIT")
  else if (best.kind === "MOVE") console.log(`${best.unit} MOVE ${best.a} ${best.b}`)
  else console.log(`${best.unit} ${best.kind} ${best.a}`)
}
