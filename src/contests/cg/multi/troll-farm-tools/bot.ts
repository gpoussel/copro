// Troll Farm bot: job assignment by rate (points / turns, every job ends with a DROP).
// Jobs: harvest a tree, chop a tree (co-chop to share the wood of a tree an enemy is chopping,
// raid the enemy's young trees), mine iron for training, plant a seed (carried or picked from
// the shack) on a farm cell near the shack, go home and drop. Training follows a design list.
import { BANANA, COOLDOWN, DELTA_HEALTH, FINAL_HEALTH, GRASS, IRON, IRONCELL, ITEMS, MAX_FRUITS, MAX_SIZE, WATER, WATER_BOOST, WOOD, bfs } from "./engine.js"
import { Game, nearType, parseOutput, score, step, turnInput } from "./engine.js"

// Candidate training plans, tried by full-game simulation on turn 1 (most promising first).
export const PLANS: number[][][] = [
  [[1, 2, 1, 1], [2, 4, 1, 2]],
  [[1, 2, 1, 1], [2, 4, 1, 2], [2, 4, 1, 2]],
  [[2, 4, 1, 2], [2, 4, 1, 2]],
  [[1, 2, 1, 1], [1, 2, 1, 1], [2, 4, 1, 2]],
  [[1, 2, 1, 1], [2, 3, 1, 2], [2, 3, 1, 2]],
  [[1, 2, 1, 1], [1, 2, 1, 2], [1, 2, 1, 2], [1, 2, 1, 2]],
  [[1, 2, 2, 1], [2, 4, 2, 2]],
  [[1, 1, 1, 1], [2, 4, 1, 2], [2, 4, 1, 2]],
  [[1, 2, 1, 1], [2, 3, 1, 2], [2, 4, 1, 2], [2, 4, 1, 2]],
  [[2, 3, 0, 2], [2, 4, 1, 2]],
  [[1, 2, 1, 1], [2, 3, 0, 2], [2, 4, 1, 2]],
  [[2, 3, 0, 2], [2, 3, 0, 2]],
]

/** Game state from our turn input (we are player 0). */
export function gameFromInput(init: string[], lines: string[], turnsPlayed: number): Game {
  const [W, H] = init[0].split(" ").map(Number)
  const g: Game = { W, H, grid: new Uint8Array(W * H), shack: [0, 0], inv: [], trees: [], trolls: [], nextId: 0, turn: turnsPlayed, turnsUntilEnd: 0, over: false, dead: [false, false] }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const ch = init[1 + y][x]
      const c = y * W + x
      g.grid[c] = ch === "." ? 0 : ch === "~" ? 1 : ch === "#" ? 2 : ch === "+" ? 3 : 4
      if (ch === "0") g.shack[0] = c
      if (ch === "1") g.shack[1] = c
    }
  let i = 0
  g.inv = [lines[i++].split(" ").map(Number), lines[i++].split(" ").map(Number)]
  const nt = +lines[i++]
  for (let k = 0; k < nt; k++) {
    const p = lines[i++].split(" ")
    const type = ITEMS.indexOf(p[0])
    const cell = +p[2] * W + +p[1]
    g.trees.push({ type, cell, size: +p[3], health: +p[4], fruits: +p[5], cooldown: +p[6], growth: 0 })
  }
  for (const t of g.trees) t.growth = COOLDOWN[t.type] - (nearType(g, t.cell, WATER) ? WATER_BOOST[t.type] : 0)
  const nu = +lines[i++]
  for (let k = 0; k < nu; k++) {
    const v = lines[i++].split(" ").map(Number)
    g.trolls.push({ id: v[0], owner: v[1], cell: v[3] * W + v[2], speed: v[4], carry: v[5], harvest: v[6], chop: v[7], inv: v.slice(8, 14) })
    g.nextId = Math.max(g.nextId, v[0] + 1)
  }
  return g
}

/** Our bot playing on from `g` against a passive opponent, resumable across turns (stepped until
 *  a deadline). Selecting training plans this way works as well as with a full opponent, at half
 *  the cost. */
