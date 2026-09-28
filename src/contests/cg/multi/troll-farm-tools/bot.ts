// Troll Farm bot: job assignment by rate (points / turns, every job ends with a DROP).
// Jobs: harvest a tree, chop a tree (co-chop to share the wood of a tree an enemy is chopping,
// raid the enemy's young trees), mine iron for training, plant a seed (carried or picked from
// the shack) on a farm cell near the shack, go home and drop. Training follows a design list.
import { BANANA, COOLDOWN, DELTA_HEALTH, FINAL_HEALTH, GRASS, IRON, IRONCELL, ITEMS, MAX_FRUITS, MAX_SIZE, WATER, WATER_BOOST, WOOD, bfs } from "./engine.js"
import { Game, nearType, parseOutput, score, step } from "./engine.js"
import { Boss5 } from "./boss5.js"

export const AUTO = [-1, -1, -1, -1]
// Chopper designs by utility (carry first: wood comes 4 per tree), for the AUTO design.
const AUTO_DESIGNS: number[][] = []
for (let sp = 1; sp <= 3; sp++)
  for (let c = 2; c <= 4; c++)
    for (let h = 0; h <= 1; h++) for (let cp = 2; cp <= 3; cp++) AUTO_DESIGNS.push([sp, c, h, cp])
AUTO_DESIGNS.sort((a, b) => 3 * b[1] + 2.5 * b[0] + 2 * b[3] + b[2] - (3 * a[1] + 2.5 * a[0] + 2 * a[3] + a[2]))

// Candidate training plans, tried by full-game simulation on turn 1 (most promising first).
// Plans whose first troll is a chopper (Gold opponents raid from turn 1).
export const CUTTER_PLANS: number[][][] = [
  [AUTO, [2, 4, 1, 2], [3, 4, 0, 3]],
  [[2, 4, 1, 2], [2, 4, 1, 2]],
  [[2, 3, 0, 2], [2, 3, 0, 2]],
  [AUTO, [2, 4, 1, 2]],
  [[2, 2, 0, 2], [2, 4, 1, 2], [3, 4, 0, 3]],
  [[2, 3, 0, 2], [2, 4, 1, 2], [3, 4, 0, 3]],
]
export const PLANS: number[][][] = [
  [[2, 2, 2, 1], [2, 4, 1, 2], [3, 4, 0, 3]],
  [[1, 2, 1, 1], [2, 4, 1, 2], [2, 4, 1, 2]],
  [[2, 4, 1, 2], [2, 4, 1, 2]],
  [[1, 2, 1, 1], [2, 3, 0, 2], [2, 4, 1, 2]],
  [[2, 3, 0, 2], [2, 3, 0, 2]],
  [[1, 2, 1, 1], [2, 3, 1, 2], [2, 3, 1, 2]],
  [AUTO, [2, 4, 1, 2], [3, 4, 0, 3]],
]
// Legend-style plans (delineate, bl4sterino): 3–5 big trolls (carry 4, chop 3), trained until ~t210.
export const BIG_PLANS: number[][][] = [
  [[2, 4, 1, 1], [2, 4, 1, 3], [2, 4, 1, 3]],
  [[2, 4, 2, 2], [3, 4, 2, 3], [3, 4, 2, 3], [3, 4, 1, 3]],
  [[2, 2, 2, 2], [3, 4, 1, 3], [3, 4, 1, 3], [2, 4, 0, 3]],
  [[2, 1, 1, 3], [2, 3, 1, 2], [2, 4, 1, 3]],
  [[3, 4, 1, 2], [3, 4, 2, 3], [3, 4, 0, 3]],
  [[2, 2, 2, 1], [3, 4, 2, 3], [3, 4, 0, 3], [3, 4, 0, 3]],
]

