// 🎮 CodinGame Puzzle - the-fall-episode-3
// https://www.codingame.com/training/expert/the-fall-episode-3

// Each turn, a limited discrepancy search over future turns simulates the
// whole game (our rotation, then Indy and every known rock move; rocks stop on
// walls and destroy each other on collision). The default policy follows a
// feasible path of Indy to the exit (scheduling DFS as in episode 2); the
// allowed deviations are WAIT, other orientations of the rooms on that path
// (alternative routes / timings) and rotations of rooms on the rocks'
// trajectories (to divert rocks into walls or into each other). Failed states
// are memoized and the search is bounded by a time budget.

// Entry sides: 0 = TOP, 1 = LEFT, 2 = RIGHT
// Moves: 0 = down, 1 = to the left, 2 = to the right, -1 = blocked
const EXITS: number[][] = [
  [-1, -1, -1],
  [0, 0, 0],
  [-1, 2, 1],
  [0, -1, -1],
  [1, -1, 0],
  [2, 0, -1],
  [-1, 2, 1],
  [0, -1, 0],
  [-1, 0, 0],
  [0, 0, -1],
  [1, -1, -1],
  [2, -1, -1],
  [-1, -1, 0],
  [-1, 0, -1],
]
const ROT_RIGHT = [0, 1, 3, 2, 5, 4, 7, 8, 9, 6, 11, 12, 13, 10]
const ROT_LEFT: number[] = []
ROT_RIGHT.forEach((to, from) => (ROT_LEFT[to] = from))
const SIDES = ["TOP", "LEFT", "RIGHT"]

const [gridW, gridH] = readline().split(" ").map(Number)
const tiles: number[] = []
const locked: boolean[] = []
for (let y = 0; y < gridH; y++) {
  const row = readline().trim().split(/\s+/).map(Number)
  for (let x = 0; x < gridW; x++) {
    tiles.push(Math.abs(row[x]))
    locked.push(row[x] < 0)
  }
}
const exitX = Number(readline())
const exitCell = (gridH - 1) * gridW + exitX

// Next [cell, entry] after leaving `cell` with move `mv`, or null if out of grid / blocked
function step(cell: number, mv: number): [number, number] | null {
  const x = cell % gridW
  const y = (cell - x) / gridW
  if (mv === 0) return y + 1 < gridH ? [cell + gridW, 0] : null
  if (mv === 1) return x > 0 ? [cell - 1, 2] : null
  if (mv === 2) return x + 1 < gridW ? [cell + 1, 1] : null
  return null
}

// Orientation options of an unlocked room type: [type, rotations needed]
const OPTIONS: [number, number][][] = ROT_RIGHT.map((t0, t) => {
  const l = ROT_LEFT[t]
  const res: [number, number][] = [[t, 0]]
  if (t0 !== t) res.push([t0, 1])
  if (l !== t && l !== t0) res.push([l, 1])
  const rr = ROT_RIGHT[t0]
  if (rr !== t && rr !== t0 && rr !== l) res.push([rr, 2])
  return res
})

interface PathStep {
  cell: number
  type: number // orientation the room must have when Indy enters it
}

// Episode 2 DFS: a path to the exit where each room gets its rotations in time
function findPath(layout: number[], start: number, entry: number, blocked: Set<number>): PathStep[] | null {
  const failed = new Int16Array(gridW * gridH * 3).fill(-1)
  const path: PathStep[] = [{ cell: start, type: layout[start] }]
  const dfs = (cell: number, ent: number, type: number, surplus: number): boolean => {
    const mv = EXITS[type][ent]
    if (mv < 0) return false
    const nxt = step(cell, mv)
    if (!nxt) return false
    const [nc, ne] = nxt
    if (nc === exitCell) {
      if (EXITS[layout[nc]][ne] < 0) return false
      path.push({ cell: nc, type: layout[nc] })
      return true
    }
    const key = nc * 3 + ne
    if (failed[key] >= surplus) return false
    for (const [t, r] of locked[nc] ? [[layout[nc], 0]] : OPTIONS[layout[nc]]) {
      if (r > 0 && blocked.has(nc)) continue
      const s = surplus + 1 - r
      if (s < 0 || EXITS[t][ne] < 0) continue
      path.push({ cell: nc, type: t })
      if (dfs(nc, ne, t, s)) return true
      path.pop()
    }
    failed[key] = Math.max(failed[key], surplus)
    return false
  }
  if (start === exitCell) return path
  return dfs(start, entry, layout[start], 0) ? path : null
}

