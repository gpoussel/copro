// Map features seen from one seat on turn 1 (for map-type strategies), and a dump over replays.
import { Game, GRASS, WATER, bfs, neighbors } from "./engine.js"
export interface MapFeat {
  size: number // W*H
  shackDist: number // walking distance between the two shacks' drop cells
  dropWater: number // drop cells next to water (fast sources)
  farmWater: number // grass cells within 2 of a drop cell, next to water
  farm: number // grass cells within 2 of a drop cell, closer to us than to the enemy
  near: number[] // trees per type within 4 of our drop cells (our side)
  mid: number // trees equally close (±1) to both shacks
  stock: number // starting fruits + iron
}
export function mapFeatures(g: Game, p: number): MapFeat {
  const drop = [0, 1].map(q => neighbors(g, g.shack[q]).filter(c => g.grid[c] === GRASS))
  const dd = drop.map(d => bfs(g, d))
  const nearW = (c: number) => neighbors(g, c).some(n => g.grid[n] === WATER)
  let shackDist = 99
  for (const c of drop[1 - p]) if (dd[p][c] >= 0) shackDist = Math.min(shackDist, dd[p][c])
  let farm = 0,
    farmWater = 0
  for (let c = 0; c < g.W * g.H; c++) {
    if (g.grid[c] !== GRASS || dd[p][c] < 0 || dd[p][c] > 2 || dd[p][c] >= dd[1 - p][c]) continue
    farm++
    if (nearW(c)) farmWater++
  }
  const near = [0, 0, 0, 0]
  let mid = 0
  for (const t of g.trees) {
    const a = dd[p][t.cell],
      b = dd[1 - p][t.cell]
    if (a >= 0 && a <= 4 && a < b) near[t.type]++
    if (Math.abs(a - b) <= 1) mid++
  }
  return { size: g.W * g.H, shackDist, dropWater: drop[p].filter(nearW).length, farmWater, farm, near, mid, stock: g.inv[p].slice(0, 5).reduce((a, b) => a + b, 0) }
}

if (process.argv[1]?.endsWith("mapfeat.ts")) {
  const { reconstruct } = await import("./recon.js")
  const who = process.argv[2]
  for (const f of process.argv.slice(3)) {
    const r = reconstruct(f)
    if (!r) continue
    const p = r.pseudos.indexOf(who)
    if (p < 0) continue
    const m = mapFeatures(r.states[0], p)
    const last = r.states[r.states.length - 1]
    const trolls = last.trolls.filter(u => u.owner === p).length
    const opp = r.pseudos[1 - p]
    console.log(
      `${String(r.scores[p]).padStart(4)}-${String(r.scores[1 - p]).padEnd(4)} ${opp.slice(0, 10).padEnd(10)} trolls ${trolls} | size ${m.size} dist ${m.shackDist} dropW ${m.dropWater} farm ${m.farm}/${m.farmWater}w near ${m.near.join("")} mid ${m.mid} stock ${m.stock}`,
    )
  }
}
