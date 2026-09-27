// Planner bot for Code Royale on the exact engine (engine.ts, checked 160/160
// turns on a replay). Bundled into ../code-royale.ts by build.mjs.
//
// After the contest winner's postmortem (RoboStac): the queen's actions come
// from a beam search over 8 compass moves and the builds possible on the
// touched site, played on the engine with the enemy queen idle (repairing a
// tower it touches) and no training; the evaluation weighs our queen HP far
// above anything else, then the enemy HP, income, towers, knight barracks and
// enemy buildings, plus Agade's knight-threat term. Training is a separate
// rule set (early knights, 8-knight bursts, spend at the end).
import {
  A_BUILD,
  A_MOVE,
  Action,
  BARRACKS,
  KNIGHT,
  GIANT,
  MINE,
  NONE,
  QUEEN_R,
  State,
  TOUCH,
  TOWER,
  C_COST,
  clone,
  formatAction,
  newAction,
  parseInit,
  sideFromQueen,
  stateFromInput,
  step,
} from "./engine.js"

const init = [readline()]
for (let i = 0, n = parseInt(init[0]); i < n; i++) init.push(readline())
const map = parseInit(init)
const numSites = map.length

let me = -1
let prev: State | null = null
let turn = 0

const dist = (ax: number, ay: number, bx: number, by: number) => Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by))

function touched(s: State, p: number): number {
  const q = s.queens[p]
  let found = -1
  let count = 0
  for (const o of map) {
    const lim = o.r + QUEEN_R + TOUCH
    if ((o.x - q.x) * (o.x - q.x) + (o.y - q.y) * (o.y - q.y) < lim * lim) {
      found = o.id
      count++
    }
  }
  return count === 1 ? found : -1
}

const underEnemyTower = (s: State, x: number, y: number, en: number) => {
  for (let i = 0; i < numSites; i++) {
    const st = s.sites[i]
    if (st.type === TOWER && st.owner === en && dist(x, y, map[i].x, map[i].y) < st.range) return true
  }
  return false
}

function evaluate(s: State): number {
  const en = 1 - me
  let v = 100 * s.hp[me] - 10 * s.hp[en]
  if (s.hp[me] <= 0) v -= 100000
  let income = 0
  let towers = 0
  let mines = 0
  let kb = 0
  let kbDist = Infinity
  const eq = s.queens[en]
  for (let i = 0; i < numSites; i++) {
    const st = s.sites[i]
    if (st.owner === me) {
      if (st.type === MINE) {
        income += st.rate
        mines++
      } else if (st.type === TOWER) {
        towers++
        v += (towers <= 6 ? 50 : 10) + (40 * st.hp) / 800
      } else if (st.type === BARRACKS && st.ctype === KNIGHT) {
        kb++
        kbDist = Math.min(kbDist, dist(map[i].x, map[i].y, eq.x, eq.y))
      }
    } else if (st.owner === en) v -= st.type === TOWER ? 10 : 25
  }
  v += 60 * income
  if (kb === 0) v -= 400
  else if (kb === 2) v += 100
  else if (kb > 2) v -= 300
  // Tower turtles (the boss raises 11-17): a giant barracks to bust them.
  let enemyTowers = 0
  let gb = 0
  for (const st of s.sites) {
    if (st.owner === en && st.type === TOWER) enemyTowers++
    if (st.owner === me && st.type === BARRACKS && st.ctype === GIANT) gb++
  }
  if (enemyTowers >= 5) v += gb === 1 ? 150 : gb === 0 ? -100 : -300
  if (kbDist < Infinity) v -= 0.03 * kbDist
  if (towers < 5 && mines > 2 && towers < mines) v -= 150
  // Agade's knight threat: HP over distance, a knight far enough dies first.
  const q = s.queens[me]
  for (const k of s.creeps[en]) {
    if (k.type !== KNIGHT) continue
    const d = Math.max(1, dist(k.x, k.y, q.x, q.y))
    v -= 1000 * Math.max(0, k.hp / d - 0.02)
  }
  // Keep expanding: distance to the nearest free site out of enemy tower range.
  let near = Infinity
  for (let i = 0; i < numSites; i++) {
    const st = s.sites[i]
    if (st.type !== NONE) continue
    const d = dist(q.x, q.y, map[i].x, map[i].y)
    if (d < near && !underEnemyTower(s, map[i].x, map[i].y, en)) near = d
  }
  if (near < Infinity) v -= 0.2 * near
  // Arena losses: queens cornered against walls / in corners.
  const edge = Math.min(q.x, q.y, 1920 - q.x, 1000 - q.y)
  if (edge < 200) v -= 2 * (200 - edge)
  const corner = Math.min(
    Math.hypot(q.x, q.y),
    Math.hypot(1920 - q.x, q.y),
    Math.hypot(q.x, 1000 - q.y),
    Math.hypot(1920 - q.x, 1000 - q.y),
  )
  if (corner < 400) v -= 2 * (400 - corner)
  return v
}