// Zobrist keys to hash layouts incrementally
const ZOB: number[] = []
for (let i = 0; i < gridW * gridH * 14; i++) ZOB.push((Math.random() * 0x7fffffff) | 0)

interface State {
  layout: number[]
  hash: number
  indy: number
  entry: number
  rocks: [number, number, number][] // cell, entry, id
}

interface Action {
  cell: number
  cmd: string
}

// Id of the rock that killed Indy in the last failed simulation (-1: wall)
let killer = -1

// One game turn after our action; null if Indy dies
function simulate(s: State, act: Action | null): State | null {
  const layout = act ? s.layout.slice() : s.layout
  let hash = s.hash
  if (act) {
    const old = layout[act.cell]
    layout[act.cell] = act.cmd === "RIGHT" ? ROT_RIGHT[old] : ROT_LEFT[old]
    hash ^= ZOB[act.cell * 14 + old] ^ ZOB[act.cell * 14 + layout[act.cell]]
  }
  const mv = EXITS[layout[s.indy]][s.entry]
  const nxt = mv < 0 ? null : step(s.indy, mv)
  killer = -1
  if (!nxt) return null
  const [ni, ne] = nxt
  if (EXITS[layout[ni]][ne] < 0) return null
  const moved: [number, number, number, number][] = []
  for (const [rc, re, id] of s.rocks) {
    const rm = EXITS[layout[rc]][re]
    if (rm < 0) continue
    const rn = step(rc, rm)
    if (!rn) continue
    moved.push([rn[0], rn[1], rc, id])
  }
  const count = new Map<number, number>()
  for (const [c] of moved) count.set(c, (count.get(c) ?? 0) + 1)
  const rocks: [number, number, number][] = []
  for (const [c, e, from, id] of moved) {
    if (c === ni || (from === ni && c === s.indy)) {
      killer = id
      return null
    }
    if (count.get(c) === 1) rocks.push([c, e, id])
  }
  return { layout, hash, indy: ni, entry: ne, rocks }
}

const stateKey = (s: State): string => `${s.indy},${s.entry}|${s.rocks.map(r => r[0] * 3 + r[1]).join(",")}|${s.hash}`

function rotatable(s: State, cell: number, rockCells: Set<number>): boolean {
  return !locked[cell] && cell !== s.indy && cell !== exitCell && !rockCells.has(cell)
}

// Rotations of a room that actually change it
function rotations(s: State, cell: number, rockCells: Set<number>): Action[] {
  if (!rotatable(s, cell, rockCells)) return []
  const t = s.layout[cell]
  const res: Action[] = []
  if (ROT_RIGHT[t] !== t) res.push({ cell, cmd: "RIGHT" })
  if (ROT_LEFT[t] !== t && ROT_LEFT[t] !== ROT_RIGHT[t]) res.push({ cell, cmd: "LEFT" })
  return res
}

// Next rotation required by the planned path (after Indy's index `idx`):
// an Action, null if nothing is pending, undefined if the room is blocked
function planned(s: State, path: PathStep[], idx: number, rockCells: Set<number>): Action | null | undefined {
  for (let j = idx + 1; j < path.length; j++) {
    const { cell, type } = path[j]
    const cur = s.layout[cell]
    if (cur === type) continue
    if (!rotatable(s, cell, rockCells)) return undefined
    return { cell, cmd: ROT_RIGHT[cur] === type || ROT_RIGHT[ROT_RIGHT[cur]] === type ? "RIGHT" : "LEFT" }
  }
  return null
}

// Result of following the default policy from a state
interface Rollout {
  ok: boolean
  killer: number
  states: State[]
  acts: (Action | null)[]
}

let rollCache = new Map<string, [Rollout, number]>()

