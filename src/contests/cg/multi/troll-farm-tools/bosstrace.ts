// Prints the real boss's actions with its trolls' state (and the tree under them) on a dumped replay.
import { readFileSync } from "fs"
import { gameFromInput } from "./bot.js"
import { ITEMS } from "./engine.js"
type Frame = { stdout?: string; stderr?: string; seat: number }
const rp = JSON.parse(readFileSync(process.argv[2], "utf8")) as { frames: Frame[]; agents: { seat: number; pseudo: string }[] }
const me = rp.agents.find(a => a.pseudo === "gpoussel_")!
let init: string[] = []
const inputs: string[][] = []
const bossOut: string[] = []
for (const f of rp.frames.slice(1)) {
  if (f.seat === me.seat) {
    let l = (f.stderr ?? "").trim().split("\n")[0].split("|")
    if (!inputs.length) {
      const n = parseInt(l[0])
      init = l.slice(1, n + 1)
      l = l.slice(n + 1)
    }
    inputs.push(l)
  } else bossOut.push((f.stdout ?? "").trim().replace(/MSG [^;]*;?/, ""))
}
const from = +(process.argv[3] ?? 1), to = +(process.argv[4] ?? 60)
console.log(init.join("\n"))
for (let t = from - 1; t < to; t++) {
  const g = gameFromInput(init, inputs[t], t)
  const W = g.W
  const xy = (c: number) => `${c % W},${Math.floor(c / W)}`
  const parts = g.trolls.filter(u => u.owner === 1).map(u => {
    const tr = g.trees.find(x => x.cell === u.cell)
    const ds = Math.abs((u.cell % W) - (g.shack[1] % W)) + Math.abs(Math.floor(u.cell / W) - Math.floor(g.shack[1] / W))
    return `${u.id}@${xy(u.cell)} d${ds} inv${u.inv.join("")}${tr ? ` on ${ITEMS[tr.type][0]}${tr.size}f${tr.fruits}h${tr.health}` : ""}`
  })
  console.log(`t${t + 1} stock ${g.inv[1].join(",")} | ${parts.join(" | ")} => ${bossOut[t]}`)
}