// Candidate queen actions from a state.
function options(s: State): Action[] {
  const out: Action[] = []
  const q = s.queens[me]
  for (let k = 0; k < 8; k++) {
    const a = newAction()
    a.kind = A_MOVE
    a.x = Math.round(Math.max(0, Math.min(1920, q.x + Math.cos((k * Math.PI) / 4) * 100)))
    a.y = Math.round(Math.max(0, Math.min(1000, q.y + Math.sin((k * Math.PI) / 4) * 100)))
    out.push(a)
  }
  const t = touched(s, me)
  if (t >= 0) {
    const st = s.sites[t]
    const build = (b: number) => {
      const a = newAction()
      a.kind = A_BUILD
      a.site = t
      a.build = b
      out.push(a)
    }
    let kb = 0
    for (const o of s.sites) if (o.owner === me && o.type === BARRACKS && o.ctype === KNIGHT) kb++
    let gb = 0
    let et = 0
    for (const o of s.sites) {
      if (o.owner === me && o.type === BARRACKS && o.ctype === GIANT) gb++
      if (o.owner === 1 - me && o.type === TOWER) et++
    }
    if (st.type === NONE) {
      if (st.gold > 0) build(0)
      build(1)
      if (kb < 2) build(2)
      if (gb === 0 && et >= 5) build(4)
    } else if (st.owner === me) {
      if (st.type === MINE && st.rate < st.maxMine && st.gold > 0) build(0)
      if (st.type === TOWER && st.hp < 700) build(1)
    }
  }
  return out
}

function enemyAction(s: State): Action {
  const en = 1 - me
  const a = newAction()
  const t = touched(s, en)
  if (t >= 0 && s.sites[t].type === TOWER && s.sites[t].owner === en) {
    a.kind = A_BUILD
    a.site = t
    a.build = 1
  }
  return a
}

type Node = { s: State; first: Action; score: number }

function plan(root: State, deadline: number): Action {
  const WIDTH = 8
  let beam: Node[] = [{ s: root, first: newAction(), score: 0 }]
  let best: Node | null = null
  for (let depth = 0; depth < 12; depth++) {
    const next: Node[] = []
    for (const n of beam) {
      for (const a of options(n.s)) {
        if (Date.now() > deadline) break
        const c = clone(n.s)
        const acts: [Action, Action] = [newAction(), newAction()]
        acts[me] = a
        acts[1 - me] = enemyAction(c)
        step(c, acts)
        // Score: accumulated evals (early turns count, the last most).
        const sc = n.score * 0.7 + evaluate(c)
        next.push({ s: c, first: depth === 0 ? a : n.first, score: sc })
      }
    }
    if (!next.length) break
    next.sort((x, y) => y.score - x.score)
    beam = next.slice(0, WIDTH)
    best = beam[0]
    if (Date.now() > deadline) break
  }
  return best ? best.first : newAction()
}

// Spend everything, as the boss does (30-45 trainings a game against our
// 8-10 with bursts): a giant first when the enemy turtles behind 5+ towers
// and none of ours is alive, then knights from the barracks closest to the
// enemy queen.
function training(s: State): number[] {
  const en = 1 - me
  const eq = s.queens[en]
  const ready: number[] = []
  let giantB = -1
  let enemyTowers = 0
  for (let i = 0; i < numSites; i++) {
    const st = s.sites[i]
    if (st.owner === en && st.type === TOWER) enemyTowers++
    if (st.owner !== me || st.type !== BARRACKS || st.training) continue
    if (st.ctype === KNIGHT) ready.push(i)
    else if (st.ctype === GIANT) giantB = i
  }
  ready.sort((a, b) => dist(map[a].x, map[a].y, eq.x, eq.y) - dist(map[b].x, map[b].y, eq.x, eq.y))
  let g = s.gold[me]
  const out: number[] = []
  const giantAlive = s.creeps[me].some(c => c.type === GIANT)
  if (giantB >= 0 && enemyTowers >= 5 && !giantAlive) {
    if (g < C_COST[GIANT]) return out // save for it
    out.push(giantB)
    g -= C_COST[GIANT]
  }
  for (const i of ready)
    if (g >= C_COST[KNIGHT]) {
      out.push(i)
      g -= C_COST[KNIGHT]
    }
  return out
}

while (true) {
  const lines: string[] = [readline()]
  for (let i = 0; i < numSites; i++) lines.push(readline())
  const nu = readline()
  lines.push(nu)
  for (let i = 0, n = parseInt(nu); i < n; i++) lines.push(readline())
  const start = Date.now()
  if (me < 0) {
    for (let i = numSites + 2; i < lines.length; i++) {
      const [x, , owner, type] = lines[i].split(" ").map(Number)
      if (owner === 0 && type === -1) me = sideFromQueen(x)
    }
  }
  const s = stateFromInput(map, lines, me, turn, prev)
  const a = plan(s, start + (turn === 0 ? 300 : 32))
  a.train = training(s)
  const out = formatAction(a)
  // Keep the simulated next state for hidden info (enemy gold, unseen sites).
  const acts: [Action, Action] = [newAction(), newAction()]
  acts[me] = a
  acts[1 - me] = enemyAction(s)
  prev = clone(s)
  step(prev, acts)
  turn++
  console.log(out[0])
  console.log(out[1])
}