export class Sim {
  g: Game
  a: Bot
  horizon = 150
  b: Bot | null = null
  constructor(g: Game, init: string[], mine: Params, dist: Int16Array[], theirs?: Params) {
    this.g = g
    g.dist = dist
    this.a = new Bot(init, mine, true, dist)
    this.a.turnNo = g.turn
    if (theirs) {
      const oppInit = [init[0], ...init.slice(1).map(r => r.replace(/[01]/g, ch => (ch === "0" ? "1" : "0")))]
      this.b = new Bot(oppInit, theirs, true, dist)
      this.b.turnNo = g.turn
    }
  }
  /** Runs until the horizon (returns the value reached) or the deadline (returns null). */
  run(deadline: number): number | null {
    const g = this.g
    while (!g.over && g.turn < this.horizon) {
      if (performance.now() > deadline) return null
      const oa = this.a.turnGame(g)
      const tasks = parseOutput(g, 0, oa, () => 0).tasks
      if (this.b) tasks.push(...parseOutput(g, 1, this.b.turn(turnInput(g, 1)), () => 0).tasks)
      step(g, tasks)
    }
    // score + what our trolls carry (wood 4, fruits 1)
    const val = (p: number) => {
      let v = score(g, p)
      for (const u of g.trolls) if (u.owner === p) v += 4 * u.inv[WOOD] + u.inv[0] + u.inv[1] + u.inv[2] + u.inv[3]
      return v
    }
    return this.b ? val(0) - val(1) : val(0)
  }
}

export interface BTree {
  type: number
  cell: number
  size: number
  health: number
  fruits: number
  cooldown: number
  growth: number
}
export interface BTroll {
  id: number
  mine: boolean
  cell: number
  speed: number
  carry: number
  harvest: number
  chop: number
  inv: number[]
  load: number
}

export interface Params {
  plan: number[][]
  choosePlan: boolean
  planBudget: number
  planTurnBudget: number
  planTurns: number
  planAll: boolean // evaluate every plan on turn 1 whatever the time (deterministic local tests)
  stick: number
  trainDeadline: number
  plantGamma: number
  sourceValue: number
  farmPerChopper: number
  raidBeta: number
  trainBonus: number
  trollValue: number
  unitMax: number
  seedBonus: number
  denyAlpha: number
  maxWait: number
  patience: number
  patienceRaided: number
  aggro: number // sparring variants: extra value for chopping trees near the enemy shack
  guard: number // enemy chopper this many turns from one of our trees: fell it now (0 = off)
  guardRaided: number // the same once an enemy was seen on one of our trees (last 40 turns)
  wasteLambda: number
}
export const DEFAULT_PARAMS: Params = {
  plan: [
    [1, 2, 1, 1],
    [2, 4, 1, 2],
  ],
  choosePlan: true,
  planBudget: 700,
  planTurnBudget: 30,
  planTurns: 12,
  planAll: false,
  stick: 1.3,
  trainDeadline: 180,
  plantGamma: 0.5,
  sourceValue: 12,
  farmPerChopper: 3,
  raidBeta: 0.5,
  trainBonus: 3,
  trollValue: 50,
  unitMax: 12,
  seedBonus: 1,
  denyAlpha: 0.5,
  maxWait: 12,
  patience: 40,
  patienceRaided: 40,
  aggro: 0,
  guard: 0,
  guardRaided: 0,
  wasteLambda: 0.7,
}

interface Job {
  u: BTroll
  rate: number
  dest: number // cell to reach (-1: act here)
  act: string // action when at dest
  tree?: BTree
  kind: string
}

export class Bot {
  W: number
  H: number
  N: number
  grid: Uint8Array
  shack = -1
  oppShack = -1
  dist: Int16Array[] = []
  dropCells: number[] = []
  dropDist: Int16Array
  oppDropDist: Int16Array
  mineCells: number[] = []
  mineDist: Int16Array
  nearWater: Uint8Array
  turnNo = 0
  P: Params
  seat = 0
  planted = new Set<number>() // cells where we planted
  cost: number[] | null = null
  farmAll: number[] = []
  designs: number[][] = []
  planRef: number[][] | null = null
  targetSince = 0
  lastK = 0
  raidSeen = -1000
  prev = new Map<number, { kind: string; dest: number }>() // troll id -> last job
  seedIntent = new Map<number, number>() // troll id -> fruit type it picked to plant
  intentSince = new Map<number, number>()
  log: string[] = []

  init: string[]
  sim: boolean
  planScores: string = ""
  dbg = 0

