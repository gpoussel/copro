// Port of the Troll Farm referee (github.com/eulerscheZahl/Troll-Farm, level 4 rules): map
// generation (same procedure, own RNG), task parsing / validation, the per-priority resolution
// (MOVE, HARVEST, PLANT, CHOP, PICK, TRAIN, DROP, MINE), plant growth and the end conditions.
// Cells are indexed c = y * W + x. Players are 0 / 1 (absolute seats).

export const PLUM = 0
export const LEMON = 1
export const APPLE = 2
export const BANANA = 3
export const IRON = 4
export const WOOD = 5
export const ITEMS = ["PLUM", "LEMON", "APPLE", "BANANA", "IRON", "WOOD"]
export const COOLDOWN = [8, 8, 9, 6]
export const WATER_BOOST = [5, 5, 7, 2]
export const FINAL_HEALTH = [12, 12, 20, 6]
export const DELTA_HEALTH = [2, 2, 3, 1]
export const MAX_SIZE = 4
export const MAX_FRUITS = 3
export const GAME_TURNS = 300

export const GRASS = 0
export const WATER = 1
export const ROCK = 2
export const IRONCELL = 3
export const SHACK = 4

export interface Tree {
  type: number
  cell: number
  size: number
  health: number
  fruits: number
  cooldown: number
  growth: number // growth cooldown (water aware)
}
export interface Troll {
  id: number
  owner: number
  cell: number
  speed: number
  carry: number
  harvest: number
  chop: number
  inv: number[] // 6 items
}
export interface Game {
  W: number
  H: number
  grid: Uint8Array
  shack: number[] // per player
  inv: number[][] // per player, 6 items
  trees: Tree[]
  trolls: Troll[]
  nextId: number
  turn: number // turns played
  turnsUntilEnd: number
  over: boolean
  dead: boolean[] // killed (invalid command / timeout)
  dist?: (Int16Array | undefined)[] // BFS cache per source cell (the terrain never changes)
}

/** Cached BFS distances from one cell. */
export function distFrom(g: Game, c: number): Int16Array {
  if (!g.dist) g.dist = []
  let d = g.dist[c]
  if (!d) d = g.dist[c] = bfs(g, [c])
  return d
}

