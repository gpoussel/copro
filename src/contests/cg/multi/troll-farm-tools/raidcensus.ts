// Which of `pseudo`'s side trees the opponent fells: planted by us or initial, type, size when felled,
// turn bucket, and whether one of our choppers was on the tree (co-chop) at the time.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs raidcensus.ts <pseudo> replay.json...
import { reconstruct } from "./recon.js"
import { bfs, neighbors, GRASS, ITEMS } from "./engine.js"
const who = process.argv[2]
const c: Record<string, number> = {}
const add = (k: string, v: number) => (c[k] = (c[k] ?? 0) + v)
for (const f of process.argv.slice(3)) {
  const r = reconstruct(f)
  if (!r) continue
  const p = r.pseudos.indexOf(who)
  if (p < 0) continue
  const g0 = r.states[0]
  const dd = [0, 1].map(q => bfs(g0, neighbors(g0, g0.shack[q]).filter(x => g0.grid[x] === GRASS)))
  const ours = (cell: number) => dd[p][cell] >= 0 && (dd[1 - p][cell] < 0 || dd[p][cell] < dd[1 - p][cell])
  const initial = new Set(g0.trees.map(t => t.cell))
  const plantedBy = new Map<number, number>()
  for (let t = 0; t + 1 < r.states.length; t++) {
    const a = r.states[t], b = r.states[t + 1]
    for (const tr of b.trees)
      if (!a.trees.some(x => x.cell === tr.cell)) {
        const u = b.trolls.find(x => x.cell === tr.cell)
        plantedBy.set(tr.cell, u ? (u.owner === p ? 0 : 1) : -1)
      }
    for (const tr of a.trees) {
      if (b.trees.some(x => x.cell === tr.cell && x.type === tr.type)) continue
      if (!ours(tr.cell)) continue
      const them = a.trolls.some(u => u.owner !== p && u.cell === tr.cell)
      const us = a.trolls.some(u => u.owner === p && u.cell === tr.cell)
      if (!them) continue
      const origin = initial.has(tr.cell) && !plantedBy.has(tr.cell) ? "init" : plantedBy.get(tr.cell) === 0 ? "ourplant" : "other"
      add(`origin ${origin}`, tr.size)
      add(`type ${ITEMS[tr.type]}`, tr.size)
      add(`size ${tr.size}`, tr.size)
      add(`t ${Math.floor(t / 50) * 50}`, tr.size)
      add(us ? "cochop" : "alone", tr.size)
      add(`d ${Math.min(4, dd[p][tr.cell])}`, tr.size)
    }
  }
}
for (const k of Object.keys(c).sort()) console.log(k.padEnd(16), c[k])
