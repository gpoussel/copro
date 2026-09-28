// Replays the maps of dumped IDE games locally: our bot vs the Boss5 clone from the same start.
import { readFileSync } from "fs"
import { Bot, DEFAULT_PARAMS, gameFromInput } from "./bot.js"
import { initInput, parseOutput, score, step, turnInput } from "./engine.js"
import { Boss5 } from "./boss5.js"
type Frame = { stdout?: string; stderr?: string; seat: number }
for (const file of process.argv.slice(2)) {
  const rp = JSON.parse(readFileSync(file, "utf8")) as { frames: Frame[]; agents: { seat: number; pseudo: string; score: number }[] }
  const me = rp.agents.find(a => a.pseudo === "gpoussel_")!
  const opp = rp.agents.find(a => a !== me)!
  const f0 = rp.frames.slice(1).find(f => f.seat === me.seat)!
  const l = (f0.stderr ?? "").trim().split("\n")[0].split("|")
  const n = parseInt(l[0])
  if (isNaN(n)) continue
  const init = l.slice(1, n + 1)
  const g = gameFromInput(init, l.slice(n + 1), 0)
  const a = new Bot(initInput(g, 0), { ...DEFAULT_PARAMS, planAll: true })
  const b = new Boss5(initInput(g, 1))
  while (!g.over) {
    const oa = a.turn(turnInput(g, 0))
    const ob = b.turn(turnInput(g, 1))
    step(g, [...parseOutput(g, 0, oa, () => 0).tasks, ...parseOutput(g, 1, ob, () => 0).tasks])
  }
  console.log(file.split("/").pop(), `real ${me.score}-${opp.score} (${opp.pseudo})  local vs clone ${score(g, 0)}-${score(g, 1)}  trained ${a.trainTurns.join(",")}`)
}