  constructor(init: string[], params: Params = DEFAULT_PARAMS, sim = false, dist?: Int16Array[]) {
    this.P = params
    this.init = init
    this.sim = sim
    if (!sim && typeof process !== "undefined") this.dbg = Number(process.env.DBG ?? 0)
    const [W, H] = init[0].split(" ").map(Number)
    this.W = W
    this.H = H
    this.N = W * H
    this.grid = new Uint8Array(this.N)
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const ch = init[1 + y][x]
        const c = y * W + x
        this.grid[c] = ch === "." ? GRASS : ch === "~" ? WATER : ch === "#" ? 2 : ch === "+" ? IRONCELL : 4
        if (ch === "0") this.shack = c
        if (ch === "1") this.oppShack = c
      }
    if (dist) this.dist = dist
    else for (let c = 0; c < this.N; c++) this.dist.push(bfs(this, [c]))
    for (const n of this.nbrs(this.shack)) if (this.grid[n] === GRASS) this.dropCells.push(n)
    this.dropDist = bfs(this, this.dropCells)
    const od = this.nbrs(this.oppShack).filter(n => this.grid[n] === GRASS)
    this.oppDropDist = bfs(this, od)
    for (let c = 0; c < this.N; c++)
      if (this.grid[c] === GRASS && this.nbrs(c).some(n => this.grid[n] === IRONCELL)) this.mineCells.push(c)
    this.mineDist = bfs(this, this.mineCells)
    this.nearWater = new Uint8Array(this.N)
    for (let c = 0; c < this.N; c++) if (this.nbrs(c).some(n => this.grid[n] === WATER)) this.nearWater[c] = 1
    // farm cells: grass near our shack, clearly on our side
    for (let c = 0; c < this.N; c++) {
      if (this.grid[c] !== GRASS || this.dropDist[c] > 2 || this.dropDist[c] < 0) continue
      if (this.oppDropDist[c] >= 0 && this.oppDropDist[c] <= this.dropDist[c] + 2) continue
      this.farmAll.push(c)
    }
    this.farmAll.sort((a, b) => this.dropDist[a] * 2 - this.nearWater[a] * 2 - (this.dropDist[b] * 2 - this.nearWater[b] * 2))
  }

  nbrs(c: number): number[] {
    const x = c % this.W
    const r: number[] = []
    if (c + this.W < this.N) r.push(c + this.W)
    if (x + 1 < this.W) r.push(c + 1)
    if (c - this.W >= 0) r.push(c - this.W)
    if (x > 0) r.push(c - 1)
    return r
  }

  xy(c: number) {
    return `${c % this.W} ${Math.floor(c / this.W)}`
  }

  steps(u: BTroll, d: number) {
    return d < 0 ? 999 : Math.ceil(d / u.speed)
  }

  /** Tree state after `t` growth ticks. */
  predict(tr: BTree, t: number) {
    let { size, health, fruits, cooldown } = tr
    for (let i = 0; i < t; i++) {
      if (cooldown > 0) cooldown--
      if (cooldown === 0 && health > 0) {
        if (size < MAX_SIZE) {
          size++
          health += DELTA_HEALTH[tr.type]
          cooldown = tr.growth
        } else if (fruits < MAX_FRUITS) {
          fruits++
          cooldown = tr.growth
        } else break
      }
    }
    return { size, health, fruits, cooldown }
  }

  /** Growth ticks until the tree reaches full size (0 if already there). */
  turnsToFull(tr: BTree): number {
    if (tr.size >= MAX_SIZE) return 0
    return (tr.cooldown === 0 ? 1 : tr.cooldown) + (MAX_SIZE - 1 - tr.size) * tr.growth
  }

  /** Turns of chopping (by `power` per turn, the tree growing in between) and the size at death. */
  chopTime(tr: BTree, arrive: number, power: number) {
    let { size, health, cooldown } = this.predict(tr, arrive)
    for (let k = 1; k <= 30; k++) {
      health -= power
      if (health <= 0) return { k, size }
      if (cooldown > 0) cooldown--
      if (cooldown === 0 && size < MAX_SIZE) {
        size++
        health += DELTA_HEALTH[tr.type]
        cooldown = tr.growth
      } else if (cooldown === 0) cooldown = tr.growth
    }
    return { k: 99, size }
  }

  // Training-plan selection: every candidate plan is played out from the turn-1 state (resumable
  // across the first turns, CodinGame being slower than a local run); no training until decided.
  planLines: string[] | null = null
  planIdx = 0
  planSim: Sim | null = null
  planBest = -1e9
  planPending = false
  planLog: string[] = []

  evalPlans(budgetMs: number) {
    const t0 = performance.now()
    while (this.planIdx < PLANS.length) {
      if (!this.planSim) this.planSim = new Sim(gameFromInput(this.init, this.planLines!, 0), this.init, { ...this.P, plan: PLANS[this.planIdx] }, this.dist)
      const v = this.planSim.run(t0 + budgetMs)
      if (v === null) break
      this.planLog.push(`${this.planIdx}:${v}`)
      if (v > this.planBest) {
        this.planBest = v
        this.P = { ...this.P, plan: PLANS[this.planIdx] }
      }
      this.planSim = null
      this.planIdx++
    }
    this.planPending = this.planIdx < PLANS.length && this.turnNo < this.P.planTurns
    this.planScores = `t${this.turnNo} ${this.planLog.join(" ")} (${(performance.now() - t0).toFixed(0)} ms)${this.planPending ? " pending" : ""}`
  }

  turn(lines: string[]): string {
    let li = 0
    const inv = lines[li++].split(" ").map(Number)
    li++ // opponent inventory
    const nt = parseInt(lines[li++])
    const trees: BTree[] = []
    for (let i = 0; i < nt; i++) {
      const p = lines[li++].split(" ")
      const type = ITEMS.indexOf(p[0])
      const cell = +p[2] * this.W + +p[1]
      trees.push({ type, cell, size: +p[3], health: +p[4], fruits: +p[5], cooldown: +p[6], growth: COOLDOWN[type] - (this.nearWater[cell] ? WATER_BOOST[type] : 0) })
    }
    const nu = parseInt(lines[li++])
    const trolls: BTroll[] = []
    for (let i = 0; i < nu; i++) {
      const v = lines[li++].split(" ").map(Number)
      const u: BTroll = { id: v[0], mine: v[1] === 0, cell: v[3] * this.W + v[2], speed: v[4], carry: v[5], harvest: v[6], chop: v[7], inv: v.slice(8, 14), load: 0 }
      u.load = u.inv[0] + u.inv[1] + u.inv[2] + u.inv[3] + u.inv[4] + u.inv[5]
      trolls.push(u)
    }
    if (this.turnNo === 0 && !this.sim && this.P.choosePlan) {
      this.planLines = lines
      this.planPending = true
    }
    return this.decide(inv, trees, trolls)
  }

  /** Same as turn() for player 0 of an engine state (simulations skip the text round trip). */
  turnGame(g: Game): string {
    const trees: BTree[] = g.trees.map(t => ({ type: t.type, cell: t.cell, size: t.size, health: t.health, fruits: t.fruits, cooldown: t.cooldown, growth: t.growth }))
    const trolls: BTroll[] = g.trolls.map(u => ({ id: u.id, mine: u.owner === 0, cell: u.cell, speed: u.speed, carry: u.carry, harvest: u.harvest, chop: u.chop, inv: u.inv.slice(), load: u.inv[0] + u.inv[1] + u.inv[2] + u.inv[3] + u.inv[4] + u.inv[5] }))
    return this.decide(g.inv[0].slice(), trees, trolls)
  }

  decide(inv: number[], trees: BTree[], trolls: BTroll[]): string {
    this.turnNo++
    if (this.planPending) this.evalPlans(this.P.planAll ? 1e9 : this.turnNo === 1 ? this.P.planBudget : this.P.planTurnBudget)
    const P = this.P
    const treeAt = new Map<number, BTree>()
    for (const t of trees) treeAt.set(t.cell, t)
    const mine: BTroll[] = []
    const opp: BTroll[] = []
    for (const u of trolls) (u.mine ? mine : opp).push(u)
    for (const c of [...this.planted]) if (!treeAt.has(c)) this.planted.delete(c)
    for (const [id, t] of [...this.seedIntent]) {
      const u = mine.find(x => x.id === id)
      if (!u || u.inv[t] === 0 || this.turnNo - (this.intentSince.get(id) ?? 0) > 8) this.seedIntent.delete(id)
    }
    const left = 301 - this.turnNo // actions left including this one
    const out: string[] = []
    const dbg = this.dbg

    // ------------------------------------------------------------ training
    const k = mine.length
    const stock = inv.slice()
    let target: number[] | null = null
    let trainNow: number[] | null = null
    if (this.planRef !== P.plan) {
      this.designs = P.plan.map(d => d.slice())
      this.planRef = P.plan
      this.targetSince = this.turnNo
    }
    if (this.lastK !== k) {
      this.lastK = k
      this.targetSince = this.turnNo
    }
    const designs = this.designs
    if (k - 1 < designs.length && this.turnNo < P.trainDeadline && !this.planPending) {
      let d = designs[k - 1]
      let cost = [k + d[0] * d[0], k + d[1] * d[1], k + d[2] * d[2], 0, k + d[3] * d[3]]
      // out of reach for too long (enemy raids, scarce fruit): settle for a cheaper troll
      const patience = this.turnNo - this.raidSeen <= 40 ? P.patienceRaided : P.patience
      if (this.turnNo - this.targetSince > patience && !cost.every((c, i) => stock[i] >= c)) {
        this.targetSince += patience / 2
        const attr = [0, 1, 2, 4] // stock index per attribute
        const minV = [1, 1, 0, 1]
        let bi = -1
        let bd = 0
        for (let a = 0; a < 4; a++) {
          const def = cost[attr[a]] - stock[attr[a]]
          if (d[a] > minV[a] && def > bd) (bd = def), (bi = a)
        }
        if (bi < 0) designs.length = k - 1
        else {
          d = d.slice()
          d[bi]--
          designs[k - 1] = d
          cost = [k + d[0] * d[0], k + d[1] * d[1], k + d[2] * d[2], 0, k + d[3] * d[3]]
        }
      }
      if (k - 1 >= designs.length) this.cost = null
      else if (cost.every((c, i) => stock[i] >= c)) {
        trainNow = d
        for (let i = 0; i < 5; i++) stock[i] -= cost[i]
        // the next design's needs start now
        if (k < designs.length) {
          const d2 = designs[k]
          const c2 = [k + 1 + d2[0] ** 2, k + 1 + d2[1] ** 2, k + 1 + d2[2] ** 2, 0, k + 1 + d2[3] ** 2]
          target = d2
          this.cost = c2
        } else this.cost = null
      } else {
        target = d
        this.cost = cost
      }
    } else this.cost = null
    const need = [0, 0, 0, 0, 0]
    const reserve = [0, 0, 0, 0, 0]
    if (target && this.cost) for (let i = 0; i < 5; i++) {
      need[i] = Math.max(0, this.cost[i] - stock[i])
      reserve[i] = this.cost[i]
    }
    const pickable = [0, 1, 2, 3].map(i => Math.max(0, stock[i] - reserve[i]))

    // ------------------------------------------------------------ values
    const ownTree = (t: BTree) => this.dropDist[t.cell] >= 0 && (this.oppDropDist[t.cell] < 0 || this.dropDist[t.cell] < this.oppDropDist[t.cell])
    // raid detection: an enemy troll standing on one of our trees (it chops them)
    if (opp.some(o => o.chop > 0 && treeAt.has(o.cell) && ownTree(treeAt.get(o.cell)!))) this.raidSeen = this.turnNo
    const guard = this.turnNo - this.raidSeen <= 40 ? P.guardRaided : P.guard
    const scoreVal = [1, 1, 1, 1]
    // a missing training resource is worth a share of the troll it completes (the scarcest one
    // ends up the most valuable, whatever it is)
    const deficit = need.reduce((a, b) => a + b, 0)
    const unitVal = deficit > 0 ? Math.min(P.unitMax, Math.max(P.trainBonus, P.trollValue / deficit)) : 0
    for (let i = 0; i < 4; i++) if (need[i] > 0) scoreVal[i] += unitVal
    const fruitVal = scoreVal.slice()
    const plantOk = (type: number, cell: number, extra: number) => {
      const g = COOLDOWN[type] - (this.nearWater[cell] ? WATER_BOOST[type] : 0)
      const grow = 1 + 3 * g
      return this.turnNo + extra + grow + Math.ceil(FINAL_HEALTH[type] / 2) + 4 < 300
    }
    const choppers = mine.filter(u => u.chop >= 2 && u.carry >= 3).length
    // farm cells: near the shack, free
    const oppNear = (c: number, r: number) => opp.some(o => this.dist[o.cell][c] >= 0 && this.dist[o.cell][c] <= r)
    const farmCells = this.farmAll.filter(c => !treeAt.has(c))
    const farmTrees = trees.filter(t => this.dropDist[t.cell] >= 0 && this.dropDist[t.cell] <= 2 && this.dropDist[t.cell] < this.oppDropDist[t.cell])
    const farmTarget = 2 + P.farmPerChopper * choppers
    let farmMissing = farmTarget - farmTrees.length
    // plant wishes: training-fruit sources first (while trolls remain to train), then farm trees
    const wanted: { type: number; value: number; source: boolean }[] = []
    if (target)
      for (const f of [1, 0, 2]) {
        const have = trees.filter(t => t.type === f && ownTree(t) && this.dropDist[t.cell] <= 3).length
        const want = need[f] >= 10 ? 2 : need[f] >= 4 ? 1 : 0
        if (have < want && stock[f] > 0) wanted.push({ type: f, value: P.sourceValue, source: true })
      }
    if (farmMissing > 0)
      for (const f of [BANANA, 0, 1, 2]) if (need[f] === 0) wanted.push({ type: f, value: 16 * P.plantGamma, source: false })
    if (dbg && this.turnNo >= dbg && this.turnNo < dbg + 3) console.log("  wanted", JSON.stringify(wanted), "farmCells", farmCells.length, "need", need, "stock", stock)
    const seedsAvail = pickable.reduce((a, b) => a + b, 0)
    for (let i = 0; i < 4; i++) if (farmMissing > seedsAvail) fruitVal[i] += P.seedBonus

    const carriedValue = (u: BTroll) => {
      let v = 4 * u.inv[WOOD]
      const intent = this.seedIntent.get(u.id) ?? -1
      for (let i = 0; i < 4; i++) v += (u.inv[i] - (i === intent ? 1 : 0)) * scoreVal[i]
      v += need[4] > 0 ? Math.min(u.inv[IRON], need[4]) * unitVal + Math.max(0, u.inv[IRON] - need[4]) * 0.5 : u.inv[IRON] * 0.5
      return v
    }

    // ------------------------------------------------------------ jobs
    const jobsFor = (u: BTroll): Job[] => {
      const jobs: Job[] = []
      const free = u.carry - u.load
      const cv = carriedValue(u)
      const home = (c: number) => this.steps(u, this.dropDist[c]) + 1
      const dNow = this.dist[u.cell]
      // go home and drop
      const atShack = this.dropDist[u.cell] === 0 || u.cell === this.shack
      if (u.load > 0 && cv > 0) {
        if (atShack) jobs.push({ u, rate: cv, dest: -1, act: `DROP ${u.id}`, kind: "drop" })
        else
          for (const c of this.dropCells) {
            const r = this.steps(u, dNow[c]) + 1
            if (r <= left) jobs.push({ u, rate: cv / r, dest: c, act: `DROP ${u.id}`, kind: "drop" })
          }
      }
      if (free > 0) {
        for (const tr of trees) {
          const d = dNow[tr.cell]
          if (d < 0) continue
          const a = this.steps(u, d)
          const r = home(tr.cell)
          const enemies = opp.filter(o => o.cell === tr.cell)
          // harvest
          if (u.harvest > 0) {
            const f = this.predict(tr, a).fruits
            const g = Math.min(f, free)
            if (g > 0) {
              const ht = Math.ceil(g / u.harvest)
              const T = a + ht + r
              if (T <= left) jobs.push({ u, rate: (cv + g * fruitVal[tr.type]) / T, dest: tr.cell, act: `HARVEST ${u.id}`, tree: tr, kind: "harvest" })
            }
          }
          // chop
          if (u.chop > 0) {
            const eChop = enemies.reduce((s, o) => s + o.chop, 0)
            const own = ownTree(tr)
            const endgame = left < 40
            let wait = 0
            // an enemy chopper about to reach our tree: fell it first rather than lose it
            const threatened = guard > 0 && own && enemies.length === 0 && opp.some(o => o.chop > 0 && o.carry > o.load && this.dist[o.cell][tr.cell] >= 0 && this.steps(o, this.dist[o.cell][tr.cell]) <= guard)
            if (own && enemies.length === 0 && !endgame && tr.size < MAX_SIZE && !threatened) {
              // our growing tree: be there when it reaches full size
              const tm = this.turnsToFull(tr)
              if (tm > P.maxWait) continue
              wait = Math.max(0, tm - a)
            }
            let target = tr
            if (enemies.length > 0 && a > 0) {
              // the enemy keeps chopping while we walk: useless if it is felled before we arrive
              if (a >= this.chopTime(tr, 0, eChop).k) continue
              target = { ...tr, health: tr.health - eChop * a }
            }
            const { k: kk, size } = this.chopTime(target, a + wait, u.chop + eChop)
            const T = a + wait + kk + r
            if (T > left) continue
            let share = size
            if (enemies.length > 0) share = Math.ceil(size / (1 + enemies.length))
            const wood = Math.min(share, free)
            let value = 4 * wood
            const sizeNow = this.predict(tr, a).size
            if (enemies.length > 0) value += 4 * P.denyAlpha * share
            else if (!own && sizeNow < MAX_SIZE) value += 4 * P.raidBeta * (MAX_SIZE - sizeNow)
            if (P.aggro > 0 && this.oppDropDist[tr.cell] >= 0 && this.oppDropDist[tr.cell] < 6) value += P.aggro * (6 - this.oppDropDist[tr.cell])
            // wood we cannot carry is lost (fine on the enemy's side: that is denial)
            if (enemies.length === 0 && (own || this.dropDist[tr.cell] <= this.oppDropDist[tr.cell])) value -= P.wasteLambda * 4 * Math.max(0, size - wood)
            if (value <= 0) continue
            if (!endgame && own && need[tr.type] > 0 && enemies.length === 0 && !threatened) continue
            const act = wait > 0 && d === 0 ? "" : `CHOP ${u.id}`
            jobs.push({ u, rate: (cv + value) / T, dest: tr.cell, act, tree: tr, kind: "chop" })
          }
        }
        // mine
        if (u.chop > 0 && need[4] > 0) {
          const m = Math.min(free, need[4])
          for (const c of this.mineCells) {
            if (dNow[c] < 0) continue
            const T = this.steps(u, dNow[c]) + Math.ceil(m / u.chop) + home(c)
            if (T <= left) jobs.push({ u, rate: (cv + unitVal * m) / T, dest: c === u.cell ? -1 : c, act: `MINE ${u.id}`, kind: "mine" })
          }
        }
      }
      // plant a carried seed / pick one at the shack
      if ((wanted.length > 0 || this.seedIntent.has(u.id)) && farmCells.length > 0) {
        let seed = -1
        let pick = false
        const intent = this.seedIntent.get(u.id)
        if (intent !== undefined) seed = intent
        else
          for (const w of wanted)
            if (u.inv[w.type] > 0) {
              seed = w.type
              break
            }
        if (seed < 0 && free > 0)
          for (const w of wanted)
            if ((w.source ? stock[w.type] : pickable[w.type]) > 0) {
              seed = w.type
              pick = true
              break
            }
        if (seed >= 0) {
          const w = wanted.find(x => x.type === seed) ?? { type: seed, value: 16 * P.plantGamma, source: false }
          const toShack = pick ? (atShack ? 1 : this.steps(u, this.dropDist[u.cell]) + 1) : 0
          let bestRate = -1
          let bestCell = -1
          for (const c of farmCells) {
            if (oppNear(c, 3)) continue
            const dd = pick ? this.dist[c][this.bestDropFor(c)] : dNow[c]
            const T = toShack + this.steps(u, dd) + 1
            if (!plantOk(seed, c, T)) continue
            const g = COOLDOWN[seed] - (this.nearWater[c] ? WATER_BOOST[seed] : 0)
            const value = w.value * (w.source ? 8 / g : 1) - scoreVal[seed]
            if (value <= 0) continue
            const rate = value / T
            if (rate > bestRate) {
              bestRate = rate
              bestCell = c
            }
          }
          if (bestCell >= 0) {
            if (!pick) jobs.push({ u, rate: bestRate, dest: bestCell, act: `PLANT ${u.id} ${ITEMS[seed]}`, kind: "plant" })
            else if (atShack) jobs.push({ u, rate: bestRate, dest: -1, act: `PICK ${u.id} ${ITEMS[seed]}`, kind: "pick" })
            else for (const dc of this.dropCells) if (dNow[dc] >= 0) jobs.push({ u, rate: bestRate * (1 - 0.05 * dNow[dc]), dest: dc, act: `PICK ${u.id} ${ITEMS[seed]}`, kind: "pick" })
          }
        }
      }
      // a troll that picked a seed plants it (it would drop it with anything else it gathers)
      if (this.seedIntent.has(u.id) && jobs.some(j => j.kind === "plant")) return jobs.filter(j => j.kind === "plant")
      return jobs
    }

    // greedy assignment
    const assigned = new Map<number, Job>()
    const claimedHarvest = new Map<BTree, number>()
    const claimedChop = new Set<BTree>()
    const all: Job[] = []
    for (const u of mine) all.push(...jobsFor(u))
    for (const j of all) {
      const pv = this.prev.get(j.u.id)
      if (pv && pv.dest === j.dest && pv.kind === j.kind) j.rate *= P.stick
    }
    all.sort((a, b) => b.rate - a.rate)
    if (dbg && this.turnNo >= dbg && this.turnNo < dbg + 3)
      for (const u of mine) console.log(`  T${this.turnNo} troll ${u.id}@${this.xy(u.cell)} inv ${u.inv}: ` + all.filter(j => j.u === u).slice(0, 6).map(j => `${j.kind}:${j.dest >= 0 ? this.xy(j.dest) : "here"}:${j.rate.toFixed(2)}`).join(" "))
    let pickedSeeds = 0
    const endCell = new Map<number, number>() // final cell -> troll id
    for (const j of all) {
      if (assigned.has(j.u.id)) continue
      const fin = j.dest < 0 ? j.u.cell : j.dest
      if (endCell.has(fin) && endCell.get(fin) !== j.u.id) continue
      // a destination held by another of our trolls: only once that troll is known to leave it
      if (j.dest >= 0 && j.dest !== j.u.cell) {
        const holder = mine.find(o => o !== j.u && o.cell === j.dest)
        if (holder) {
          const hj = assigned.get(holder.id)
          if (!hj || hj.dest < 0 || hj.dest === holder.cell) continue
        }
      }
      if (j.kind === "harvest" && j.tree) {
        const taken = claimedHarvest.get(j.tree) ?? 0
        if (taken >= j.tree.fruits + 1) continue
        claimedHarvest.set(j.tree, taken + Math.min(j.u.carry - j.u.load, 3))
      }
      if (j.kind === "chop" && j.tree) {
        if (claimedChop.has(j.tree) && !opp.some(o => o.cell === j.tree!.cell)) continue
        claimedChop.add(j.tree)
      }
      if (j.kind === "pick") {
        if (pickedSeeds >= wanted.length + Math.max(0, farmMissing - 1)) continue
        pickedSeeds++
      }
      assigned.set(j.u.id, j)
      endCell.set(fin, j.u.id)
      this.prev.set(j.u.id, { kind: j.kind, dest: j.dest })
    }
    void farmMissing

    // ------------------------------------------------------------ moves
    const reserved = new Set<number>()
    const acts: [BTroll, string][] = []
    const movers: [BTroll, number][] = []
    for (const u of mine) {
      const j = assigned.get(u.id)
      if (!j) {
        if (u.cell === this.shack) movers.push([u, this.dropCells[0] ?? u.cell])
        else reserved.add(u.cell)
        continue
      }
      if (j.dest < 0 || j.dest === u.cell) {
        if (u.cell === this.shack && trainNow && j.kind !== "drop" && j.kind !== "pick") movers.push([u, this.dropCells[0]])
        else {
          acts.push([u, j.act])
          reserved.add(u.cell)
        }
      } else movers.push([u, j.dest])
    }
    // a troll on the shack blocks training: move it out
    for (const [u, dest] of movers) {
      const c = this.stepToward(u, dest, reserved)
      reserved.add(c)
      if (c !== u.cell) out.push(`MOVE ${u.id} ${this.xy(c)}`)
    }
    for (const [u, a] of acts) {
      if (a === "") continue
      out.push(a)
      if (a.startsWith("PICK")) {
        this.seedIntent.set(u.id, ITEMS.indexOf(a.split(" ")[2]))
        this.intentSince.set(u.id, this.turnNo)
      }
    }
    if (trainNow) {
      const shackFree = !mine.some(u => u.cell === this.shack && !movers.some(m => m[0] === u))
      if (shackFree) out.push(`TRAIN ${trainNow.join(" ")}`)
    }
    return out.length ? out.join(";") : "WAIT"
  }

  bestDrop(u: BTroll): number {
    let best = this.dropCells[0]
    for (const c of this.dropCells) if (this.dist[u.cell][c] >= 0 && this.dist[u.cell][c] < this.dist[u.cell][best]) best = c
    return best
  }

  bestDropFor(cell: number): number {
    let best = this.dropCells[0]
    for (const c of this.dropCells) if (this.dist[cell][c] >= 0 && this.dist[cell][c] < this.dist[cell][best]) best = c
    return best
  }

  /** The cell within `speed` steps closest to `dest`, not reserved by another of our trolls. */
  stepToward(u: BTroll, dest: number, reserved: Set<number>): number {
    const d = this.dist[u.cell]
    const td = this.dist[dest]
    let best = u.cell
    let bestD = reserved.has(u.cell) ? 1e9 : td[u.cell] < 0 ? 1e8 : td[u.cell]
    for (let c = 0; c < this.N; c++) {
      if (this.grid[c] !== GRASS || d[c] < 0 || d[c] > u.speed || reserved.has(c)) continue
      const v = td[c] < 0 ? 1e8 : td[c]
      if (v < bestD || (v === bestD && d[c] < d[best])) {
        bestD = v
        best = c
      }
    }
    return best
  }
}
