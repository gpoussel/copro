// Local clone of the Gold boss ("Boss 5", Konstant's contest bot as described in his post-mortem
// and seen in replays): two trolls only. A cutter (carry 2, no harvest, best speed / chop power the
// stock pays for, trained as early as possible) razes the trees near the enemy shack, lemons first,
// and co-chops any of its own trees an enemy is felling; the first troll gathers what the cutter
// costs (iron, fruits), then plants and harvests bananas / apples next to its shack.
import { BANANA, GRASS, IRONCELL, ITEMS, WATER, bfs, Game } from "./engine.js"

interface T {
  type: number
  cell: number
  size: number
  health: number
  fruits: number
}
interface U {
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

export class Boss5 {
  W: number
  H: number
  N: number
  grid: Uint8Array
  shack = -1
  opp = -1
  dist: Int16Array[] = []
  drop: Int16Array
  oppDrop: Int16Array
  mineCells: number[] = []
  turnNo = 0
  picked = new Map<number, number>()

  constructor(init: string[], dist?: Int16Array[]) {
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
        if (ch === "1") this.opp = c
      }
    if (dist) this.dist = dist
    else for (let c = 0; c < this.N; c++) this.dist.push(bfs(this, [c]))
    this.drop = bfs(this, this.nbrs(this.shack).filter(n => this.grid[n] === GRASS))
    this.oppDrop = bfs(this, this.nbrs(this.opp).filter(n => this.grid[n] === GRASS))
    for (let c = 0; c < this.N; c++) if (this.grid[c] === GRASS && this.nbrs(c).some(n => this.grid[n] === IRONCELL)) this.mineCells.push(c)
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

  step(u: U, dest: number, taken: Set<number>): number {
    const d = this.dist[u.cell]
    const td = this.dist[dest]
    let best = u.cell
    let bd = td[u.cell] < 0 ? 1e9 : td[u.cell]
    for (let c = 0; c < this.N; c++) {
      if (this.grid[c] !== GRASS || d[c] < 0 || d[c] > u.speed || taken.has(c) || td[c] < 0) continue
      if (td[c] < bd) (bd = td[c]), (best = c)
    }
    return best
  }

  nearestDrop(c: number): number {
    let best = -1
    for (const n of this.nbrs(this.shack)) if (this.grid[n] === GRASS && (best < 0 || this.dist[c][n] < this.dist[c][best])) best = n
    return best
  }

  turn(lines: string[]): string {
    let li = 0
    const inv = lines[li++].split(" ").map(Number)
    li++
    const nt = +lines[li++]
    const trees: T[] = []
    for (let i = 0; i < nt; i++) {
      const p = lines[li++].split(" ")
      trees.push({ type: ITEMS.indexOf(p[0]), cell: +p[2] * this.W + +p[1], size: +p[3], health: +p[4], fruits: +p[5] })
    }
    const nu = +lines[li++]
    const all: U[] = []
    for (let i = 0; i < nu; i++) {
      const v = lines[li++].split(" ").map(Number)
      const u = { id: v[0], mine: v[1] === 0, cell: v[3] * this.W + v[2], speed: v[4], carry: v[5], harvest: v[6], chop: v[7], inv: v.slice(8, 14), load: 0 }
      u.load = u.inv.reduce((a, b) => a + b, 0)
      all.push(u)
    }
    return this.decide(inv, trees, all)
  }

  /** Same as turn() for player p of an engine state. */
  turnGame(g: Game, p: number): string {
    const trees: T[] = g.trees.map(t => ({ type: t.type, cell: t.cell, size: t.size, health: t.health, fruits: t.fruits }))
    const all: U[] = g.trolls.map(u => ({ id: u.id, mine: u.owner === p, cell: u.cell, speed: u.speed, carry: u.carry, harvest: u.harvest, chop: u.chop, inv: u.inv.slice(), load: u.inv[0] + u.inv[1] + u.inv[2] + u.inv[3] + u.inv[4] + u.inv[5] }))
    return this.decide(g.inv[p].slice(), trees, all)
  }

