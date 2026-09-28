import { Bot, DEFAULT_PARAMS } from "./bot.js"
import { play } from "./arena.js"
const t0 = performance.now()
let n = 0
for (let s = 1; s <= 10; s++) {
  const P = { ...DEFAULT_PARAMS, choosePlan: false }
  play(s, i => new Bot(i, P, true), i => new Bot(i, P, true))
  n++
}
console.log(((performance.now() - t0) / n).toFixed(1), "ms per game")
