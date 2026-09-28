// Per-troll action breakdown for our bot (seat 0) over a few local games vs the reference.
import { Bot, DEFAULT_PARAMS } from "./bot.js"
import { Bot as RefBot, DEFAULT_PARAMS as REF } from "./bot-ref.js"
import { createGame, initInput, parseOutput, step, turnInput, score, Rng } from "./engine.js"
const n = +(process.argv[2] ?? 4)
const agg: Record<string, Record<string, number>> = {}
for (let s = 1; s <= n; s++) {
  const g = createGame(s)
  const a = new Bot(initInput(g, 0), { ...DEFAULT_PARAMS, planAll: true })
  const b = new RefBot(initInput(g, 1), { ...REF, planBudget: 2000 })
  const rng = new Rng(s)
  while (!g.over) {
    const oa = a.turn(turnInput(g, 0))
    const ob = b.turn(turnInput(g, 1))
    const used = new Map<number, string>()
    for (const c of oa.split(";")) {
      const w = c.trim().split(" ")
      if (w[0] !== "TRAIN" && w[0] !== "WAIT" && w.length > 1) used.set(+w[1], w[0])
    }
    g.trolls.filter(u => u.owner === 0).forEach((u, i) => {
      const key = `troll#${i} ${u.speed}${u.carry}${u.harvest}${u.chop}`
      agg[key] = agg[key] ?? {}
      const act = used.get(u.id) ?? "IDLE"
      agg[key][act] = (agg[key][act] ?? 0) + 1
    })
    step(g, [...parseOutput(g, 0, oa, x => rng.int(x)).tasks, ...parseOutput(g, 1, ob, x => rng.int(x)).tasks])
  }
  console.log(`seed ${s}: ${score(g, 0)} vs ${score(g, 1)}, plan ${JSON.stringify(a.P.plan)}`)
}
for (const k of Object.keys(agg).sort()) console.log(k, JSON.stringify(agg[k]))