  decide(inv: number[], trees: T[], all: U[]): string {
    this.turnNo++
    const mine = all.filter(u => u.mine)
    const opp = all.filter(u => !u.mine)
    const treeAt = new Map(trees.map(t => [t.cell, t]))
    const out: string[] = []
    const taken = new Set<number>()
    const k = mine.length
    const atShack = (u: U) => u.cell === this.shack || this.drop[u.cell] === 0
    // training: the cutter
    let train: number[] | null = null
    let needIron = 0
    let needLemon = 0
    if (k === 1) {
      let best: number[] | null = null
      for (let sp = 3; sp >= 1 && !best; sp--)
        for (let cp = 3; cp >= 2 && !best; cp--) if (1 + sp * sp <= inv[0] && 1 + 4 <= inv[1] && 1 <= inv[2] && 1 + cp * cp <= inv[4]) best = [sp, 2, 0, cp]
      if (best) train = best
      else {
        needIron = Math.max(0, 5 - inv[4])
        needLemon = Math.max(0, 5 - inv[1])
      }
    }
    for (const u of mine) {
      const here = treeAt.get(u.cell)
      const free = u.carry - u.load
      let act = ""
      let dest = -1
      if (u.harvest === 0 && u.chop >= 2) {
        // cutter: raid the enemy's trees (lemons first, even when full: denial), later farm ours
        const raid = this.turnNo < 190
        const defend = trees.find(t => this.drop[t.cell] <= this.oppDrop[t.cell] && opp.some(o => o.cell === t.cell && o.chop > 0))
        const enemySide = (c: number) => this.oppDrop[c] >= 0 && this.oppDrop[c] < this.drop[c]
        let bestT: T | null = null
        let bv = -1e9
        for (const t of trees) {
          if (this.dist[u.cell][t.cell] < 0 || t.size < 1) continue
          const es = enemySide(t.cell)
          if (raid ? !es : es || t.size < 2) continue
          const v = raid ? (t.type === 1 ? 10 : 0) + 2 * t.size - this.dist[u.cell][t.cell] / u.speed - this.oppDrop[t.cell] : 4 * Math.min(t.size, u.carry) - 2 * (this.dist[u.cell][t.cell] / u.speed) - this.drop[t.cell]
          if (v > bv) (bv = v), (bestT = t)
        }
        if (defend && this.dist[u.cell][defend.cell] <= 6) bestT = defend
        if (here && here.size >= 1 && (raid ? enemySide(here.cell) : !enemySide(here.cell) && here.size >= 2)) bestT = here
        if (here && bestT === here) act = `CHOP ${u.id}`
        else if (u.load >= u.carry && (!bestT || !raid || this.dist[u.cell][bestT.cell] > 4)) {
          if (atShack(u)) act = `DROP ${u.id}`
          else dest = this.nearestDrop(u.cell)
        } else if (bestT) dest = bestT.cell
        else if (u.load > 0) {
          if (atShack(u)) act = `DROP ${u.id}`
          else dest = this.nearestDrop(u.cell)
        }
      } else {
        // gardener
        const picked = this.picked.get(u.id)
        const seed = picked !== undefined && u.inv[picked] > 0 ? picked : -1
        const lemonTrees = trees.filter(t => t.type === 1 && t.size === 4 && this.dist[u.cell][t.cell] >= 0)
        if (needIron > 0 && u.chop > 0 && free > 0 && this.mineCells.length && needLemon === 0) {
          if (this.mineCells.includes(u.cell)) act = `MINE ${u.id}`
          else dest = this.mineCells.reduce((a, b) => (this.dist[u.cell][b] < this.dist[u.cell][a] ? b : a))
        } else if (k === 1 && needLemon > 0 && free > 0 && lemonTrees.length) {
          const lt = lemonTrees.reduce((a, b) => (this.dist[u.cell][b.cell] < this.dist[u.cell][a.cell] ? b : a))
          if (here === lt) act = `HARVEST ${u.id}` // waits there for the fruit
          else dest = lt.cell
        } else if (u.inv[4] > 0 || (u.load > 0 && seed < 0)) {
          if (atShack(u)) act = `DROP ${u.id}`
          else dest = this.nearestDrop(u.cell)
        } else if (seed >= 0) {
          if (!here && this.grid[u.cell] === GRASS && this.drop[u.cell] >= 0 && this.drop[u.cell] <= 3 && u.cell !== this.shack) {
            act = `PLANT ${u.id} ${ITEMS[seed]}`
            this.picked.delete(u.id)
          }
          else {
            let best = -1
            for (let c = 0; c < this.N; c++)
              if (this.grid[c] === GRASS && !treeAt.has(c) && this.drop[c] <= 3 && this.drop[c] >= 0 && !taken.has(c) && (best < 0 || this.dist[u.cell][c] < this.dist[u.cell][best])) best = c
            if (best >= 0) dest = best
          }
        } else {
          let bestT: T | null = null
          let bv = -1e9
          for (const t of trees) {
            if (t.fruits === 0 || this.dist[u.cell][t.cell] < 0 || this.drop[t.cell] > 4) continue
            const v = t.fruits + (t.type === BANANA ? 1 : 0) - this.dist[u.cell][t.cell]
            if (v > bv) (bv = v), (bestT = t)
          }
          const pickT = inv[BANANA] > 0 ? "BANANA" : inv[2] > 0 ? "APPLE" : ""
          if (bestT && here === bestT) act = `HARVEST ${u.id}`
          else if (atShack(u) && pickT && k >= 2) {
            act = `PICK ${u.id} ${pickT}`
            this.picked.set(u.id, pickT === "BANANA" ? BANANA : 2)
          } else if (bestT) dest = bestT.cell
          else if (pickT && k >= 2) dest = this.nearestDrop(u.cell)
        }
      }
      if (act) {
        out.push(act)
        taken.add(u.cell)
      } else if (dest >= 0 && dest !== u.cell) {
        const c = this.step(u, dest, taken)
        taken.add(c)
        if (c !== u.cell) out.push(`MOVE ${u.id} ${this.xy(c)}`)
      } else taken.add(u.cell)
      if (u.cell === this.shack && train && !act) {
        const c = this.step(u, this.nearestDrop(u.cell), taken)
        if (c !== u.cell && !out.some(o => o.startsWith(`MOVE ${u.id} `))) out.push(`MOVE ${u.id} ${this.xy(c)}`)
      }
    }
    if (train && !mine.some(u => u.cell === this.shack && !out.some(o => o.startsWith(`MOVE ${u.id} `)))) out.push(`TRAIN ${train.join(" ")}`)
    return out.length ? out.join(";") : "WAIT"
  }
}
