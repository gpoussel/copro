// Equivalence check of bot.cpp against bot.ts: both get the same inputs every turn (planAll, i.e.
// deterministic), outputs are compared; the TS output drives the game. Opponent: WAIT (SOLO=1) or
// the reference bot. Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs cppcheck.ts <binary> <from> <to>
import { spawn } from "child_process"
import { createInterface } from "readline"
import { initInput, parseOutput, step, turnInput } from "./engine.js"
import { Bot, DEFAULT_PARAMS } from "./bot.js"
import { Bot as RefBot, DEFAULT_PARAMS as REF } from "./bot-ref.js"
import { javaGame } from "./seedmap.js"

async function game(bin: string, seed: number): Promise<string | null> {
  const g = javaGame(BigInt(seed) * 7919n + 17n)
  const proc = spawn(bin, ["planall"], { stdio: ["pipe", "pipe", "ignore"] })
  const rl = createInterface({ input: proc.stdout })
  const it = rl[Symbol.asyncIterator]()
  const send = (lines: string[]) => proc.stdin.write(lines.join("\n") + "\n")
  send(initInput(g, 0))
  const a = new Bot(initInput(g, 0), { ...DEFAULT_PARAMS, planAll: true })
  const b = process.env.SOLO ? null : new RefBot(initInput(g, 1), { ...REF, planAll: true })
  let mismatch: string | null = null
  while (!g.over) {
    const inp = turnInput(g, 0)
    send(inp)
    const cpp = ((await it.next()).value as string).trim()
    const ts = a.turn(inp)
    if (cpp !== ts && !mismatch) mismatch = `seed ${seed} turn ${g.turn + 1}\n  ts : ${ts}\n  cpp: ${cpp}`
    if (mismatch) break
    const tasks = parseOutput(g, 0, ts, () => 0).tasks
    if (b) tasks.push(...parseOutput(g, 1, b.turn(turnInput(g, 1)), () => 0).tasks)
    step(g, tasks)
  }
  proc.kill()
  return mismatch
}

const [bin, from, to] = [process.argv[2], +process.argv[3], +process.argv[4]]
let ok = 0
for (let s = from; s <= to; s++) {
  const r = await game(bin, s)
  if (r) console.log(r)
  else ok++
}
console.log(`${ok}/${to - from + 1} games identical`)
