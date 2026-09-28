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
let turnNo = 0
let maxMs = 0
let maxAt = 0
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
  const t0 = performance.now()
  const o = bot.turn(lines)
  const dt = performance.now() - t0
  if (++turnNo > 1 && dt > maxMs) (maxMs = dt), (maxAt = turnNo)
  if (dt > 45) console.error(`t${turnNo} slow ${dt.toFixed(1)} ms`)
  if (turnNo % 50 === 0) console.error(`t${turnNo} max ${maxMs.toFixed(1)} ms at t${maxAt} ${bot.rpLog}`)
  if (bot.planScores !== lastPlans) console.error("plans " + (lastPlans = bot.planScores))
  console.log(o)
}
