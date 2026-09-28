// Feeds a reconstructed replay's inputs (for `pseudo`'s seat) to a fresh Bot, turn by turn, to debug
// a decision: DBG=<turn> prints the job table around that turn. The bot's own outputs are ignored
// (the state follows the real game), so the plan it picks may differ from the real run.
// Run: DBG=179 node --import <repo>/node_modules/tsx/dist/esm/index.mjs redecide.ts <pseudo> replay.json '<params>'
import { reconstruct } from "./recon.js"
import { initInput, turnInput } from "./engine.js"
import { Bot, DEFAULT_PARAMS } from "./bot.js"
const r = reconstruct(process.argv[3])!
const seat = r.pseudos.indexOf(process.argv[2])
const bot = new Bot(initInput(r.states[0], seat), { ...DEFAULT_PARAMS, planAll: true, ...JSON.parse(process.argv[4] ?? "{}") })
const upto = +(process.env.DBG ?? 300) + 3
for (let t = 0; t < Math.min(upto, r.outs.length); t++) {
  const o = bot.turn(turnInput(r.states[t], seat))
  if (t + 1 >= upto - 3) console.log(`t${t + 1} bot: ${o}\n     real: ${r.outs[t][seat]}`)
  if (process.env.PLANLOG && t % 10 === 0) {
    const g = r.states[t]
    console.log(`t${t + 1} stock ${g.inv[seat].slice(0, 5).join("/")} trolls ${g.trolls.filter(u => u.owner === seat).length} designs ${JSON.stringify(bot.designs)} ${bot.rpLog}`)
  }
}
