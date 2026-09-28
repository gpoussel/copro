// Plan-simulation throughput (what the bot runs on its first turns).
import { Bot, DEFAULT_PARAMS, PLANS, Sim, gameFromInput } from "./bot.js"
import { createGame, initInput, turnInput } from "./engine.js"
const t0 = performance.now()
let n = 0
for (let s = 1; s <= 8; s++) {
  const g0 = createGame(s)
  const init = initInput(g0, 0)
  const lines = turnInput(g0, 0)
  const dist = new Bot(init, DEFAULT_PARAMS, true).dist
  for (const plan of PLANS) {
    new Sim(gameFromInput(init, lines, 0), init, { ...DEFAULT_PARAMS, plan }, dist).run(1e15)
    n++
  }
}
console.log(((performance.now() - t0) / n).toFixed(1), "ms per plan sim")