// PLANS + BIG_PLANS by solo average on bench maps (fixed plan, no re-plan: 463 … 318), the four
// weakest dropped: CodinGame evaluates only ~8 plans before training has to start.
export const RANKED_PLANS = [7, 9, 8, 11, 12, 0, 2, 6, 3].map(i => [...PLANS, ...BIG_PLANS][i])

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
  b: Bot | Boss5 | null = null
  constructor(g: Game, init: string[], mine: Params, dist: Int16Array[], theirs?: Params | "boss5") {
    this.g = g
    g.dist = dist
    this.a = new Bot(init, mine, true, dist)
    this.a.turnNo = g.turn
    if (theirs) {
      const oppInit = [init[0], ...init.slice(1).map(r => r.replace(/[01]/g, ch => (ch === "0" ? "1" : "0")))]
      this.b = theirs === "boss5" ? new Boss5(oppInit, dist) : new Bot(oppInit, theirs, true, dist)
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
      if (this.b) tasks.push(...parseOutput(g, 1, this.b.turnGame(g, 1), () => 0).tasks)
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

const NO_TROLLS: BTroll[] = []

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
  bigPlans: boolean
  futureNeed: boolean // training fruits valued / sourced for the whole remaining plan, not just the next troll
  futureVal: number
  earlySources: number // before this turn, plant one lemon / plum / apple source by the shack while in stock (0: off)
  trollRate: number // a troll to train is worth this many points per turn left (0: flat trollValue)
  planAll: boolean // evaluate every plan on turn 1 whatever the time (deterministic local tests)
  simOpp: Partial<Params> | "boss5" | null // opponent model in plan simulations (null = passive)
  simHorizon: number
  turnLimit: number // total ms per turn aimed at: simulations get what the rest of decide() leaves (0: off)
  replanHorizon: number // turns simulated ahead by a re-plan (0: simHorizon)
  replan: boolean
  replanMargin: number
  replanEvery: number
  ripeByCarry: boolean
  noFarmExposed: boolean
  maxSources: number
  raidNoWait: boolean
  chopperNow: boolean
  chopperCarry: number
  counterRaid: boolean
  raidUntil: number
  raidAggro: number
  raidLemon: number
  patienceFirst: number
  cutterPlans: boolean
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
  seedValue: number
  producers: number
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
  planBudget: 800,
  planTurnBudget: 34,
  planTurns: 12,
  planAll: false,
  bigPlans: true,
  futureNeed: false,
  futureVal: 2,
  trollRate: 0,
  earlySources: 60,
  simOpp: null,
  simHorizon: 200,
  replanHorizon: 0,
  turnLimit: 36,
  replan: true,
  replanMargin: 10,
  replanEvery: 15,
  ripeByCarry: false,
  noFarmExposed: true,
  maxSources: 2,
  raidNoWait: true,
  chopperNow: true,
  chopperCarry: 2,
  counterRaid: false,
  raidUntil: 160,
  raidAggro: 8,
  raidLemon: 6,
  patienceFirst: 25,
  cutterPlans: false,
  stick: 1.3,
  trainDeadline: 220,
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
  seedValue: 6,
  producers: 2,
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
  trainTurns: number[] = []
  sourcesPlanted = [0, 0, 0, 0]
  profile: "unknown" | "raider" | "eco" = "unknown"
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

  /** Growth ticks until the tree reaches `size` (0 if already there). */
  turnsToSize(tr: BTree, size: number): number {
    if (tr.size >= size) return 0
    return (tr.cooldown === 0 ? 1 : tr.cooldown) + (size - 1 - tr.size) * tr.growth
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
    const PL = this.P.cutterPlans ? CUTTER_PLANS : this.P.bigPlans ? RANKED_PLANS : PLANS
    while (this.planIdx < PL.length) {
      if (!this.planSim) {
        if (performance.now() > t0 + budgetMs - 8) break // starting a simulation costs a few ms
        this.planSim = new Sim(gameFromInput(this.init, this.planLines!, 0), this.init, { ...this.P, plan: PL[this.planIdx] }, this.dist, this.P.simOpp === "boss5" ? "boss5" : this.P.simOpp ? { ...DEFAULT_PARAMS, choosePlan: false, ...this.P.simOpp } : undefined)
        this.planSim.horizon = this.P.simHorizon
      }
      const v = this.planSim.run(t0 + budgetMs)
      if (v === null) break
      this.planLog.push(`${this.planIdx}:${v}`)
      if (v > this.planBest) {
        this.planBest = v
        this.P = { ...this.P, plan: PL[this.planIdx] }
      }
      this.planSim = null
      this.planIdx++
    }
    this.planPending = this.planIdx < PL.length && this.turnNo < this.P.planTurns
    this.planScores = `t${this.turnNo} ${this.planLog.join(" ")} (${(performance.now() - t0).toFixed(0)} ms)${this.planPending ? " pending" : ""}`
  }

  // Re-planning: from a snapshot of the game, every remaining-training option (the plans'
  // suffixes, the current one, none) is played out; switch when one is clearly better.
  lastLines: string[] = []
  rp: { lines: string[]; turn: number; cands: number[][][]; idx: number; sim: Sim | null; vals: number[]; cur: number } | null = null
  rpLog = ""

  replanStep(budgetMs: number, mine: BTroll[]) {
    const t0 = performance.now()
    const k = mine.length
    if (!this.rp) {
      if (this.designs.length <= k - 1 || this.turnNo > this.P.trainDeadline - 30) return
      const prefix = mine
        .filter(u => u.id > 1)
        .sort((a, b) => a.id - b.id)
        .map(u => [u.speed, u.carry, u.harvest, u.chop])
      const seen = new Set<string>()
      const cands: number[][][] = []
      const add = (suffix: number[][]) => {
        const key = JSON.stringify(suffix)
        if (seen.has(key)) return
        seen.add(key)
        cands.push([...prefix, ...suffix])
      }
      add(this.designs.slice(k - 1))
      for (const p of this.P.cutterPlans ? CUTTER_PLANS : this.P.bigPlans ? RANKED_PLANS : PLANS) if (p.length > k - 1) add(p.slice(k - 1))
      // cheap choppers for lemon-poor games
      for (const d of [[2, 2, 0, 2], [2, 2, 1, 2], [3, 2, 0, 2], [2, 3, 0, 2]]) add([d])
      add([])
      this.rp = { lines: this.lastLines, turn: this.turnNo - 1, cands, idx: 0, sim: null, vals: [], cur: 0 }
      this.rpNext = this.turnNo + this.P.replanEvery
    }
    const rp = this.rp
    while (rp.idx < rp.cands.length) {
      if (!rp.sim) {
        if (performance.now() > t0 + budgetMs - 8) return
        rp.sim = new Sim(gameFromInput(this.init, rp.lines, rp.turn), this.init, { ...this.P, plan: rp.cands[rp.idx] }, this.dist, this.P.simOpp === "boss5" ? "boss5" : undefined)
        rp.sim.horizon = Math.min(300, rp.turn + (this.P.replanHorizon || this.P.simHorizon))
      }
      const v = rp.sim.run(t0 + budgetMs)
      if (v === null) return
      rp.vals.push(v)
      rp.sim = null
      rp.idx++
    }
    let best = 0
    for (let i = 1; i < rp.vals.length; i++) if (rp.vals[i] > rp.vals[best]) best = i
    this.rpLog = `replan t${rp.turn + 1}: ${rp.vals.join(" ")} -> ${best === 0 || rp.vals[best] <= rp.vals[0] + this.P.replanMargin ? "keep" : JSON.stringify(rp.cands[best])}`
    if (best !== 0 && rp.vals[best] > rp.vals[0] + this.P.replanMargin && this.mineCount === k) this.P = { ...this.P, plan: rp.cands[best] }
    this.rp = null
  }
  mineCount = 0
  rpNext = 0

  turn(lines: string[]): string {
    this.lastLines = lines
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
  turnGame(g: Game, p = 0): string {
    // the engine's trees and inventories are read, never written, by decide()
    const trees: BTree[] = g.trees
    const trolls: BTroll[] = g.trolls.map(u => ({ id: u.id, mine: u.owner === p, cell: u.cell, speed: u.speed, carry: u.carry, harvest: u.harvest, chop: u.chop, inv: u.inv, load: u.inv[0] + u.inv[1] + u.inv[2] + u.inv[3] + u.inv[4] + u.inv[5] }))
    return this.decide(g.inv[p].slice(), trees, trolls)
  }

  decide(inv: number[], trees: BTree[], trolls: BTroll[]): string {
    this.turnNo++
    const tStart = performance.now()
    let simMs = 0
    // simulation budget this turn: capped by planTurnBudget, and by what the rest of the turn leaves
    const turnBudget = this.P.turnLimit > 0 ? Math.max(5, Math.min(this.P.planTurnBudget, this.P.turnLimit - this.otherMs)) : this.P.planTurnBudget
    const planned = this.planPending
    if (this.planPending) {
      const t = performance.now()
      this.evalPlans(this.P.planAll ? 1e9 : this.turnNo === 1 ? this.P.planBudget : turnBudget)
      simMs += performance.now() - t
    }
    const P = this.P
    const treeAt = new Map<number, BTree>()
    for (const t of trees) treeAt.set(t.cell, t)
    const mine: BTroll[] = []
    const opp: BTroll[] = []
    for (const u of trolls) (u.mine ? mine : opp).push(u)
    // a snapshot taken before a training no longer matches our troll count: restart the cycle
    if (this.rp && this.mineCount !== mine.length) this.rp = null
    this.mineCount = mine.length
    if (!this.sim && P.replan && !planned && this.turnNo > 1 && (this.rp || this.turnNo >= this.rpNext)) {
      const t = performance.now()
      this.replanStep(P.planAll ? 1e9 : turnBudget, mine)
      simMs += performance.now() - t
    }
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
    // keep one seed of each training fruit until its source is planted by the shack
    const held = [0, 0, 0, 0, 0]
    if (this.turnNo < P.earlySources && this.profile !== "raider")
      for (const f of [1, 0, 2]) {
        if (this.sourcesPlanted[f] > 0 || stock[f] === 0) continue
        if (trees.some(t => t.type === f && this.dropDist[t.cell] >= 0 && this.dropDist[t.cell] <= 2 && this.dropDist[t.cell] < this.oppDropDist[t.cell])) continue
        held[f] = 1
        stock[f]--
      }
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
      // AUTO design: the best chopper the stock pays for right now, else the cheapest one
      if (designs[k - 1][0] < 0) {
        const fit = AUTO_DESIGNS.find(d => d[0] * d[0] + k <= stock[0] && d[1] * d[1] + k <= stock[1] && d[2] * d[2] + k <= stock[2] && d[3] * d[3] + k <= stock[4])
        designs[k - 1] = fit ? fit.slice() : [1, 2, 0, 2]
      }
      let d = designs[k - 1]
      let cost = [k + d[0] * d[0], k + d[1] * d[1], k + d[2] * d[2], 0, k + d[3] * d[3]]
      // out of reach for too long (enemy raids, scarce fruit): settle for a cheaper troll
      const patience = k === 1 ? P.patienceFirst : this.turnNo - this.raidSeen <= 40 ? P.patienceRaided : P.patience
      if (this.turnNo - this.targetSince > patience && !cost.every((c, i) => stock[i] >= c)) {
        this.targetSince += patience / 2
        const attr = [0, 1, 2, 4] // stock index per attribute
        const minV = [1, 1, 0, Math.min(2, d[3])]
        let bi = -1
        let bd = 0
        for (let a = 0; a < 4; a++) {
          const def = cost[attr[a]] - stock[attr[a]]
          if (d[a] > minV[a] && def > bd) (bd = def), (bi = a)
        }
        // the best troll within the target's stats that the stock pays for now, if any
        let fit: number[] | null = null
        let fv = -1
        for (let sp = 1; sp <= d[0]; sp++)
          for (let c = 1; c <= d[1]; c++)
            for (let h = 0; h <= d[2]; h++)
              for (let cp = Math.min(2, d[3]); cp <= d[3]; cp++) {
                if (k + sp * sp > stock[0] || k + c * c > stock[1] || k + h * h > stock[2] || k + cp * cp > stock[4]) continue
                const v = 3 * c + 2.5 * sp + 2 * cp + h
                if (v > fv) (fv = v), (fit = [sp, c, h, cp])
              }
        if (!fit && k === 1)
          // our only troll so far: any troll that carries 2 beats waiting
          for (let sp = 1; sp <= Math.max(1, d[0]); sp++)
            for (let c = 2; c <= Math.max(2, d[1]); c++)
              for (let h = 0; h <= d[2]; h++)
                for (let cp = 1; cp <= Math.max(1, d[3]); cp++) {
                  if (k + sp * sp > stock[0] || k + c * c > stock[1] || k + h * h > stock[2] || k + cp * cp > stock[4]) continue
                  const v = 3 * c + 2.5 * sp + 2 * cp + h
                  if (v > fv) (fv = v), (fit = [sp, c, h, cp])
                }
        if (fit && fit[1] >= 2) {
          d = fit
          designs[k - 1] = d
          cost = [k + d[0] * d[0], k + d[1] * d[1], k + d[2] * d[2], 0, k + d[3] * d[3]]
        } else if (bi < 0) {
          if (k > 1) designs.length = k - 1 // (with our first troll only, keep gathering for it)
        } else {
          d = d.slice()
          d[bi]--
          designs[k - 1] = d
          cost = [k + d[0] * d[0], k + d[1] * d[1], k + d[2] * d[2], 0, k + d[3] * d[3]]
        }
      }
      // no chopper yet: the best one the stock pays for right now beats a better one later
      const isChopper = d[3] >= 2 && d[1] >= 2
      if (P.chopperNow && k - 1 < designs.length && !mine.some(u => u.chop >= 2 && u.carry >= 2) && (!isChopper || !cost.every((c, i) => stock[i] >= c))) {
        const fit = AUTO_DESIGNS.find(x => x[0] * x[0] + k <= stock[0] && x[1] * x[1] + k <= stock[1] && x[2] * x[2] + k <= stock[2] && x[3] * x[3] + k <= stock[4])
        if (fit) {
          d = fit.slice()
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
    for (let i = 0; i < 5; i++) stock[i] += held[i]
    const need = [0, 0, 0, 0, 0]
    const reserve = [0, 0, 0, 0, 0]
    if (target && this.cost) for (let i = 0; i < 5; i++) {
      need[i] = Math.max(0, this.cost[i] - stock[i])
      reserve[i] = this.cost[i]
    }
    const pickable = [0, 1, 2, 3].map(i => Math.max(0, stock[i] - reserve[i]))
    // what the rest of the plan still needs (each later troll costs one more per attribute)
    const fneed = [0, 0, 0, 0, 0]
    if (P.futureNeed && this.turnNo < P.trainDeadline)
      for (let j = k - 1 + (trainNow ? 1 : 0); j < designs.length; j++) {
        const d = designs[j]
        const kk = j + 1
        fneed[0] += kk + d[0] * d[0]
        fneed[1] += kk + d[1] * d[1]
        fneed[2] += kk + d[2] * d[2]
        fneed[4] += kk + d[3] * d[3]
      }
    for (let i = 0; i < 5; i++) fneed[i] = Math.max(0, fneed[i] - stock[i])

    // ------------------------------------------------------------ values
    const ownTree = (t: BTree) => this.dropDist[t.cell] >= 0 && (this.oppDropDist[t.cell] < 0 || this.dropDist[t.cell] < this.oppDropDist[t.cell])
    // raid detection: an enemy troll standing on one of our trees (it chops them)
    if (opp.some(o => o.chop > 0 && treeAt.has(o.cell) && ownTree(treeAt.get(o.cell)!))) this.raidSeen = this.turnNo
    const raided = this.turnNo - this.raidSeen <= 40
    const guard = raided ? P.guardRaided : P.guard
    // opponent profile (full information: their trolls' stats and whereabouts). A pure cutter
    // (no harvest) or a troll seen on our trees means a raider: defend. Otherwise, once it has
    // trained without raiding, it builds an economy: send our best chopper to raid it.
    if (opp.some(o => o.harvest === 0 && o.chop >= 2) || this.raidSeen > 0) this.profile = "raider"
    else if (this.profile === "unknown" && opp.length >= 2 && this.turnNo > 30) this.profile = "eco"
    let raiderId = -1
    if (P.counterRaid && this.profile === "eco" && this.turnNo < P.raidUntil && mine.length >= 2) {
      let best = 0
      for (const u of mine)
        if (u.chop >= 2 && u.chop * u.speed > best) {
          best = u.chop * u.speed
          raiderId = u.id
        }
    }
    const scoreVal = [1, 1, 1, 1]
    // a missing training resource is worth a share of the troll it completes (the scarcest one
    // ends up the most valuable, whatever it is)
    const deficit = need.reduce((a, b) => a + b, 0)
    const trollValue = Math.max(P.trollValue, P.trollRate * (left - 20))
    const unitVal = deficit > 0 ? Math.min(deficit <= 4 ? 2 * P.unitMax : P.unitMax, Math.max(P.trainBonus, trollValue / deficit)) : 0
    for (let i = 0; i < 4; i++) if (need[i] > 0) scoreVal[i] += unitVal
    for (let i = 0; i < 4; i++) if (need[i] === 0 && fneed[i] > 0) scoreVal[i] += P.futureVal
    const fruitVal = scoreVal.slice()
    const plantOk = (type: number, cell: number, extra: number) => {
      const g = COOLDOWN[type] - (this.nearWater[cell] ? WATER_BOOST[type] : 0)
      const grow = 1 + 3 * g
      return this.turnNo + extra + grow + Math.ceil(FINAL_HEALTH[type] / 2) + 4 < 300
    }
    const choppers = mine.filter(u => u.chop >= 2 && u.carry >= P.chopperCarry).length
    // farm cells: near the shack, free
    const oppNear = (c: number, r: number) => opp.some(o => this.dist[o.cell][c] >= 0 && this.dist[o.cell][c] <= r)
    const farmCells = this.farmAll.filter(c => !treeAt.has(c))
    const farmTrees = trees.filter(t => this.dropDist[t.cell] >= 0 && this.dropDist[t.cell] <= 2 && this.dropDist[t.cell] < this.oppDropDist[t.cell])
    // a farm we cannot fell feeds the enemy cutter
    const exposed = opp.some(o => o.chop >= 2) && !mine.some(u => u.chop >= 2 && u.carry >= 2)
    const farmTarget = exposed && P.noFarmExposed ? 0 : 2 + P.farmPerChopper * choppers
    let farmMissing = farmTarget - farmTrees.length
    // plant wishes: training-fruit sources first (while trolls remain to train), then farm trees
    const wanted: { type: number; value: number; source: boolean }[] = []
    if (target)
      for (const f of [1, 0, 2]) {
        const have = trees.filter(t => t.type === f && ownTree(t) && this.dropDist[t.cell] <= 3).length
        const nf = P.futureNeed ? fneed[f] : need[f]
        const want = P.futureNeed ? (nf >= 20 ? 3 : nf >= 8 ? 2 : nf >= 3 ? 1 : 0) : nf >= 10 ? 2 : nf >= 4 ? 1 : 0
        if (have < want && stock[f] > 0 && this.sourcesPlanted[f] < P.maxSources && !exposed && this.profile !== "raider") wanted.push({ type: f, value: P.sourceValue, source: true })
      }
    if (this.turnNo < P.earlySources && !exposed && this.profile !== "raider")
      for (const f of [1, 0, 2]) {
        if (wanted.some(w => w.type === f) || this.sourcesPlanted[f] > 0 || stock[f] === 0) continue
        if (trees.some(t => t.type === f && ownTree(t) && this.dropDist[t.cell] <= 2)) continue
        wanted.push({ type: f, value: P.sourceValue, source: true })
      }
    if (farmMissing > 0)
      for (const f of [BANANA, 0, 1, 2]) if (need[f] === 0) wanted.push({ type: f, value: 16 * P.plantGamma, source: false })
    if (dbg && this.turnNo >= dbg && this.turnNo < dbg + 3) console.log("  wanted", JSON.stringify(wanted), "farmCells", farmCells.length, "need", need, "stock", stock)
    const seedsAvail = pickable.reduce((a, b) => a + b, 0)
    for (let i = 0; i < 4; i++) if (farmMissing > seedsAvail) fruitVal[i] += P.seedBonus
    // banana seeds: while free farm cells outnumber them, keep a few mature banana trees
    // producing (one fruit per cooldown, each worth a new tree) instead of felling them
    const bananaSeeds = pickable[BANANA] + mine.reduce((a, u) => a + u.inv[BANANA], 0)
    const seedGap = plantOk(BANANA, this.shack, 20) ? Math.max(0, farmCells.length - bananaSeeds) : 0
    const producers = new Set<BTree>()
    if (seedGap > 0) {
      fruitVal[BANANA] += P.seedValue
      const mature = trees.filter(t => t.type === BANANA && t.size === MAX_SIZE && ownTree(t) && this.dropDist[t.cell] <= 3)
      mature.sort((a, b) => this.dropDist[a.cell] - this.dropDist[b.cell])
      for (const t of mature.slice(0, Math.min(P.producers, Math.ceil(seedGap / 2)))) producers.add(t)
    }

    const carriedValue = (u: BTroll) => {
      let v = 4 * u.inv[WOOD]
      const intent = this.seedIntent.get(u.id) ?? -1
      for (let i = 0; i < 4; i++) v += (u.inv[i] - (i === intent ? 1 : 0)) * scoreVal[i]
      const ironExtra = Math.max(0, u.inv[IRON] - need[4])
      v += Math.min(u.inv[IRON], need[4]) * unitVal + Math.min(ironExtra, fneed[4]) * P.futureVal + Math.max(0, ironExtra - fneed[4]) * 0.5
      return v
    }

    // ------------------------------------------------------------ jobs
    const enemiesAt = new Map<number, BTroll[]>()
    for (const o of opp) {
      const l = enemiesAt.get(o.cell)
      if (l) l.push(o)
      else enemiesAt.set(o.cell, [o])
    }
    const jobsFor = (u: BTroll): Job[] => {
      const jobs: Job[] = []
      const aDrop = "DROP " + u.id
      const aHarvest = "HARVEST " + u.id
      const aChop = "CHOP " + u.id
      const aMine = "MINE " + u.id
      const free = u.carry - u.load
      const cv = carriedValue(u)
      const home = (c: number) => this.steps(u, this.dropDist[c]) + 1
      const dNow = this.dist[u.cell]
      // go home and drop
      const atShack = this.dropDist[u.cell] === 0 || u.cell === this.shack
      if (u.load > 0 && cv > 0) {
        if (atShack) jobs.push({ u, rate: cv, dest: -1, act: aDrop, kind: "drop" })
        else
          for (const c of this.dropCells) {
            const r = this.steps(u, dNow[c]) + 1
            if (r <= left) jobs.push({ u, rate: cv / r, dest: c, act: aDrop, kind: "drop" })
          }
      }
      const isRaider = u.id === raiderId
      if (free > 0 || isRaider) {
        for (const tr of trees) {
          const d = dNow[tr.cell]
          if (d < 0) continue
          const a = this.steps(u, d)
          const r = home(tr.cell)
          const enemies = enemiesAt.get(tr.cell) ?? NO_TROLLS
          // harvest
          if (u.harvest > 0 && free > 0) {
            const f = this.predict(tr, a).fruits
            const g = Math.min(f, free)
            if (g > 0) {
              const ht = Math.ceil(g / u.harvest)
              const T = a + ht + r
              if (T <= left) jobs.push({ u, rate: (cv + g * fruitVal[tr.type]) / T, dest: tr.cell, act: aHarvest, tree: tr, kind: "harvest" })
            }
          }
          // chop
          if (u.chop > 0) {
            const eChop = enemies.reduce((s, o) => s + o.chop, 0)
            const own = ownTree(tr)
            const endgame = left < 40
            let wait = 0
            // an enemy chopper about to reach our tree: fell it first rather than lose it
            const threatened =
              (P.raidNoWait && raided && own && enemies.length === 0 && tr.size >= 2) ||
              (guard > 0 && own && enemies.length === 0 && opp.some(o => o.chop > 0 && o.carry > o.load && this.dist[o.cell][tr.cell] >= 0 && this.steps(o, this.dist[o.cell][tr.cell]) <= guard))
            const ripe = P.ripeByCarry ? Math.min(MAX_SIZE, u.carry) : MAX_SIZE // no use waiting for more wood than we can carry
            if (own && enemies.length === 0 && !endgame && tr.size < ripe && !threatened) {
              // our growing tree: be there when it reaches the size we can carry
              const tm = this.turnsToSize(tr, ripe)
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
            // co-choppers take one wood each in turn, up to their free carry (a full enemy takes none)
            const eFree = enemies.filter(o => o.chop > 0).map(o => o.carry - o.load)
            if (eFree.length > 0) {
              let left = size
              let got = 0
              const ef = eFree.slice()
              let mf = free
              while (left > 0 && (mf > 0 || ef.some(x => x > 0))) {
                if (mf > 0) (got++, mf--, left--)
                for (let i = 0; i < ef.length && left > 0; i++) if (ef[i] > 0) (ef[i]--, left--)
              }
              share = got
            }
            const wood = Math.min(share, free)
            let value = 4 * wood
            const sizeNow = this.predict(tr, a).size
            if (enemies.length > 0) value += 4 * P.denyAlpha * share
            else if (!own && sizeNow < MAX_SIZE) value += 4 * P.raidBeta * (MAX_SIZE - sizeNow)
            if (P.aggro > 0 && this.oppDropDist[tr.cell] >= 0 && this.oppDropDist[tr.cell] < 6) value += P.aggro * (6 - this.oppDropDist[tr.cell])
            if (isRaider && !own && this.oppDropDist[tr.cell] >= 0 && this.oppDropDist[tr.cell] <= 4) value += P.raidAggro + (tr.type === 1 ? P.raidLemon : 0) + 4 * P.raidBeta * Math.max(0, Math.min(MAX_SIZE, size) - wood)
            // wood we cannot carry is lost (fine on the enemy's side: that is denial)
            if (enemies.length === 0 && (own || this.dropDist[tr.cell] <= this.oppDropDist[tr.cell])) value -= P.wasteLambda * Math.max(0, Math.min(1, (left - 25) / 40)) * 4 * Math.max(0, size - wood)
            if (value <= 0) continue
            if (!endgame && own && need[tr.type] > 0 && enemies.length === 0 && !threatened) continue
            if (producers.has(tr) && enemies.length === 0 && !threatened && left > 30) continue
            const act = wait > 0 && d === 0 ? "" : aChop
            jobs.push({ u, rate: (cv + value) / T, dest: tr.cell, act, tree: tr, kind: "chop" })
          }
        }
        // mine
        if (u.chop > 0 && (need[4] > 0 || fneed[4] > 0)) {
          const m = Math.min(free, need[4] > 0 ? need[4] : fneed[4])
          const mv = need[4] > 0 ? unitVal : P.futureVal
          for (const c of this.mineCells) {
            if (dNow[c] < 0) continue
            const T = this.steps(u, dNow[c]) + Math.ceil(m / u.chop) + home(c)
            if (T <= left) jobs.push({ u, rate: (cv + mv * m) / T, dest: c === u.cell ? -1 : c, act: aMine, kind: "mine" })
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
      // a seed with nowhere worth planting it any more goes back to the shack (it used to be held for turns)
      if (this.seedIntent.has(u.id) && u.load > 0 && !jobs.some(j => j.kind === "drop")) {
        this.seedIntent.delete(u.id)
        const full = carriedValue(u) + 0.5
        if (atShack) jobs.push({ u, rate: full, dest: -1, act: aDrop, kind: "drop" })
        else for (const c of this.dropCells) if (dNow[c] >= 0) jobs.push({ u, rate: full / (this.steps(u, dNow[c]) + 1), dest: c, act: aDrop, kind: "drop" })
      }
      return jobs
    }

    // greedy assignment
    const assigned = new Map<number, Job>()
    const claimedHarvest = new Map<BTree, number>()
    const claimedChop = new Set<BTree>()
    const all: Job[] = []
    for (const u of mine) {
      // each troll's best jobs only: deeper ones are never reached by the assignment below
      const pv = this.prev.get(u.id)
      const top: Job[] = [] // best 16, by insertion
      for (const j of jobsFor(u)) {
        if (pv && pv.dest === j.dest && pv.kind === j.kind) j.rate *= P.stick
        if (top.length === 16 && j.rate <= top[15].rate) continue
        let i = top.length < 16 ? top.length : 15
        while (i > 0 && top[i - 1].rate < j.rate) {
          if (i < 16) top[i] = top[i - 1]
          i--
        }
        top[i] = j
      }
      for (const j of top) all.push(j)
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
      if (a.startsWith("PLANT")) {
        const t = ITEMS.indexOf(a.split(" ")[2])
        if (wanted.some(w => w.source && w.type === t)) this.sourcesPlanted[t]++
      }
      if (a.startsWith("PICK")) {
        this.seedIntent.set(u.id, ITEMS.indexOf(a.split(" ")[2]))
        this.intentSince.set(u.id, this.turnNo)
      }
    }
    if (trainNow) {
      const shackFree = !mine.some(u => u.cell === this.shack && !movers.some(m => m[0] === u))
      if (shackFree) {
        out.push(`TRAIN ${trainNow.join(" ")}`)
        this.trainTurns.push(this.turnNo)
      }
    }
    if (!this.sim) this.otherMs = Math.max(this.otherMs * 0.8, performance.now() - tStart - simMs + 2)
    return out.length ? out.join(";") : "WAIT"
  }
  otherMs = 5 // decide() time outside simulations (slowly decaying max, + margin)

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
