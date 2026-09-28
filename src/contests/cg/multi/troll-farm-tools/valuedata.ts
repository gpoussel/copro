// Training data for a tiny value model: solo games (fixed random plan from the candidates, no
// re-plan: fast), snapshots every 20 turns -> features (valuefeat.ts) + final score.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs valuedata.ts <from> <to> > out.jsonl
import { initInput, parseOutput, score, step, turnInput, Game } from "./engine.js"
import { Bot, DEFAULT_PARAMS, RANKED_PLANS } from "./bot.js"
import { javaGame } from "./seedmap.js"
import { valueFeatures } from "./valuefeat.js"

for (let s = +process.argv[2]; s <= +process.argv[3]; s++) {
  const g: Game = javaGame(BigInt(s) * 104729n + 3n)
  const plan = RANKED_PLANS[s % RANKED_PLANS.length]
  const bot = new Bot(initInput(g, 0), { ...DEFAULT_PARAMS, choosePlan: false, replan: false, plan })
  const snaps: { t: number; x: number[] }[] = []
  while (!g.over) {
    if (g.turn % 20 === 0 && g.turn >= 20 && g.turn <= 280) snaps.push({ t: g.turn, x: valueFeatures(g, 0) })
    step(g, parseOutput(g, 0, bot.turn(turnInput(g, 0)), () => 0).tasks)
  }
  const final = score(g, 0)
  for (const sn of snaps) console.log(JSON.stringify({ s, t: sn.t, x: sn.x, y: final }))
}
