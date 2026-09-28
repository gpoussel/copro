// Offline plan table: every candidate plan played solo (fixed plan, no re-planning) on real maps,
// with the map features, for choosing a plan by map type at run time without simulations.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs planmap.ts <from> <to> '<params>' > out.jsonl
import { initInput, parseOutput, score, step, turnInput } from "./engine.js"
import { BIG_PLANS, Bot, DEFAULT_PARAMS, PLANS, Params } from "./bot.js"
import { javaGame } from "./seedmap.js"
import { mapFeatures } from "./mapfeat.js"

export const ALL_PLANS = [...PLANS, ...BIG_PLANS]
export const benchMap = (seed: number) => javaGame(BigInt(seed) * 7919n + 17n)

export function soloScore(seed: number, p: Partial<Params>): number {
  const g = benchMap(seed)
  const bot = new Bot(initInput(g, 0), { ...DEFAULT_PARAMS, ...p })
  while (!g.over) step(g, parseOutput(g, 0, bot.turn(turnInput(g, 0)), () => 0).tasks)
  return score(g, 0)
}

if (process.argv[1]?.endsWith("planmap.ts")) {
  const extra = JSON.parse(process.argv[4] ?? "{}")
  for (let s = +process.argv[2]; s <= +process.argv[3]; s++) {
    const g = benchMap(s)
    const f = mapFeatures(g, 0)
    const scores = ALL_PLANS.map(plan => soloScore(s, { ...extra, choosePlan: false, replan: false, plan }))
    console.log(JSON.stringify({ seed: s, f, inv: g.inv[0].slice(0, 5), W: g.W, scores }))
  }
}
