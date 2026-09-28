// Offline plan table: every candidate plan played solo (fixed plan, no re-planning) on real maps,
// with the map features, for choosing a plan by map type at run time without simulations.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs planmap.ts <from> <to> '<params>' > out.jsonl
import { initInput, parseOutput, score, step, turnInput } from "./engine.js"
import { BIG_PLANS, Bot, DEFAULT_PARAMS, PLANS, Params } from "./bot.js"
import { javaGame } from "./seedmap.js"
import { mapFeatures } from "./mapfeat.js"

import { CHEAP_START, GARDEN_PLAN } from "./bot.js"
// candidates: our plans + plans seen in Legend replays (cedricdd, anuragm, delineate, bl4sterino)
export const ALL_PLANS = [
  ...PLANS,
  ...BIG_PLANS,
  CHEAP_START,
  GARDEN_PLAN,
  [[2, 2, 2, 0], [3, 4, 0, 2], [2, 4, 0, 3]],
  [[3, 2, 2, 1], [2, 4, 0, 3]],
  [[1, 2, 2, 2], [2, 4, 0, 3], [2, 4, 0, 3]],
  [[2, 2, 2, 1], [3, 4, 2, 3], [3, 4, 0, 3]],
  [[2, 3, 1, 2], [3, 4, 1, 2], [2, 4, 1, 3], [2, 4, 1, 3]],
  [[2, 2, 2, 2], [3, 4, 1, 2], [3, 4, 1, 3]],
  [[2, 1, 1, 1], [2, 2, 1, 1], [3, 4, 0, 2], [2, 4, 0, 3]],
]
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
