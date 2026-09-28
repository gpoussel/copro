// Turn-by-turn digest of a reconstructed replay: score, stock, each troll's position / load / action.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs timeline.ts replay.json [from] [to] [every]
import { reconstruct } from "./recon.js"
import { score } from "./engine.js"
const r = reconstruct(process.argv[2])!
const from = +(process.argv[3] ?? 0)
const to = +(process.argv[4] ?? 300)
const every = +(process.argv[5] ?? 1)
const g0 = r.states[0]
const xy = (c: number) => `${c % g0.W},${Math.floor(c / g0.W)}`
console.log(r.pseudos.join(" vs "), r.scores.join("-"), `shacks ${xy(g0.shack[0])} / ${xy(g0.shack[1])}`)
for (let y = 0; y < g0.H; y++) console.log("  " + [...Array(g0.W)].map((_, x) => ".~#+S"[g0.grid[y * g0.W + x]]).join(""))
for (let t = from; t < Math.min(to, r.outs.length); t += every) {
  const g = r.states[t]
  const parts: string[] = []
  for (let p = 0; p < 2; p++) {
    const acts = new Map<number, string>()
    for (const c of r.outs[t][p].split(";")) {
      const w = c.trim().split(/\s+/)
      if (w.length > 1 && w[0] !== "MSG" && w[0] !== "TRAIN") acts.set(+w[1], w[0] === "MOVE" ? `>${w[2]},${w[3]}` : w[0] + (w[2] ? " " + w[2][0] : ""))
      if (w[0] === "TRAIN") acts.set(-1, "TRAIN " + w.slice(1).join(""))
    }
    const us = g.trolls.filter(u => u.owner === p).map(u => `${u.id}@${xy(u.cell)}[${u.inv.map((v, i) => (v ? v + "PLABIW"[i] : "")).join("")}] ${acts.get(u.id) ?? "-"}`)
    parts.push(`${r.pseudos[p].slice(0, 8)} ${score(g, p)} st ${g.inv[p].slice(0, 5).join("/")} ${acts.get(-1) ?? ""}| ${us.join(" | ")}`)
  }
  const trees = g.trees.map(t => "PLAB"[t.type] + t.size + "@" + xy(t.cell)).join(" ")
  console.log(`t${t + 1}  ${parts[0]}\n      ${parts[1]}${every > 1 ? "\n      trees " + trees : ""}`)
}
