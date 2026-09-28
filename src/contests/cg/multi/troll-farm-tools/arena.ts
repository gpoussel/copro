// Local games between two bot variants on referee-like maps, seats swapped per seed.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs arena.ts <games> [first seed] [A params json] [B params json]
import { Game, createGame, initInput, parseOutput, score, step, turnInput, Rng } from "./engine.js"
import { Bot, DEFAULT_PARAMS, Params } from "./bot.js"
import { Bot as RefBot, DEFAULT_PARAMS as REF_PARAMS } from "./bot-ref.js"

type Factory = (init: string[]) => { turn(lines: string[]): string }

export function play(seed: number, a: Factory, b: Factory, verbose = false): { s: number[]; g: Game; ms: number[]; errs: string[][] } {
  const g = createGame(seed)
  const bots = [a(initInput(g, 0)), b(initInput(g, 1))]
  const rng = new Rng(seed * 7 + 1)
  const ms = [0, 0]
  const errs: string[][] = [[], []]
  while (!g.over) {
    const tasks = []
    for (let p = 0; p < 2; p++) {
      const t0 = performance.now()
      let o: string
      try {
        o = bots[p].turn(turnInput(g, p))
      } catch (e) {
        console.error(`seed ${seed} p${p} crash turn ${g.turn + 1}:`, e)
        g.dead[p] = true
        o = "WAIT"
      }
      const dt = performance.now() - t0
      ms[p] = Math.max(ms[p], g.turn > 0 ? dt : 0)
      const r = parseOutput(g, p, o, n => rng.int(n))
      if (r.errors.length && errs[p].length < 20) errs[p].push(`t${g.turn + 1}: ${r.errors.join(", ")} <- ${o}`)
      if (r.critical) g.dead[p] = true
      tasks.push(...r.tasks)
      if (verbose) console.log(`t${g.turn + 1} p${p}: ${o}`)
    }
    if (g.dead[0] || g.dead[1]) break
    step(g, tasks)
  }
  return { s: [score(g, 0), score(g, 1)], g, ms, errs }
}

const isMain = process.argv[1]?.endsWith("arena.ts")
if (isMain) {
  const games = parseInt(process.argv[2] ?? "10")
  const first = parseInt(process.argv[3] ?? "1")
  const pa: Params = { ...DEFAULT_PARAMS, planAll: true, ...JSON.parse(process.argv[4] ?? "{}") }
  const pb: Params = { ...DEFAULT_PARAMS, ...JSON.parse(process.argv[5] ?? "{}") }
  const A: Factory = init => new Bot(init, pa)
  const B: Factory = process.env.SELF ? init => new Bot(init, pb) : init => new RefBot(init, { ...REF_PARAMS, planBudget: 2000, ...JSON.parse(process.argv[5] ?? "{}") })
  let w = 0,
    l = 0,
    d = 0,
    sa = 0,
    sb = 0
  let maxMs = 0
  for (let i = 0; i < games; i++) {
    const seed = first + Math.floor(i / 2)
    const swap = i % 2 === 1
    const r = swap ? play(seed, B, A) : play(seed, A, B)
    const [x, y] = swap ? [r.s[1], r.s[0]] : r.s
    sa += x
    sb += y
    if (x > y) w++
    else if (x < y) l++
    else d++
    maxMs = Math.max(maxMs, ...r.ms)
    const e = swap ? r.errs[1] : r.errs[0]
    if (e.length && i < 4) console.log("A errors:", e.slice(0, 3).join(" | "))
    if (process.env.V) console.log(`seed ${seed}${swap ? "s" : ""}: A ${x} B ${y} turns ${r.g.turn} trolls ${r.g.trolls.length}`)
  }
  console.log(`A ${w}W ${d}D ${l}L  avg ${(sa / games).toFixed(1)} vs ${(sb / games).toFixed(1)}  maxMs ${maxMs.toFixed(1)}`)
}
