// Our bot's plants / wood per 25 turns in local games vs the reference.
import { Bot, DEFAULT_PARAMS } from "./bot.js"
import { Bot as RefBot, DEFAULT_PARAMS as REF } from "./bot-ref.js"
import { createGame, initInput, parseOutput, step, turnInput, score, Rng } from "./engine.js"
const P = { ...DEFAULT_PARAMS, planAll: true, ...JSON.parse(process.argv[4] ?? "{}") }
const plant = new Array(12).fill(0), wood = new Array(12).fill(0)
let tot = 0
for (let s = +process.argv[2]; s <= +process.argv[3]; s++) {
  const g = createGame(s)
  const a = new Bot(initInput(g, 0), P)
  const b = new RefBot(initInput(g, 1), { ...REF, planAll: true })
  const rng = new Rng(s)
  while (!g.over) {
    const oa = a.turn(turnInput(g, 0))
    const ob = b.turn(turnInput(g, 1))
    const w0 = g.trolls.filter(u => u.owner === 0).reduce((x, u) => x + u.inv[5], 0) + g.inv[0][5]
    const t = Math.floor(g.turn / 25)
    plant[t] += (oa.match(/PLANT/g) ?? []).length
    step(g, [...parseOutput(g, 0, oa, x => rng.int(x)).tasks, ...parseOutput(g, 1, ob, x => rng.int(x)).tasks])
    wood[t] += g.trolls.filter(u => u.owner === 0).reduce((x, u) => x + u.inv[5], 0) + g.inv[0][5] - w0
  }
  tot += score(g, 0)
}
const n = +process.argv[3] - +process.argv[2] + 1
console.log("plants/25t", plant.map(x => (x / n).toFixed(1)).join(" "))
console.log("wood/25t  ", wood.map(x => (x / n).toFixed(1)).join(" "), " avg score", (tot / n).toFixed(0))
