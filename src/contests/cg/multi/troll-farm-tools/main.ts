// CodinGame entry point (bundled after engine.ts and bot.ts by build.mjs).
import { Bot, DEFAULT_PARAMS } from "./bot.js"

const DUMP = false
const init = [readline()]
const mapH = parseInt(init[0].split(" ")[1])
for (let y = 0; y < mapH; y++) init.push(readline())
const OVERRIDES = {}
const bot = new Bot(init, { ...DEFAULT_PARAMS, ...OVERRIDES })
let first = true
let lastPlans = ""
for (;;) {
  const lines = [readline(), readline()]
  const nt = parseInt(readline())
  lines.push(String(nt))
  for (let i = 0; i < nt; i++) lines.push(readline())
  const nu = parseInt(readline())
  lines.push(String(nu))
  for (let i = 0; i < nu; i++) lines.push(readline())
  if (DUMP) console.error((first ? init.length + "|" + init.join("|") + "|" : "") + lines.join("|"))
  first = false
  const o = bot.turn(lines)
  if (bot.planScores !== lastPlans) console.error("plans " + (lastPlans = bot.planScores))
  console.log(o)
}
