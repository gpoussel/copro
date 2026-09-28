// Troll Farm bot: job assignment by rate (points / turns, every job ends with a DROP).
// Jobs: harvest a tree, chop a tree (co-chop to share the wood of a tree an enemy is chopping,
// raid the enemy's young trees), mine iron for training, plant a seed (carried or picked from
// the shack) on a farm cell near the shack, go home and drop. Training follows a design list.
import { BANANA, COOLDOWN, DELTA_HEALTH, FINAL_HEALTH, GRASS, IRON, IRONCELL, ITEMS, MAX_FRUITS, MAX_SIZE, WATER, WATER_BOOST, WOOD, bfs } from "./engine.js"

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
  stick: number
  trainDeadline: number
  plantGamma: number
  sourceValue: number
  farmPerChopper: number
  raidBeta: number
  trainBonus: number
  seedBonus: number
  denyAlpha: number
}
export const DEFAULT_PARAMS: Params = {
  plan: [
    [1, 2, 1, 1],
    [2, 4, 1, 2],
    [2, 4, 1, 2],
  ],
  stick: 1.3,
  trainDeadline: 180,
  plantGamma: 0.5,
  sourceValue: 12,
  farmPerChopper: 3,
  raidBeta: 0.5,
  trainBonus: 3,
  seedBonus: 1,
  denyAlpha: 0.5,
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
  prev = new Map<number, string>() // troll id -> last job key
  log: string[] = []

  constructor(init: string[], params: Params = DEFAULT_PARAMS) {
    this.P = params
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
    for (let c = 0; c < this.N; c++) this.dist.push(bfs(this, [c]))
    for (const n of this.nbrs(this.shack)) if (this.grid[n] === GRASS) this.dropCells.push(n)
    this.dropDist = bfs(this, this.dropCells)
    const od = this.nbrs(this.oppShack).filter(n => this.grid[n] === GRASS)
    this.oppDropDist = bfs(this, od)
    for (let c = 0; c < this.N; c++)
      if (this.grid[c] === GRASS && this.nbrs(c).some(n => this.grid[n] === IRONCELL)) this.mineCells.push(c)
    this.mineDist = bfs(this, this.mineCells)
    this.nearWater = new Uint8Array(this.N)
    for (let c = 0; c < this.N; c++) if (this.nbrs(c).some(n => this.grid[n] === WATER)) this.nearWater[c] = 1
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

  turn(lines: string[]): string {
    this.turnNo++
    const P = this.P
    let li = 0
    const inv = lines[li++].split(" ").map(Number)
    const oppInv = lines[li++].split(" ").map(Number)
    void oppInv
    const nt = parseInt(lines[li++])
    const trees: BTree[] = []
    const treeAt = new Map<number, BTree>()
    for (let i = 0; i < nt; i++) {
      const p = lines[li++].split(" ")
      const type = ITEMS.indexOf(p[0])
      const cell = +p[2] * this.W + +p[1]
      const t: BTree = { type, cell, size: +p[3], health: +p[4], fruits: +p[5], cooldown: +p[6], growth: COOLDOWN[type] - (this.nearWater[cell] ? WATER_BOOST[type] : 0) }
      trees.push(t)
      treeAt.set(cell, t)
    }
    const nu = parseInt(lines[li++])
    const mine: BTroll[] = []
    const opp: BTroll[] = []
    for (let i = 0; i < nu; i++) {
      const v = lines[li++].split(" ").map(Number)
      const u: BTroll = { id: v[0], mine: v[1] === 0, cell: v[3] * this.W + v[2], speed: v[4], carry: v[5], harvest: v[6], chop: v[7], inv: v.slice(8, 14), load: 0 }
      u.load = u.inv.reduce((a, b) => a + b, 0)
      ;(u.mine ? mine : opp).push(u)
      if (this.turnNo === 1 && u.mine && u.id <= 1) this.seat = u.id
    }
    for (const c of [...this.planted]) if (!treeAt.has(c)) this.planted.delete(c)
    const left = 301 - this.turnNo // actions left including this one
    const out: string[] = []

    // ------------------------------------------------------------ training
    const k = mine.length
    const stock = inv.slice()
    let target: number[] | null = null
    let trainNow: number[] | null = null
    if (k - 1 < P.plan.length && this.turnNo < P.trainDeadline) {
      const d = P.plan[k - 1]
      const cost = [k + d[0] * d[0], k + d[1] * d[1], k + d[2] * d[2], 0, k + d[3] * d[3]]
      if (cost.every((c, i) => stock[i] >= c)) {
        trainNow = d
        for (let i = 0; i < 5; i++) stock[i] -= cost[i]
        // the next design's needs start now
        if (k < P.plan.length) {
          const d2 = P.plan[k]
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
    const scoreVal = [1, 1, 1, 1]
    for (let i = 0; i < 4; i++) if (need[i] > 0) scoreVal[i] += P.trainBonus
    const fruitVal = scoreVal.slice()
    const plantOk = (type: number, cell: number, extra: number) => {
      const g = COOLDOWN[type] - (this.nearWater[cell] ? WATER_BOOST[type] : 0)
      const grow = 1 + 3 * g
      return this.turnNo + extra + grow + Math.ceil(FINAL_HEALTH[type] / 2) + 4 < 300
    }
    const choppers = mine.filter(u => u.chop >= 2 && u.carry >= 3).length
    // farm cells: near the shack, free
    const oppNear = (c: number, r: number) => opp.some(o => this.dist[o.cell][c] >= 0 && this.dist[o.cell][c] <= r)
    const farmCells: number[] = []
    for (let c = 0; c < this.N; c++) {
      if (this.grid[c] !== GRASS || treeAt.has(c) || this.dropDist[c] > 2 || this.dropDist[c] < 0) continue
      if (this.oppDropDist[c] >= 0 && this.oppDropDist[c] <= this.dropDist[c] + 2) continue
      farmCells.push(c)
    }
    farmCells.sort((a, b) => this.dropDist[a] * 2 - this.nearWater[a] * 2 - (this.dropDist[b] * 2 - this.nearWater[b] * 2))
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
    const seedsAvail = pickable.reduce((a, b) => a + b, 0)
    for (let i = 0; i < 4; i++) if (farmMissing > seedsAvail) fruitVal[i] += P.seedBonus

    const carriedValue = (u: BTroll) => {
      let v = 4 * u.inv[WOOD]
      for (let i = 0; i < 4; i++) v += u.inv[i] * scoreVal[i]
      if (need[4] > 0) v += Math.min(u.inv[IRON], need[4]) * 3
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
      if (u.load > 0) {
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
            const { k: kk, size } = this.chopTime(tr, a, u.chop + eChop)
            const T = a + kk + r
            if (T > left) continue
            let share = size
            if (enemies.length > 0) share = Math.ceil(size / (1 + enemies.length))
            const wood = Math.min(share, free)
            let value = 4 * wood
            const own = ownTree(tr)
            const endgame = left < 40
            const sizeNow = this.predict(tr, a).size
            if (enemies.length > 0) value += 4 * P.denyAlpha * (size - (size - share))
            else if (own && sizeNow < MAX_SIZE && !endgame) {
              // our growing tree: wait (unless it cannot finish growing)
              continue
            } else if (!own && sizeNow < MAX_SIZE) {
              value += 4 * P.raidBeta * (MAX_SIZE - sizeNow)
            }
            if (!endgame && sizeNow < 2 && own) continue
            if (!endgame && own && need[tr.type] > 0 && enemies.length === 0) continue
            jobs.push({ u, rate: (cv + value) / T, dest: tr.cell, act: `CHOP ${u.id}`, tree: tr, kind: "chop" })
          }
        }
        // mine
        if (u.chop > 0 && need[4] > 0) {
          const m = Math.min(free, need[4])
          for (const c of this.mineCells) {
            if (dNow[c] < 0) continue
            const T = this.steps(u, dNow[c]) + Math.ceil(m / u.chop) + home(c)
            if (T <= left) jobs.push({ u, rate: (cv + 3 * m) / T, dest: c === u.cell ? -1 : c, act: `MINE ${u.id}`, kind: "mine" })
          }
        }
      }
      // plant a carried seed / pick one at the shack
      if (wanted.length > 0 && farmCells.length > 0) {
        let seed = -1
        let pick = false
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
          const w = wanted.find(x => x.type === seed)!
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
      return jobs
    }

    // greedy assignment
    const assigned = new Map<number, Job>()
    const claimedHarvest = new Map<BTree, number>()
    const claimedChop = new Set<BTree>()
    const all: Job[] = []
    for (const u of mine) all.push(...jobsFor(u))
    for (const j of all) if (this.prev.get(j.u.id) === j.kind + ":" + j.dest) j.rate *= P.stick
    all.sort((a, b) => b.rate - a.rate)
    const dbg = typeof process !== "undefined" ? Number(process.env.DBG ?? 0) : 0
    if (dbg && this.turnNo >= dbg && this.turnNo < dbg + 3)
      for (const u of mine) console.log(`  T${this.turnNo} troll ${u.id}@${this.xy(u.cell)} inv ${u.inv}: ` + all.filter(j => j.u === u).slice(0, 6).map(j => `${j.kind}:${j.dest >= 0 ? this.xy(j.dest) : "here"}:${j.rate.toFixed(2)}`).join(" "))
    let pickedSeeds = 0
    const endCell = new Map<number, number>() // final cell -> troll id
    for (const j of all) {
      if (assigned.has(j.u.id)) continue
      const fin = j.dest < 0 ? j.u.cell : j.dest
      if (endCell.has(fin) && endCell.get(fin) !== j.u.id) continue
      // our other trolls standing on the destination and not yet assigned may still leave it
      if (j.dest < 0 && [...assigned.values()].some(o => o.dest === j.u.cell)) continue
      if (j.kind === "harvest" && j.tree) {
        const taken = claimedHarvest.get(j.tree) ?? 0
        if (taken >= j.tree.fruits + 1) continue
        claimedHarvest.set(j.tree, taken + Math.min(j.u.carry - j.u.load, 3))
      }
      if (j.kind === "chop" && j.tree) {
        if (claimedChop.has(j.tree) && !opp.some(o => o.cell === j.tree!.cell)) continue
        claimedChop.add(j.tree)
      }
      if (j.kind === "pick" || j.kind === "plant") {
        if (pickedSeeds >= wanted.length + Math.max(0, farmMissing - 1)) continue
        pickedSeeds++
      }
      assigned.set(j.u.id, j)
      endCell.set(fin, j.u.id)
      this.prev.set(j.u.id, j.kind + ":" + j.dest)
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
    for (const [, a] of acts) out.push(a)
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