export class Rng {
  s: number
  constructor(seed: number) {
    this.s = seed >>> 0 || 1
  }
  next(): number {
    // mulberry32
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  int(n: number): number {
    return Math.floor(this.next() * n)
  }
}

export const sum = (a: number[]) => a[0] + a[1] + a[2] + a[3] + a[4] + a[5]

export function neighbors(g: { W: number; H: number }, c: number): number[] {
  const x = c % g.W
  const y = (c - x) / g.W
  const r: number[] = []
  // Cell.java order: dx {0,1,0,-1}, dy {1,0,-1,0}
  if (y + 1 < g.H) r.push(c + g.W)
  if (x + 1 < g.W) r.push(c + 1)
  if (y - 1 >= 0) r.push(c - g.W)
  if (x - 1 >= 0) r.push(c - 1)
  return r
}

export function nearType(g: Game, c: number, t: number): boolean {
  for (const n of neighbors(g, c)) if (g.grid[n] === t) return true
  return false
}

export function growthCooldown(g: Game, type: number, cell: number): number {
  return COOLDOWN[type] - (nearType(g, cell, WATER) ? WATER_BOOST[type] : 0)
}

export function newTree(g: Game, type: number, cell: number): Tree {
  return {
    type,
    cell,
    size: 0,
    health: FINAL_HEALTH[type] - DELTA_HEALTH[type] * MAX_SIZE,
    fruits: 0,
    cooldown: 0,
    growth: growthCooldown(g, type, cell),
  }
}

export function tickTree(t: Tree) {
  if (t.cooldown > 0) t.cooldown--
  if (t.cooldown === 0 && t.health > 0) {
    if (t.size < MAX_SIZE) {
      t.size++
      t.health += DELTA_HEALTH[t.type]
      t.cooldown = t.growth
    } else if (t.fruits < MAX_FRUITS) {
      t.fruits++
      t.cooldown = t.growth
    }
  }
}

/** BFS over grass from the given sources (sources themselves get 0 whatever their type). */
export function bfs(g: { W: number; H: number; grid: Uint8Array }, sources: number[]): Int16Array {
  const d = new Int16Array(g.W * g.H).fill(-1)
  const q = new Int16Array(g.W * g.H)
  let qt = 0
  for (const s of sources) {
    if (d[s] < 0) {
      d[s] = 0
      q[qt++] = s
    }
  }
  for (let qh = 0; qh < qt; qh++) {
    const c = q[qh]
    const x = c % g.W
    const nd = d[c] + 1
    if (c + g.W < g.W * g.H && d[c + g.W] < 0 && g.grid[c + g.W] === GRASS) (d[c + g.W] = nd), (q[qt++] = c + g.W)
    if (x + 1 < g.W && d[c + 1] < 0 && g.grid[c + 1] === GRASS) (d[c + 1] = nd), (q[qt++] = c + 1)
    if (c - g.W >= 0 && d[c - g.W] < 0 && g.grid[c - g.W] === GRASS) (d[c - g.W] = nd), (q[qt++] = c - g.W)
    if (x > 0 && d[c - 1] < 0 && g.grid[c - 1] === GRASS) (d[c - 1] = nd), (q[qt++] = c - 1)
  }
  return d
}

const manhattan = (W: number, a: number, b: number) =>
  Math.abs((a % W) - (b % W)) + Math.abs(Math.floor(a / W) - Math.floor(b / W))

/** Board.getNextCell: returns every equally good cell (the referee picks one at random). */
export function nextCells(g: Game, cur: number, target: number, speed: number): number[] {
  const src = distFrom(g, cur)
  if (src[target] >= 0 && src[target] <= speed) return [target]
  let td: Int16Array
  if (src[target] < 0) {
    let best = 1e9
    let closest: number[] = []
    for (let c = 0; c < g.W * g.H; c++) {
      if (src[c] < 0) continue
      const d = manhattan(g.W, c, target)
      if (d < best) (best = d), (closest = [])
      if (d === best) closest.push(c)
    }
    td = bfs(g, closest)
  } else td = distFrom(g, target)
  let best = 1e9
  let res: number[] = []
  for (let c = 0; c < g.W * g.H; c++) {
    if (src[c] > speed || src[c] < 0) continue
    const d = td[c]
    if (d >= 0 && d < best) (best = d), (res = [])
    if (d === best) res.push(c)
  }
  return res
}

export function trainCost(nUnits: number, talents: number[]): number[] {
  // PLUM, LEMON, APPLE, BANANA(0), IRON
  return [
    nUnits + talents[0] * talents[0],
    nUnits + talents[1] * talents[1],
    nUnits + talents[2] * talents[2],
    0,
    nUnits + talents[3] * talents[3],
    0,
  ]
}

export function score(g: Game, p: number): number {
  if (g.dead[p]) return -2
  const v = g.inv[p]
  return v[0] + v[1] + v[2] + v[3] + 4 * v[5]
}

// ---------------------------------------------------------------- map generation

export function createGame(seed: number): Game {
  const rng = new Rng(seed)
  for (;;) {
    const H = 8 + rng.int(4)
    const W = 2 * H
    const g: Game = {
      W,
      H,
      grid: new Uint8Array(W * H),
      shack: [0, 0],
      inv: [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ],
      trees: [],
      trolls: [],
      nextId: 0,
      turn: 0,
      turnsUntilEnd: 0,
      over: false,
      dead: [false, false],
    }
    const mirror = (c: number) => W * H - 1 - c
    const treeAt = new Int16Array(W * H).fill(-1)
    const randomCell = () => {
      for (;;) {
        const c = rng.int(H) * W + rng.int(W)
        if (g.grid[c] === GRASS && treeAt[c] < 0) return c
      }
    }
    const set = (c: number, t: number) => {
      g.grid[c] = t
      g.grid[mirror(c)] = t
    }
    const nearEdge = (c: number) => neighbors(g, c).length < 4
    // rivers
    let maxTotalRiver = W * H - Math.trunc((2 * (10 + 4 * 4 + 2 + 1) * 4) / 5)
    const rivers = 2 + rng.int(2)
    for (let i = 0; i < rivers; i++) {
      let river: number | null = randomCell()
      for (let j = 0; j < 10 && nearEdge(river); j++) river = randomCell()
      while (river !== null && maxTotalRiver > 0) {
        set(river, WATER)
        const dir = rng.int(4)
        const x: number = river % W
        const y: number = (river - x) / W
        const nx = x + [0, 1, 0, -1][dir]
        const ny = y + [1, 0, -1, 0][dir]
        river = nx < 0 || ny < 0 || nx >= W || ny >= H ? null : ny * W + nx
        maxTotalRiver -= 2
      }
    }
    const inv = [0, 1, 2, 3, 4].map(() => 2 + rng.int(9))
    let shack = rng.int(H) * W + rng.int(W / 2)
    while (g.grid[shack] === WATER) shack = rng.int(H) * W + rng.int(W / 2)
    set(shack, SHACK)
    g.shack = [shack, mirror(shack)]
    for (let p = 0; p < 2; p++) {
      g.inv[p] = [...inv, 0]
      g.trolls.push({ id: g.nextId++, owner: p, cell: g.shack[p], speed: 1, carry: 1, harvest: 1, chop: 1, inv: [0, 0, 0, 0, 0, 0] })
    }
    // Unit constructor subtracts the training cost of the first troll from an empty inventory,
    // then setInventory overwrites it: net effect is just `inv`.
    const nIron = 1 + rng.int(2)
    for (let i = 0; i < nIron; i++) set(randomCell(), IRONCELL)
    const nRock = 1 + rng.int(10)
    for (let i = 0; i < nRock; i++) set(randomCell(), ROCK)
    for (let type = 0; type < 4; type++) {
      const count = 1 + rng.int(3)
      for (let i = 0; i < count; i++) {
        let c = randomCell()
        const t = newTree(g, type, c)
        const ticks = 1 + rng.int(t.growth * (MAX_SIZE + MAX_FRUITS) - 1)
        for (let k = 0; k < ticks; k++) tickTree(t)
        g.trees.push(t)
        treeAt[c] = 1
        const m = mirror(c)
        if (m === c) break
        c = m
        const t2 = newTree(g, type, c)
        for (let k = 0; k < ticks; k++) tickTree(t2)
        g.trees.push(t2)
        treeAt[c] = 1
      }
    }
    if (valid(g)) return g
  }
}

function valid(g: Game): boolean {
  const s0 = g.shack[0]
  if (nearType(g, s0, IRONCELL)) return false
  if (!neighbors(g, s0).some(n => g.grid[n] === GRASS)) return false
  let ironReach = false
  let firstWalk = -1
  for (let c = 0; c < g.W * g.H; c++) {
    if (g.grid[c] === GRASS && firstWalk < 0) firstWalk = c
    if (g.grid[c] === IRONCELL && neighbors(g, c).some(n => g.grid[n] === GRASS)) ironReach = true
  }
  if (!ironReach) return false
  const d = bfs(g, [firstWalk])
  for (let c = 0; c < g.W * g.H; c++) if (g.grid[c] === GRASS && d[c] < 0) return false
  const sd = bfs(g, [s0])
  let opp = 1e9
  for (const n of neighbors(g, g.shack[1])) if (g.grid[n] === GRASS) opp = Math.min(opp, sd[n] + 1)
  return opp <= 16
}

// ---------------------------------------------------------------- inputs

export function initInput(g: Game, p: number): string[] {
  const r = [`${g.W} ${g.H}`]
  for (let y = 0; y < g.H; y++) {
    let s = ""
    for (let x = 0; x < g.W; x++) {
      const c = y * g.W + x
      const t = g.grid[c]
      s += t === GRASS ? "." : t === WATER ? "~" : t === IRONCELL ? "+" : t === ROCK ? "#" : c === g.shack[p] ? "0" : "1"
    }
    r.push(s)
  }
  return r
}

export function turnInput(g: Game, p: number): string[] {
  const r = [g.inv[p].join(" "), g.inv[1 - p].join(" "), String(g.trees.length)]
  for (const t of g.trees)
    r.push(`${ITEMS[t.type]} ${t.cell % g.W} ${Math.floor(t.cell / g.W)} ${t.size} ${t.health} ${t.fruits} ${t.cooldown}`)
  r.push(String(g.trolls.length))
  for (const u of g.trolls)
    r.push(
      `${u.id} ${u.owner === p ? 0 : 1} ${u.cell % g.W} ${Math.floor(u.cell / g.W)} ${u.speed} ${u.carry} ${u.harvest} ${u.chop} ${u.inv.join(" ")}`,
    )
  return r
}

// ---------------------------------------------------------------- actions

export const A_MOVE = 1
export const A_HARVEST = 2
export const A_PLANT = 3
export const A_CHOP = 4
export const A_PICK = 5
export const A_TRAIN = 6
export const A_DROP = 7
export const A_MINE = 8

export interface Task {
  kind: number
  p: number
  unit: Troll | null
  target: number // MOVE: resolved destination; PLANT / PICK: item type
  talents?: number[]
}

export interface ParseResult {
  tasks: Task[]
  errors: string[]
  critical: boolean
}

const treeAtCell = (g: Game, c: number) => {
  for (const t of g.trees) if (t.cell === c && t.health > 0) return t
  return null
}
const nearShack = (g: Game, u: Troll) => u.cell === g.shack[u.owner] || neighbors(g, u.cell).includes(g.shack[u.owner])
const itemIndex = (s: string) => {
  const i = ITEMS.indexOf(s.toUpperCase())
  return i >= 0 ? i : /^\d+$/.test(s) ? parseInt(s) : -1
}

/** Parses one player's output line; `rand` picks among equally good MOVE destinations. */
export function parseOutput(g: Game, p: number, line: string, rand: (n: number) => number): ParseResult {
  const res: ParseResult = { tasks: [], errors: [], critical: false }
  const used = new Set<number>()
  for (const raw of line.split(";")) {
    const cmd = raw.trim()
    if (cmd === "" || cmd.toUpperCase() === "WAIT") continue
    if (/^MSG(\s|$)/i.test(cmd)) continue
    const w = cmd.split(/\s+/)
    const kw = w[0].toUpperCase()
    const kinds: Record<string, [number, number]> = {
      MOVE: [A_MOVE, 4],
      HARVEST: [A_HARVEST, 2],
      PLANT: [A_PLANT, 3],
      CHOP: [A_CHOP, 2],
      PICK: [A_PICK, 3],
      TRAIN: [A_TRAIN, 5],
      DROP: [A_DROP, 2],
      MINE: [A_MINE, 2],
    }
    const k = kinds[kw]
    const argsOk = w.slice(1).every((s, i) => ((kw === "PLANT" || kw === "PICK") && i === 1 ? /^\w+$/.test(s) : /^-?\d+$/.test(s)))
    if (!k || w.length !== k[1] || !argsOk) {
      res.errors.push("Unknown command: " + cmd)
      res.critical = true
      return res
    }
    const task: Task = { kind: k[0], p, unit: null, target: -1 }
    let fail: string | null = null
    if (k[0] === A_TRAIN) {
      const t = w.slice(1).map(Number)
      task.talents = t
      if (t[0] < 1 || t[0] > g.W * g.H) fail = "invalid movement speed"
      if (t[1] < 0 || t[1] > 1000) fail = "invalid carry"
      if (t[2] < 0 || t[2] > MAX_FRUITS) fail = "invalid harvest"
      if (t[3] < 0 || t[3] > 20) fail = "invalid chop"
      if (!fail && !canTrain(g, p, t)) fail = "can't afford"
    } else {
      const id = parseInt(w[1])
      const u = g.trolls.find(t => t.id === id) ?? null
      if (!u) fail = "Troll " + id + " does not exist"
      else if (u.owner !== p) fail = "You don't own troll " + id
      task.unit = u
      if (u && !fail) {
        const tr = treeAtCell(g, u.cell)
        const free = u.carry - sum(u.inv)
        switch (k[0]) {
          case A_MOVE: {
            const x = parseInt(w[2])
            const y = parseInt(w[3])
            if (x < 0 || y < 0 || x >= g.W || y >= g.H) fail = "outside of the board"
            else {
              const opts = nextCells(g, u.cell, y * g.W + x, u.speed)
              task.target = opts[opts.length === 1 ? 0 : rand(opts.length)]
            }
            break
          }
          case A_HARVEST:
            if (!tr) fail = "not at a plant"
            else if (tr.fruits === 0) fail = "no fruits"
            else if (free === 0) fail = "no capacity"
            else if (u.harvest === 0) fail = "no harvest power"
            break
          case A_PLANT: {
            const it = itemIndex(w[2])
            task.target = it
            if (it < 0 || it > BANANA) fail = "not a plant"
            else if (g.grid[u.cell] !== GRASS) fail = "not on grass"
            else if (tr) fail = "existing plant"
            else if (u.inv[it] === 0) fail = "no seed"
            break
          }
          case A_CHOP:
            if (!tr) fail = "not at a plant"
            else if (u.chop === 0) fail = "no chop power"
            break
          case A_PICK: {
            const it = itemIndex(w[2])
            task.target = it
            if (free === 0) fail = "no capacity"
            else if (it < 0 || it > BANANA) fail = "not a plant"
            else if (g.inv[p][it] === 0) fail = "out of stock"
            else if (!nearShack(g, u)) fail = "not next to shack"
            break
          }
          case A_DROP:
            if (sum(u.inv) === 0) fail = "nothing to drop"
            else if (!nearShack(g, u)) fail = "not next to shack"
            break
          case A_MINE:
            if (!nearType(g, u.cell, IRONCELL)) fail = "not next to iron"
            else if (free === 0) fail = "no capacity"
            else if (u.chop === 0) fail = "no chop power"
            break
        }
      }
      if (u && used.has(u.id)) {
        res.errors.push(`Troll ${u.id} already used`)
        continue
      }
      if (u) used.add(u.id)
    }
    if (fail) res.errors.push(`${cmd}: ${fail}`)
    else res.tasks.push(task)
  }
  return res
}

export function canTrain(g: Game, p: number, t: number[]): boolean {
  const n = g.trolls.filter(u => u.owner === p).length
  const c = trainCost(n, t)
  for (let i = 0; i < 6; i++) if (c[i] > g.inv[p][i]) return false
  return true
}

function groupByCell(tasks: Task[]): Task[][] {
  const m = new Map<number, Task[]>()
  for (const t of tasks) {
    const c = t.unit!.cell
    if (!m.has(c)) m.set(c, [])
    m.get(c)!.push(t)
  }
  // Cell.getId = x + (y << 16): sort by y then x, i.e. by cell index
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(e => e[1])
}

let occBuf: Uint8Array | null = null
function applyMoves(g: Game, moves: Task[]) {
  for (let p = 0; p < 2; p++) {
    const mine = moves.filter(t => t.p === p)
    if (mine.length === 0) continue
    let units = g.trolls.filter(u => u.owner === p)
    let targets = units.map(u => u.cell)
    for (const m of mine) targets[units.indexOf(m.unit!)] = m.target
    if (!occBuf || occBuf.length < g.W * g.H) occBuf = new Uint8Array(g.W * g.H)
    const occupied = occBuf
    occupied.fill(0)
    for (let i = units.length - 1; i >= 0; i--) {
      occupied[units[i].cell] = 1
      if (units[i].cell === targets[i]) {
        units.splice(i, 1)
        targets.splice(i, 1)
      }
    }
    let madeMove = true
    let resolveBlocking = false
    while (madeMove) {
      madeMove = false
      const freq = new Map<number, number>()
      for (const c of targets) freq.set(c, (freq.get(c) ?? 0) + 1)
      for (let i = units.length - 1; i >= 0; i--) {
        const c = targets[i]
        if ((resolveBlocking || freq.get(c) === 1) && !occupied[c]) {
          occupied[c] = 1
          occupied[units[i].cell] = 0
          units[i].cell = c
          units.splice(i, 1)
          targets.splice(i, 1)
          madeMove = true
          resolveBlocking = false
        }
      }
      if (madeMove) continue
      for (let start = 0; start < units.length; start++) {
        const path = [start]
        let looped = false
        for (let i = 0; i < units.length + 1; i++) {
          const target = targets[path[path.length - 1]]
          const idx = units.findIndex(u => u.cell === target)
          if (idx < 0) break
          if (idx === path[0]) {
            looped = true
            break
          }
          path.push(idx)
        }
        if (looped) {
          path.sort((a, b) => a - b)
          for (let i = path.length - 1; i >= 0; i--) {
            const idx = path[i]
            units[idx].cell = targets[idx]
            units.splice(idx, 1)
            targets.splice(idx, 1)
            madeMove = true
          }
        }
      }
      if (!madeMove && !resolveBlocking) {
        resolveBlocking = true
        madeMove = true
      }
    }
    units = []
    targets = []
  }
}

/** Plays one turn with both players' parsed tasks. */
export function step(g: Game, tasks: Task[]) {
  const by = (k: number) => tasks.filter(t => t.kind === k)
  applyMoves(g, by(A_MOVE))
  // HARVEST
  for (const grp of groupByCell(by(A_HARVEST))) {
    const tr = treeAtCell(g, grp[0].unit!.cell)!
    for (let i = 1; i <= MAX_FRUITS; i++) {
      if (tr.fruits === 0) break
      for (const t of grp) {
        const u = t.unit!
        if (i > u.harvest || sum(u.inv) >= u.carry) continue
        u.inv[tr.type]++
        if (tr.fruits > 0) tr.fruits--
      }
    }
  }
  // PLANT
  for (const grp of groupByCell(by(A_PLANT))) {
    const types = new Set(grp.map(t => t.target))
    if (types.size !== 1) continue
    for (const t of grp) {
      const u = t.unit!
      u.inv[t.target]--
      if (!treeAtCell(g, u.cell)) g.trees.push(newTree(g, t.target, u.cell))
    }
  }
  // CHOP
  for (const grp of groupByCell(by(A_CHOP))) {
    const tr = treeAtCell(g, grp[0].unit!.cell)
    if (!tr) continue
    for (const t of grp) tr.health = Math.max(tr.health - t.unit!.chop, 0)
    if (tr.health <= 0) {
      let remaining = tr.size
      for (let i = 0; i < tr.size && remaining > 0; i++)
        for (const t of grp) {
          const u = t.unit!
          if (u.carry - sum(u.inv) > 0) {
            u.inv[WOOD]++
            remaining--
          }
        }
    }
  }
  // PICK
  for (const t of by(A_PICK)) {
    if (g.inv[t.p][t.target] > 0) {
      g.inv[t.p][t.target]--
      t.unit!.inv[t.target]++
    }
  }
  // TRAIN
  for (const t of by(A_TRAIN)) {
    if (!canTrain(g, t.p, t.talents!)) continue
    if (g.trolls.some(u => u.cell === g.shack[t.p])) continue
    const n = g.trolls.filter(u => u.owner === t.p).length
    const c = trainCost(n, t.talents!)
    for (let i = 0; i < 6; i++) g.inv[t.p][i] -= c[i]
    const [speed, carry, harvest, chop] = t.talents!
    g.trolls.push({ id: g.nextId++, owner: t.p, cell: g.shack[t.p], speed, carry, harvest, chop, inv: [0, 0, 0, 0, 0, 0] })
  }
  // DROP
  for (const t of by(A_DROP)) {
    const u = t.unit!
    for (let i = 0; i < 6; i++) {
      g.inv[t.p][i] += u.inv[i]
      u.inv[i] = 0
    }
  }
  // MINE
  for (const t of by(A_MINE)) {
    const u = t.unit!
    for (let i = 0; i < u.chop && sum(u.inv) < u.carry; i++) u.inv[IRON]++
  }
  // growth
  for (const t of g.trees) if (t.health > 0) tickTree(t)
  g.trees = g.trees.filter(t => t.health > 0)
  g.turn++
  if (g.turn >= GAME_TURNS || stalled(g)) g.over = true
}

function stalled(g: Game): boolean {
  if (g.trees.length > 0) {
    g.turnsUntilEnd = 0
    const sd = [distFrom(g, g.shack[0]), distFrom(g, g.shack[1])]
    for (const u of g.trolls) {
      let onTree = false
      for (const t of g.trees) if (t.cell === u.cell) onTree = true
      if (!onTree) continue
      g.turnsUntilEnd = Math.max(g.turnsUntilEnd, Math.trunc(sd[u.owner][u.cell] / u.speed) + 6)
    }
    return false
  }
  if (--g.turnsUntilEnd <= 0) return true
  const stuck = [true, true]
  for (const u of g.trolls) if (sum(u.inv) > u.inv[IRON]) stuck[u.owner] = false
  for (let p = 0; p < 2; p++) for (let i = 0; i <= BANANA; i++) if (g.inv[p][i] > 0) stuck[p] = false
  const s = [score(g, 0), score(g, 1)]
  if (stuck[0] && stuck[1]) return true
  if (stuck[0] && s[0] < s[1]) return true
  if (stuck[1] && s[1] < s[0]) return true
  return false
}
