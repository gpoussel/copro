// Our bot (seat 0) vs a variant: per-seed scores, trolls, wood.
import { Bot, DEFAULT_PARAMS, Params } from "./bot.js"
import { play } from "./arena.js"
const opp: Params = { ...DEFAULT_PARAMS, choosePlan: false, ...JSON.parse(process.argv[4] ?? '{"aggro":4,"plan":[[2,3,0,2]]}') }
const me: Params = { ...DEFAULT_PARAMS, planAll: true, ...JSON.parse(process.argv[5] ?? "{}") }
let w = 0
for (let s = +process.argv[2]; s <= +process.argv[3]; s++) {
  let bot: Bot | null = null
  const r = play(s, i => (bot = new Bot(i, me)), i => new Bot(i, opp))
  const tr = (p: number) => r.g.trolls.filter(u => u.owner === p).map(u => `${u.speed}${u.carry}${u.harvest}${u.chop}`).join(",")
  if (r.s[0] > r.s[1]) w++
  console.log(`seed ${s}: ${r.s[0]} vs ${r.s[1]}  wood ${r.g.inv[0][5]}/${r.g.inv[1][5]}  trolls ${tr(0)} | ${tr(1)}  plan ${JSON.stringify(bot!.P.plan)}`)
}
console.log("wins", w)
