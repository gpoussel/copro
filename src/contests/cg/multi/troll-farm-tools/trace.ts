// Prints our bot's outputs with troll positions for a turn range of one local game vs the reference.
import { Bot, DEFAULT_PARAMS } from "./bot.js"
import { Bot as RefBot, DEFAULT_PARAMS as REF } from "./bot-ref.js"
import { createGame, initInput, parseOutput, step, turnInput, Rng } from "./engine.js"
import { findSeed, javaGame } from "./seedmap.js"
import { readFileSync } from "fs"
// argv[2]: a local seed, jN (bench.ts map N), or a downloaded replay (its exact map); SOLO=1: the opponent only WAITs
const arg = process.argv[2]
const s = arg.endsWith(".json") ? 1 : +arg
const rp = arg.endsWith(".json") ? JSON.parse(readFileSync(arg, "utf8")) : null
const g = rp ? javaGame(findSeed(rp.refereeInput, JSON.parse(rp.frames[0].view.slice(rp.frames[0].view.indexOf("{"))).global.inputmodule)!) : arg.startsWith("j") ? javaGame(BigInt(+arg.slice(1)) * 7919n + 17n) : createGame(s)
console.log(initInput(g, 0).join("\n"))
const a = new Bot(initInput(g, 0), { ...DEFAULT_PARAMS, planAll: true, ...JSON.parse(process.argv[5] ?? "{}") })
const every = +(process.argv[6] ?? 1)
const b = new RefBot(initInput(g, 1), { ...REF, planAll: true })
const rng = new Rng(s)
while (!g.over) {
  const oa = a.turn(turnInput(g, 0))
  const ob = process.env.SOLO ? "WAIT" : b.turn(turnInput(g, 1))
  if (g.turn + 1 >= +process.argv[3] && g.turn + 1 <= +process.argv[4] && g.turn % every === 0) {
    const pos = g.trolls.filter(u => u.owner === 0).map(u => `${u.id}:${u.speed}${u.carry}${u.harvest}${u.chop}@${u.cell % g.W},${Math.floor(u.cell / g.W)}[${u.inv.join("")}]`).join(" ")
    const tr = g.trees.filter(t => t.size >= 1).length
    console.log(`t${g.turn + 1} inv ${g.inv[0].join(",")} trees ${tr} next ${JSON.stringify(a.designs[g.trolls.filter(u => u.owner === 0).length - 1] ?? null)} | ${pos} | ${oa}`)
  }
  step(g, [...parseOutput(g, 0, oa, x => rng.int(x)).tasks, ...parseOutput(g, 1, ob, x => rng.int(x)).tasks])
}
