// Our side's standing wood and carried items at the end of local games (value left on the table).
import { Bot, DEFAULT_PARAMS } from "./bot.js"
import { Boss5 } from "./boss5.js"
import { createGame, initInput, parseOutput, step, turnInput, score, Rng, bfs, neighbors, GRASS, sum } from "./engine.js"
let standing = 0, carried = 0, n = 0
for (let s = 201; s <= 220; s++) {
  const g = createGame(s)
  const a = new Bot(initInput(g, 0), { ...DEFAULT_PARAMS, planAll: true })
  const b = new Boss5(initInput(g, 1))
  const rng = new Rng(s)
  while (!g.over) {
    const oa = a.turn(turnInput(g, 0))
    const ob = b.turn(turnInput(g, 1))
    step(g, [...parseOutput(g, 0, oa, x => rng.int(x)).tasks, ...parseOutput(g, 1, ob, x => rng.int(x)).tasks])
  }
  const dm = bfs(g, neighbors(g, g.shack[0]).filter(c => g.grid[c] === GRASS))
  const dt = bfs(g, neighbors(g, g.shack[1]).filter(c => g.grid[c] === GRASS))
  const st = g.trees.filter(t => dm[t.cell] >= 0 && dm[t.cell] < dt[t.cell] && t.size >= 2).reduce((x, t) => x + t.size, 0)
  const ca = g.trolls.filter(u => u.owner === 0).reduce((x, u) => x + sum(u.inv), 0)
  standing += st
  carried += ca
  n++
  console.log(`seed ${s}: ${score(g, 0)}-${score(g, 1)} standing our-side size ${st}, carried ${ca}, turn ${g.turn}`, g.trees.filter(t => dm[t.cell] >= 0 && dm[t.cell] < dt[t.cell] && t.size >= 2).map(t => "PLAB"[t.type] + t.size + "h" + t.health + "d" + dm[t.cell]).join(" "), "trolls", g.trolls.filter(u => u.owner === 0).map(u => `${u.speed}${u.carry}${u.harvest}${u.chop}`).join(","))
}
console.log(`avg standing ${(standing / n).toFixed(1)} carried ${(carried / n).toFixed(1)}`)
