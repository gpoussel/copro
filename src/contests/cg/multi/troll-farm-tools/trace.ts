// Prints our bot's outputs with troll positions for a turn range of one local game vs the reference.
import { Bot, DEFAULT_PARAMS } from "./bot.js"
import { Bot as RefBot, DEFAULT_PARAMS as REF } from "./bot-ref.js"
import { createGame, initInput, parseOutput, step, turnInput, Rng } from "./engine.js"
const s = +process.argv[2]
const g = createGame(s)
console.log(initInput(g, 0).join("\n"))
const a = new Bot(initInput(g, 0), { ...DEFAULT_PARAMS, planAll: true })
const b = new RefBot(initInput(g, 1), { ...REF, planAll: true })
const rng = new Rng(s)
while (!g.over) {
  const oa = a.turn(turnInput(g, 0))
  const ob = b.turn(turnInput(g, 1))
  if (g.turn + 1 >= +process.argv[3] && g.turn + 1 <= +process.argv[4]) {
    const pos = g.trolls.filter(u => u.owner === 0).map(u => `${u.id}@${u.cell % g.W},${Math.floor(u.cell / g.W)}[${u.inv.join("")}]`).join(" ")
    const tr = g.trees.filter(t => t.size >= 1).length
    console.log(`t${g.turn + 1} inv ${g.inv[0].join(",")} trees ${tr} | ${pos} | ${oa}`)
  }
  step(g, [...parseOutput(g, 0, oa, x => rng.int(x)).tasks, ...parseOutput(g, 1, ob, x => rng.int(x)).tasks])
}
