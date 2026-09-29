// Imitation data from a player's replays: for each of its trolls and turns, the "job" it is on = the
// next non-MOVE action it performs (kind + cell), with the turn input from its seat. Writes one file
// per game: <dir>/<gameId>.txt = init lines, then per turn: "TURN t", the input lines, and one
// "LABEL trollId kind x y" line per troll (kind: HARVEST CHOP PLANT PICK DROP MINE; none if it never acts).
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs imitate.ts <dir> <pseudo> replay.json...
import { mkdirSync, writeFileSync } from "fs"
import { initInput, turnInput } from "./engine.js"
import { reconstruct } from "./recon.js"
const [dir, who] = [process.argv[2], process.argv[3]]
mkdirSync(dir, { recursive: true })
for (const f of process.argv.slice(4)) {
  const r = reconstruct(f)
  if (!r) continue
  const p = r.pseudos.indexOf(who)
  if (p < 0) continue
  const g0 = r.states[0]
  const out: string[] = [...initInput(g0, p)]
  const T = r.outs.length
  // per turn: troll id -> action word
  const acts: Map<number, string>[] = []
  for (let t = 0; t < T; t++) {
    const m = new Map<number, string>()
    for (const c of r.outs[t][p].split(";")) {
      const w = c.trim().split(/\s+/)
      if (w.length > 1 && w[0] !== "MSG" && w[0] !== "TRAIN") m.set(+w[1], w[0])
    }
    acts.push(m)
  }
  for (let t = 0; t < T; t++) {
    const g = r.states[t]
    out.push(`TURN ${t}`, ...turnInput(g, p))
    for (const u of g.trolls) {
      if (u.owner !== p) continue
      for (let t2 = t; t2 < T; t2++) {
        const a = acts[t2].get(u.id)
        if (a && a !== "MOVE") {
          const cu = r.states[t2].trolls.find(x => x.id === u.id)
          if (cu) out.push(`LABEL ${u.id} ${a} ${cu.cell % g.W} ${Math.floor(cu.cell / g.W)} ${t2 - t}`)
          break
        }
      }
    }
  }
  writeFileSync(`${dir}/${r.gameId}.txt`, out.join("\n") + "\n")
}
