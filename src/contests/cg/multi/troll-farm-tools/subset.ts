// Greedy choice of a small plan subset: per seed, sim values (passive, horizon H) and real outcomes
// vs the reference bot for every plan; a subset is scored by the real outcome of its sim-argmax.
import { Bot, DEFAULT_PARAMS, PLANS, Sim, gameFromInput, Params } from "./bot.js"
import { Bot as RefBot, DEFAULT_PARAMS as REF } from "./bot-ref.js"
import { createGame, initInput, turnInput } from "./engine.js"
import { play } from "./arena.js"
const n = +(process.argv[2] ?? 20)
const H = +(process.argv[3] ?? 200)
const P0: Params = { ...DEFAULT_PARAMS, choosePlan: false }
const real: number[][] = []
const sim: number[][] = []
for (let s = 101; s < 101 + n; s++) {
  const g0 = createGame(s)
  const init = initInput(g0, 0)
  const lines = turnInput(g0, 0)
  const dist = new Bot(init, P0, true).dist
  real.push(PLANS.map(plan => { const r = play(s, i => new Bot(i, { ...P0, plan }), i => new RefBot(i, { ...REF, planAll: true })); return r.s[0] - r.s[1] }))
  sim.push(PLANS.map(plan => { const x = new Sim(gameFromInput(init, lines, 0), init, { ...P0, plan }, dist); x.horizon = H; return x.run(1e15)! }))
}
const val = (sub: number[]) => real.reduce((acc, r, i) => { let b = sub[0]; for (const k of sub) if (sim[i][k] > sim[i][b]) b = k; return acc + r[b] }, 0) / n
let sub: number[] = []
for (let step = 0; step < 8; step++) {
  let best = -1, bv = -1e9
  for (let k = 0; k < PLANS.length; k++) if (!sub.includes(k)) { const v = val([...sub, k]); if (v > bv) (bv = v), (best = k) }
  sub.push(best)
  console.log(`${sub.length} plans ${JSON.stringify(sub)}: ${bv.toFixed(1)}`)
}
console.log("all:", val(PLANS.map((_, i) => i)).toFixed(1))
