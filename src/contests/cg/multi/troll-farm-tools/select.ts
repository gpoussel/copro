// Plan-selection criteria vs real outcomes (our bot as seat 0 vs an opponent), per opponent kind.
import { Bot, DEFAULT_PARAMS, PLANS, Sim, gameFromInput, Params } from "./bot.js"
import { createGame, initInput, turnInput } from "./engine.js"
import { play } from "./arena.js"
const n = +(process.argv[2] ?? 20)
const P0: Params = { ...DEFAULT_PARAMS, choosePlan: false }
const RAIDER: Params = { ...P0, aggro: 4, plan: [[2, 3, 0, 2]] }
const CUTTER: Params = { ...P0, aggro: 6, raidBeta: 1, plan: [[2, 2, 0, 2]] }
const OPP: Record<string, Params> = { ref: { ...DEFAULT_PARAMS, planAll: true }, raider: RAIDER, cutter: CUTTER }
const CRIT: Record<string, Params | null> = { passive: null, vsDefault: P0, vsRaider: RAIDER }
const real: Record<string, number[][]> = { ref: [], raider: [], cutter: [] }
const crit: Record<string, number[][]> = { passive: [], vsDefault: [], vsRaider: [] }
for (let s = 1; s <= n; s++) {
  const g0 = createGame(s)
  const init = initInput(g0, 0)
  const lines = turnInput(g0, 0)
  const dist = new Bot(init, P0, true).dist
  for (const o of Object.keys(OPP)) real[o].push(PLANS.map(plan => { const r = play(s, i => new Bot(i, { ...P0, plan }), i => new Bot(i, OPP[o])); return r.s[0] - r.s[1] }))
  for (const c of Object.keys(CRIT)) crit[c].push(PLANS.map(plan => new Sim(gameFromInput(init, lines, 0), init, { ...P0, plan }, dist, CRIT[c] ?? undefined).run(1e15)!))
}
const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length
const argmax = (a: number[]) => a.indexOf(Math.max(...a))
for (const o of Object.keys(OPP)) {
  console.log(`vs ${o}: fixed`, PLANS.map((_, i) => mean(real[o].map(r => r[i])).toFixed(0)).join(" "), " oracle", mean(real[o].map(r => Math.max(...r))).toFixed(0))
  for (const c of Object.keys(CRIT)) console.log(`   ${c}: ${mean(real[o].map((r, i) => r[argmax(crit[c][i])])).toFixed(1)}  wins ${real[o].filter((r, i) => r[argmax(crit[c][i])] > 0).length}/${n}`)
}
