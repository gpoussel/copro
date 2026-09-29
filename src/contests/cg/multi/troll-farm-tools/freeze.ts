// Stuck-bot detector for `pseudo`: per game, the longest stretch (turns 30-285) where its score and
// every troll's cell + load stay unchanged for at least one loaded troll, and total idle troll-turns.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs freeze.ts <pseudo> replay.json...
import { reconstruct } from "./recon.js"
const who = process.argv[2]
for (const f of process.argv.slice(3)) {
  const r = reconstruct(f)
  if (!r) continue
  const p = r.pseudos.indexOf(who)
  if (p < 0) continue
  const since = new Map<number, [number, number, number]>()
  let worst = 0, worstAt = 0, worstId = -1, idle = 0
  for (let t = 30; t < Math.min(285, r.outs.length); t++) {
    const g = r.states[t]
    const used = new Set<number>()
    for (const c of r.outs[t][p].split(";")) {
      const w = c.trim().split(/\s+/)
      if (w.length > 1 && w[0] !== "MSG" && w[0] !== "TRAIN") used.add(+w[1])
    }
    for (const u of g.trolls) {
      if (u.owner !== p) continue
      if (!used.has(u.id)) idle++
      const load = u.inv.reduce((a, b) => a + b, 0)
      const s = since.get(u.id)
      if (s && s[0] === u.cell && s[1] === load) {
        if (load > 0 && t - s[2] > worst) (worst = t - s[2]), (worstAt = s[2]), (worstId = u.id)
      } else since.set(u.id, [u.cell, load, t])
    }
  }
  console.log(`${String(r.gameId).padEnd(10)} ${r.pseudos.join(" vs ").padEnd(34)} ${r.scores.join("-").padEnd(8)} longest loaded stall ${String(worst).padStart(3)} (troll ${worstId} from t${worstAt + 1})  idle ${idle}`)
}
