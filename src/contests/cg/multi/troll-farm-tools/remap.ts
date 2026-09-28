// Replays the map of any downloaded game locally from `seat`'s side: our bot solo (opponent WAITs)
// and vs the reference bot, next to the real result. Shows what the opponent cost us.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs remap.ts <pseudo> '<params>' replay.json...
import { readFileSync } from "fs"
import { initInput, parseOutput, score, step, turnInput, Game } from "./engine.js"
import { Bot, DEFAULT_PARAMS, Params } from "./bot.js"
import { Bot as RefBot, DEFAULT_PARAMS as REF } from "./bot-ref.js"
import { findSeed, javaGame } from "./seedmap.js"
import { clone } from "./recon.js"

const who = process.argv[2]
const P: Params = { ...DEFAULT_PARAMS, planAll: true, ...JSON.parse(process.argv[3]) }
for (const f of process.argv.slice(4)) {
  const rp = JSON.parse(readFileSync(f, "utf8"))
  const v0: string = rp.frames[0].view
  const seed = findSeed(rp.refereeInput, JSON.parse(v0.slice(v0.indexOf("{"))).global.inputmodule)
  if (seed === null) continue
  const agents = rp.agents.sort((a: { index: number }, b: { index: number }) => a.index - b.index)
  const seat = agents.findIndex((a: { codingamer: { pseudo: string } }) => a.codingamer.pseudo === who)
  const g0 = javaGame(seed)
  const run = (vsRef: boolean) => {
    const g: Game = clone(g0)
    g.dist = undefined
    const a = new Bot(initInput(g, seat), P)
    const b = vsRef ? new RefBot(initInput(g, 1 - seat), { ...REF, planAll: true }) : null
    while (!g.over) {
      const t = parseOutput(g, seat, a.turn(turnInput(g, seat)), () => 0).tasks
      if (b) t.push(...parseOutput(g, 1 - seat, b.turn(turnInput(g, 1 - seat)), () => 0).tasks)
      step(g, t)
    }
    return `${score(g, seat)}${b ? "-" + score(g, 1 - seat) : ""} [${g.trolls.filter(u => u.owner === seat).map(u => `${u.speed}${u.carry}${u.harvest}${u.chop}`).join(",")}]`
  }
  console.log(`${f.split("/").pop()} real ${rp.scores[seat]}-${rp.scores[1 - seat]} vs ${agents[1 - seat].codingamer.pseudo} | solo ${run(false)} | vs ref ${run(true)}`)
}
