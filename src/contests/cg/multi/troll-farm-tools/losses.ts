// On dumped games: trees on our side felled by the enemy vs by us (size at death), and co-chops.
import { readFileSync } from "fs"
import { gameFromInput } from "./bot.js"
import { bfs, neighbors, GRASS } from "./engine.js"
type Frame = { stdout?: string; stderr?: string; seat: number }
for (const file of process.argv.slice(2)) {
  const rp = JSON.parse(readFileSync(file, "utf8")) as { frames: Frame[]; agents: { seat: number; pseudo: string; score: number }[] }
  const me = rp.agents.find(a => a.pseudo === "gpoussel_")!
  const opp = rp.agents.find(a => a !== me)!
  let init: string[] = []
  const inputs: string[][] = []
  for (const f of rp.frames.slice(1))
    if (f.seat === me.seat) {
      let l = (f.stderr ?? "").trim().split("\n")[0].split("|")
      if (!inputs.length) {
        const n = parseInt(l[0])
        if (isNaN(n)) break
        init = l.slice(1, n + 1)
        l = l.slice(n + 1)
      }
      inputs.push(l)
    }
  if (!inputs.length) continue
  const g0 = gameFromInput(init, inputs[0], 0)
  const dm = bfs(g0, neighbors(g0, g0.shack[0]).filter(c => g0.grid[c] === GRASS))
  const dt = bfs(g0, neighbors(g0, g0.shack[1]).filter(c => g0.grid[c] === GRASS))
  const lost = { enemy: 0, us: 0, both: 0, enemyWood: 0 }
  const theirs = { enemy: 0, us: 0, both: 0 }
  for (let t = 0; t + 1 < inputs.length; t++) {
    const g = gameFromInput(init, inputs[t], t)
    const h = gameFromInput(init, inputs[t + 1], t + 1)
    for (const tr of g.trees) {
      if (h.trees.some(x => x.cell === tr.cell && x.type === tr.type)) continue
      const e = g.trolls.some(u => u.owner === 1 && u.cell === tr.cell)
      const m = g.trolls.some(u => u.owner === 0 && u.cell === tr.cell)
      if (dm[tr.cell] < 0 || dm[tr.cell] >= dt[tr.cell]) {
        if (e && m) theirs.both += tr.size
        else if (e) theirs.enemy += tr.size
        else if (m) theirs.us += tr.size
        continue
      }
      if (e && m) lost.both += tr.size
      else if (e) (lost.enemy += tr.size), (lost.enemyWood += tr.size)
      else if (m) lost.us += tr.size
    }
  }
  console.log(file.split("/").pop(), `${me.score}-${opp.score}`, `our side felled: enemy ${lost.enemy}, us ${lost.us}, both ${lost.both} | their side: enemy ${theirs.enemy}, us ${theirs.us}, both ${theirs.both}`)
}