function rollout(s0: State): [Rollout, number] {
  const roll: Rollout = { ok: false, killer: -1, states: [s0], acts: [] }
  let path: PathStep[] | null = null
  let idx = 0
  for (let turn = 0; turn < 300; turn++) {
    const cur = roll.states[roll.states.length - 1]
    const rockCells = new Set(cur.rocks.map(r => r[0]))
    let act = path ? planned(cur, path, idx, rockCells) : undefined
    if (act === undefined) {
      path = findPath(cur.layout, cur.indy, cur.entry, rockCells)
      idx = 0
      act = path ? planned(cur, path, idx, rockCells) : undefined
      if (act === undefined) break
    }
    const ns = simulate(cur, act)
    roll.acts.push(act)
    if (!ns) {
      roll.killer = killer
      break
    }
    roll.states.push(ns)
    idx++
    if (ns.indy === exitCell) {
      roll.ok = true
      break
    }
    if (!path || idx >= path.length || path[idx].cell !== ns.indy) path = null
  }
  roll.states.forEach((st, i) => {
    if (i < roll.acts.length) rollCache.set(stateKey(st), [roll, i])
  })
  return [roll, 0]
}

let deadline = 0
let timedOut = false
let failedK = new Map<string, number>()

// Limited discrepancy search around the default policy: at most k deviations,
// chosen among rooms that Indy or a rock reaches before the rollout fails.
// Returns the action to play in state s if Indy can reach the exit, else undefined.
function search(s: State, k: number): Action | null | undefined {
  if (timedOut || Date.now() > deadline) {
    timedOut = true
    return undefined
  }
  const key = stateKey(s)
  if ((failedK.get(key) ?? -1) >= k) return undefined
  const [roll, off] = rollCache.get(key) ?? rollout(s)
  if (roll.ok) return roll.acts[off]
  if (k > 0) {
    const def = off < roll.acts.length ? roll.acts[off] : undefined
    const order: [Action | null, number][] = []
    const rockCells = new Set(s.rocks.map(r => r[0]))
    const seen = new Set<number>()
    const addCell = (c: number): void => {
      if (c < 0 || seen.has(c)) return
      seen.add(c)
      for (const a of rotations(s, c, rockCells)) order.push([a, k - 1])
    }
    const last = roll.states[roll.states.length - 1]
    const nextCell = (c: number, e: number): number => {
      const m = EXITS[last.layout[c]][e]
      const n = m < 0 ? null : step(c, m)
      return n ? n[0] : -1
    }
    // first the rooms on the trajectory of the rock that kills Indy
    if (roll.killer >= 0) {
      for (let j = off + 1; j < roll.states.length; j++) {
        for (const [rc, , id] of roll.states[j].rocks) if (id === roll.killer) addCell(rc)
      }
      for (const [rc, re, id] of last.rocks) if (id === roll.killer) addCell(nextCell(rc, re))
    }
    // then the default action, WAIT, and rooms entered later by Indy or rocks
    if (def !== undefined) order.push([def, k])
    if (def) order.push([null, k - 1])
    for (let j = off + 1; j < roll.states.length; j++) addCell(roll.states[j].indy)
    addCell(nextCell(last.indy, last.entry))
    const indyPath = findPath(s.layout, s.indy, s.entry, rockCells)
    if (indyPath) for (const p of indyPath) addCell(p.cell)
    for (let j = off + 1; j < roll.states.length; j++) for (const [rc] of roll.states[j].rocks) addCell(rc)
    for (const [rc, re] of last.rocks) addCell(nextCell(rc, re))
    for (const [act, kk] of order) {
      const ns = simulate(s, act)
      if (!ns) continue
      if (ns.indy === exitCell || search(ns, kk) !== undefined) return act
      if (timedOut) return undefined
    }
  }
  failedK.set(key, k)
  return undefined
}

// Border entries where a future rock could appear
const borderEntries: [number, number][] = []
for (let x = 0; x < gridW; x++) borderEntries.push([x, 0])
for (let y = 0; y < gridH; y++) borderEntries.push([y * gridW, 1], [y * gridW + gridW - 1, 2])

