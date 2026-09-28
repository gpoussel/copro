// Economy benchmark: our bot alone (the opponent only WAITs) on real referee maps (seedmap.ts),
// paired per seed between parameter sets. Deterministic, so small economy changes show up.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs bench.ts <seeds> '<params A>' ['<params B>'...]
import { initInput, parseOutput, score, step, turnInput } from "./engine.js"
import { Bot, DEFAULT_PARAMS, Params, setCheap } from "./bot.js"
import { javaGame } from "./seedmap.js"

export function solo(seed: number, p: Partial<Params>): { s: number; trolls: string; trains: number[] } {
  const g = javaGame(BigInt(seed) * 7919n + 17n)
  const bot = new Bot(initInput(g, 0), { ...DEFAULT_PARAMS, planAll: true, ...p })
  while (!g.over) step(g, parseOutput(g, 0, bot.turn(turnInput(g, 0)), () => 0).tasks)
  const trolls = g.trolls.filter(u => u.owner === 0).map(u => `${u.speed}${u.carry}${u.harvest}${u.chop}`).join(",")
  return { s: score(g, 0), trolls, trains: bot.trainTurns }
}

if (process.argv[1]?.endsWith("bench.ts")) {
  const n = +process.argv[2]
  if (process.env.CHEAP) setCheap(JSON.parse(process.env.CHEAP))
  const sets = process.argv.slice(3).map(a => JSON.parse(a) as Partial<Params>)
  const tot = sets.map(() => 0)
  const V = !!process.env.V
  const first = +(process.env.FIRST ?? 1)
  for (let s = first; s < first + n; s++) {
    const r = sets.map(p => solo(s, p))
    r.forEach((x, i) => (tot[i] += x.s))
    if (V) console.log(`seed ${s}: ` + r.map(x => `${x.s} [${x.trolls}] t${x.trains.join(",")}`).join("  |  "))
  }
  console.log("avg " + tot.map(t => (t / n).toFixed(1)).join("  "))
}
