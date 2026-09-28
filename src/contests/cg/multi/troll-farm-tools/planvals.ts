// For plan-choice studies: every candidate plan played solo on a map, with value features at
// several turns and the current simulation value (score + carried) at each of them, + the final.
import { initInput, parseOutput, score, step, turnInput, Game, WOOD } from "./engine.js"
import { Bot, DEFAULT_PARAMS, RANKED_PLANS } from "./bot.js"
import { javaGame } from "./seedmap.js"
import { valueFeatures } from "./valuefeat.js"
const TS = [60, 80, 100, 120, 140, 160, 200]
for (let s = +process.argv[2]; s <= +process.argv[3]; s++) {
  const out = []
  for (const plan of RANKED_PLANS) {
    const g: Game = javaGame(BigInt(s) * 104729n + 3n)
    const bot = new Bot(initInput(g, 0), { ...DEFAULT_PARAMS, choosePlan: false, replan: false, plan })
    const at: Record<number, { x: number[]; v: number }> = {}
    while (!g.over) {
      if (TS.includes(g.turn)) {
        let v = score(g, 0)
        for (const u of g.trolls) if (u.owner === 0) v += 4 * u.inv[WOOD] + u.inv[0] + u.inv[1] + u.inv[2] + u.inv[3]
        at[g.turn] = { x: valueFeatures(g, 0), v }
      }
      step(g, parseOutput(g, 0, bot.turn(turnInput(g, 0)), () => 0).tasks)
    }
    out.push({ at, y: score(g, 0) })
  }
  console.log(JSON.stringify({ s, plans: out }))
}