// Number of potential rock entries whose trajectory crosses Indy's future path
function threats(layout: number[], pathCells: Set<number>, indy: number): number {
  let n = 0
  for (const [c0, e0] of borderEntries) {
    if (c0 === indy) continue
    let c = c0
    let e = e0
    for (let k = 0; k < 100; k++) {
      if (EXITS[layout[c]][e] < 0) break
      if (pathCells.has(c)) {
        n++
        break
      }
      const nx = step(c, EXITS[layout[c]][e])
      if (!nx) break
      ;[c, e] = nx
    }
  }
  return n
}

// With a spare turn, rotate a room to close a potential rock trajectory
// toward Indy's path, as long as the plan stays feasible.
function anticipate(s: State): Action | null {
  const rockCells = new Set(s.rocks.map(r => r[0]))
  const path = findPath(s.layout, s.indy, s.entry, rockCells)
  if (!path) return null
  const pathCells = new Set(path.slice(1).map(p => p.cell))
  const base = threats(s.layout, pathCells, s.indy)
  if (!base) return null
  let best: Action | null = null
  let bestScore = base
  for (let c = 0; c < gridW * gridH; c++) {
    if (pathCells.has(c) || !rotatable(s, c, rockCells)) continue
    for (const cmd of ["RIGHT", "LEFT"]) {
      const t = s.layout[c]
      const nt = cmd === "RIGHT" ? ROT_RIGHT[t] : ROT_LEFT[t]
      if (nt === t) continue
      s.layout[c] = nt
      const score = threats(s.layout, pathCells, s.indy)
      s.layout[c] = t
      if (score < bestScore) {
        bestScore = score
        best = { cell: c, cmd }
      }
    }
  }
  if (!best || Date.now() > deadline) return null
  const ns = simulate(s, best)
  if (!ns) return null
  if (ns.indy === exitCell) return best
  failedK = new Map<string, number>()
  timedOut = false
  for (let k = 0; k <= 1 && !timedOut; k++) if (search(ns, k) !== undefined) return best
  return null
}

let firstTurn = true
while (true) {
  const [xs, ys, ps] = readline().split(" ")
  const indyCell = Number(ys) * gridW + Number(xs)
  const indyEntry = SIDES.indexOf(ps)
  const rockCount = Number(readline())
  const rocks: [number, number, number][] = []
  for (let i = 0; i < rockCount; i++) {
    const [rx, ry, rp] = readline().split(" ")
    rocks.push([Number(ry) * gridW + Number(rx), SIDES.indexOf(rp), i])
  }
  deadline = Date.now() + (firstTurn ? 500 : 100)
  timedOut = false
  failedK = new Map<string, number>()
  rollCache = new Map<string, [Rollout, number]>()
  const state: State = { layout: tiles.slice(), hash: 0, indy: indyCell, entry: indyEntry, rocks }
  let act: Action | null | undefined = undefined
  for (let k = 0; k <= 4 && act === undefined && !timedOut; k++) {
    act = search(state, k)
  }
  if (act === null && !timedOut) act = anticipate(state)
  if (firstTurn) {
    firstTurn = false
    // warm up the JIT on the first turn (large time budget)
    const until = Date.now() + 300
    for (let i = 0; Date.now() < until; i++) {
      const cell = i % (gridW * gridH)
      const probe: State = { ...state, rocks: [[cell, i % 3, 0]] }
      failedK = new Map<string, number>()
      rollCache = new Map<string, [Rollout, number]>()
      deadline = until
      timedOut = false
      search(probe, 1)
    }
  }
  if (act === undefined) {
    // fallback: follow the path schedule ignoring rocks
    const rockCells = new Set(rocks.map(r => r[0]))
    const path = findPath(tiles, indyCell, indyEntry, rockCells)
    act = (path && planned(state, path, 0, rockCells)) ?? null
  }
  if (act) {
    tiles[act.cell] = act.cmd === "RIGHT" ? ROT_RIGHT[tiles[act.cell]] : ROT_LEFT[tiles[act.cell]]
    console.log(`${act.cell % gridW} ${Math.floor(act.cell / gridW)} ${act.cmd}`)
  } else {
    console.log("WAIT")
  }
}
