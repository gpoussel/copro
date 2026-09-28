// One line per game for a pseudo: result, map features, both sides' trainings / plants / wood,
// and how much each side felled on the other's side (raids), to sort losses by cause.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs triage.ts <pseudo> replay.json...
import { reconstruct } from "./recon.js"
import { mapFeatures } from "./mapfeat.js"
import { bfs, neighbors, GRASS } from "./engine.js"

const who = process.argv[2]
const rows: string[] = []
for (const f of process.argv.slice(3)) {
  const r = reconstruct(f)
  if (!r) continue
  const me = r.pseudos.indexOf(who)
  if (me < 0) continue
  const op = 1 - me
  const g0 = r.states[0]
  const m = mapFeatures(g0, me)
  const sd = [0, 1].map(p => bfs(g0, neighbors(g0, g0.shack[p]).filter(c => g0.grid[c] === GRASS)))
  const felled = [
    [0, 0],
    [0, 0],
  ] // [by p][on own side / on other side]
  const trains: string[][] = [[], []]
  const plants = [0, 0]
  for (let t = 0; t + 1 < r.states.length; t++) {
    const a = r.states[t]
    const b = r.states[t + 1]
    for (let p = 0; p < 2; p++) {
      const na = a.trolls.filter(u => u.owner === p).length
      const nb = b.trolls.filter(u => u.owner === p)
      if (nb.length > na) {
        const u = nb[nb.length - 1]
        trains[p].push(`${t + 1}:${u.speed}${u.carry}${u.harvest}${u.chop}`)
      }
    }
    for (const tr of b.trees) if (!a.trees.some(x => x.cell === tr.cell)) for (let p = 0; p < 2; p++) if (b.trolls.some(u => u.owner === p && u.cell === tr.cell)) plants[p]++
    for (const tr of a.trees) {
      if (b.trees.some(x => x.cell === tr.cell && x.type === tr.type)) continue
      for (let p = 0; p < 2; p++) {
        if (!a.trolls.some(u => u.owner === p && u.cell === tr.cell)) continue
        const ownSide = sd[p][tr.cell] < sd[1 - p][tr.cell]
        felled[p][ownSide ? 0 : 1] += tr.size
      }
    }
  }
  const res = r.scores[me] > r.scores[op] ? "W" : r.scores[me] < r.scores[op] ? "L" : "D"
  rows.push(
    `${res} ${String(r.scores[me]).padStart(4)}-${String(r.scores[op]).padEnd(4)} ${r.pseudos[op].slice(0, 12).padEnd(12)} d${String(m.shackDist).padStart(2)} farm${String(m.farm).padStart(3)} | us ${trains[me].join(",").padEnd(28)} pl${String(plants[me]).padStart(3)} raid${String(felled[me][1]).padStart(3)} | them ${trains[op].join(",").padEnd(28)} pl${String(plants[op]).padStart(3)} raid${String(felled[op][1]).padStart(3)}`,
  )
}
rows.sort()
for (const l of rows) console.log(l)
