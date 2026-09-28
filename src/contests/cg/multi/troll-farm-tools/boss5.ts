// Local clone of the Gold boss ("Boss 5", Konstant's contest bot as described in his post-mortem
// and seen in replays): two trolls only. A cutter (carry 2, no harvest, best speed / chop power the
// stock pays for, trained as early as possible) razes the trees near the enemy shack, lemons first,
// and co-chops any of its own trees an enemy is felling; the first troll gathers what the cutter
// costs (iron, fruits), then plants and harvests bananas / apples next to its shack.
import { BANANA, GRASS, IRONCELL, ITEMS, WATER, bfs } from "./engine.js"

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

  constructor(init: string[]) {
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
    for (let c = 0; c < this.N; c++) this.dist.push(bfs(this, [c]))
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
    this.turnNo++
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
    const mine: U[] = []
    const opp: U[] = []
    for (let i = 0; i < nu; i++) {
      const v = lines[li++].split(" ").map(Number)
      const u = { id: v[0], mine: v[1] === 0, cell: v[3] * this.W + v[2], speed: v[4], carry: v[5], harvest: v[6], chop: v[7], inv: v.slice(8, 14), load: 0 }
      u.load = u.inv.reduce((a, b) => a + b, 0)
      ;(u.mine ? mine : opp).push(u)
    }
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
        // cutter
        const defend = trees.find(t => this.drop[t.cell] <= this.oppDrop[t.cell] && opp.some(o => o.cell === t.cell && o.chop > 0))
        if (u.load >= u.carry || (u.load > 0 && !here)) {
          if (atShack(u)) act = `DROP ${u.id}`
          else dest = this.nearestDrop(u.cell)
        } else if (here && (here.size >= 2 || (here.size >= 1 && this.oppDrop[here.cell] < this.drop[here.cell]))) act = `CHOP ${u.id}`
        else {
          const target = defend && this.dist[u.cell][defend.cell] <= 6 ? defend : null
          let bestT: T | null = target
          let bv = -1e9
          if (!bestT)
            for (const t of trees) {
              if (this.dist[u.cell][t.cell] < 0 || t.size < 1) continue
              const enemySide = this.oppDrop[t.cell] >= 0 && this.oppDrop[t.cell] < this.drop[t.cell]
              if (!enemySide && t.size < 2) continue
              const early = this.turnNo < 60
              const v = 4 * Math.min(t.size, u.carry) + (enemySide ? 4 + (early ? 12 : 0) + (t.type === 1 ? 8 : 0) : 0) - 2 * (this.dist[u.cell][t.cell] / u.speed) - (enemySide ? this.oppDrop[t.cell] : this.drop[t.cell])
              if (v > bv) (bv = v), (bestT = t)
            }
          if (bestT) dest = bestT.cell
          else if (u.load > 0) dest = this.nearestDrop(u.cell)
        }
      } else {
        // gardener
        const seed = u.inv[BANANA] > 0 ? BANANA : u.inv[2] > 0 ? 2 : -1
        if (needIron > 0 && u.chop > 0 && free > 0 && this.mineCells.length) {
          if (this.mineCells.includes(u.cell)) act = `MINE ${u.id}`
          else dest = this.mineCells.reduce((a, b) => (this.dist[u.cell][b] < this.dist[u.cell][a] ? b : a))
        } else if (u.inv[4] > 0 || (u.load > 0 && seed < 0) || free === 0) {
          if (atShack(u)) act = `DROP ${u.id}`
          else dest = this.nearestDrop(u.cell)
        } else if (seed >= 0) {
          if (!here && this.grid[u.cell] === GRASS && this.drop[u.cell] <= 2 && u.cell !== this.shack) act = `PLANT ${u.id} ${ITEMS[seed]}`
          else {
            let best = -1
            for (let c = 0; c < this.N; c++)
              if (this.grid[c] === GRASS && !treeAt.has(c) && this.drop[c] <= 2 && this.drop[c] >= 0 && !taken.has(c) && (best < 0 || this.dist[u.cell][c] < this.dist[u.cell][best])) best = c
            if (best >= 0) dest = best
          }
        } else {
          // harvest the best fruit tree near home (lemons when the cutter still needs them)
          let bestT: T | null = null
          let bv = -1e9
          for (const t of trees) {
            if (t.fruits === 0 || this.dist[u.cell][t.cell] < 0) continue
            const v = t.fruits + (t.type === 1 && needLemon > 0 ? 5 : 0) + (t.type === BANANA ? 1 : 0) - this.dist[u.cell][t.cell] - this.drop[t.cell]
            if (v > bv) (bv = v), (bestT = t)
          }
          if (bestT && here === bestT) act = `HARVEST ${u.id}`
          else if (bestT) dest = bestT.cell
          else if (atShack(u) && inv[BANANA] > 0) act = `PICK ${u.id} BANANA`
          else if (inv[BANANA] > 0) dest = this.nearestDrop(u.cell)
          else if (here && this.turnNo > 250 && here.size >= 3) act = `CHOP ${u.id}`
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
