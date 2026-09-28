// Action mix per player over reconstructed replays: share of troll-turns spent moving empty / loaded,
// chopping, harvesting, mining, planting, dropping, idle; wood per chopper-turn; average drop size.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs actmix.ts replay.json...
import { reconstruct } from "./recon.js"
const agg = new Map<string, Record<string, number>>()
for (const f of process.argv.slice(2)) {
  const r = reconstruct(f)
  if (!r) continue
  for (let p = 0; p < 2; p++) {
    const a = agg.get(r.pseudos[p]) ?? {}
    agg.set(r.pseudos[p], a)
    const add = (k: string, v = 1) => (a[k] = (a[k] ?? 0) + v)
    for (let t = 0; t + 1 < r.states.length && t < r.outs.length; t++) {
      const g = r.states[t]
      const acts = new Map<number, string>()
      for (const c of r.outs[t][p].split(";")) {
        const w = c.trim().split(/\s+/)
        if (w.length > 1 && w[0] !== "MSG" && w[0] !== "TRAIN") acts.set(+w[1], w[0])
      }
      for (const u of g.trolls) {
        if (u.owner !== p) continue
        const load = u.inv.reduce((x, y) => x + y, 0)
        const k = acts.get(u.id) ?? "IDLE"
        add("turns")
        add(k === "MOVE" ? (load ? "MOVE loaded" : "MOVE empty") : k)
        if (k === "DROP") add("dropped", load), add("woodDropped", u.inv[5])
      }
    }
    add("games")
  }
}
for (const [who, a] of agg) {
  if (a.games < 2) continue
  const T = a.turns
  const keys = ["MOVE empty", "MOVE loaded", "CHOP", "HARVEST", "MINE", "PICK", "PLANT", "DROP", "IDLE"]
  console.log(who.padEnd(20), `games ${a.games} troll-turns/game ${(T / a.games).toFixed(0)} | ` + keys.map(k => `${k} ${((100 * (a[k] ?? 0)) / T).toFixed(1)}%`).join("  "), `| avg drop ${((a.dropped ?? 0) / (a.DROP ?? 1)).toFixed(2)} wood/drop ${((a.woodDropped ?? 0) / (a.DROP ?? 1)).toFixed(2)} wood/game ${((a.woodDropped ?? 0) / a.games).toFixed(0)}`)
}
