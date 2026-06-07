// Faithful Code vs Zombies referee + scorer for offline tuning.
// Run: pnpm exec node src/contests/cg/opti/code-vs-zombies-tools/sim.mjs
//
// The rules are fully specified and deterministic, so this reproduces the engine
// exactly (turn order: zombies move -> Ash moves -> Ash shoots <=2000 -> zombies
// on a human eat). Score per kill = aliveHumans^2 * 10 * fib(n) for the n-th kill
// in a turn (fib = 1,2,3,5,8,...). Losing every human => 0 for that test.
//
// `decide()` MUST mirror src/contests/cg/opti/code-vs-zombies.ts. Keep them in
// sync by hand (the shipped bot is a standalone readline program).
//
// CAVEAT (see opti/CLAUDE.md golden rule): the visible cases here do NOT predict
// the hidden validator — use this to avoid regressions and compare ideas, but the
// only ground truth is a real submission.

import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const HERE = dirname(fileURLToPath(import.meta.url))
const cases = JSON.parse(readFileSync(join(HERE, "cases.json"), "utf8"))

const ASH = 1000
const ZS = 400
const KILL = 2000
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by)
const fib = [1, 2]
for (let i = 2; i < 200; i++) fib[i] = fib[i - 1] + fib[i - 2]

function parse(s) {
  const L = s.split("\n")
  let i = 0
  const [ax, ay] = L[i++].split(" ").map(Number)
  const hc = +L[i++]
  const humans = []
  for (let k = 0; k < hc; k++) {
    const [x, y] = L[i++].split(" ").map(Number)
    humans.push({ id: k, x, y })
  }
  const zc = +L[i++]
  const zombies = []
  for (let k = 0; k < zc; k++) {
    const [x, y] = L[i++].split(" ").map(Number)
    zombies.push({ id: k, x, y })
  }
  return { ash: { x: ax, y: ay }, humans, zombies }
}

const moveToward = (p, t, step) => {
  const d = dist(p.x, p.y, t.x, t.y)
  if (d <= step || d === 0) return { x: t.x, y: t.y }
  return { x: Math.floor(p.x + ((t.x - p.x) / d) * step), y: Math.floor(p.y + ((t.y - p.y) / d) * step) }
}

function zombieTarget(z, humans, ash) {
  let best = ash
  let bd = dist(z.x, z.y, ash.x, ash.y)
  for (const h of humans) {
    const d = dist(z.x, z.y, h.x, h.y)
    if (d < bd) {
      bd = d
      best = h
    }
  }
  return best
}

// ---- BOT: mirror of code-vs-zombies.ts ----
function decide(ash, humans, zombies) {
  const zEtaOf = (d) => Math.ceil(d / ZS)
  const aEtaOf = (d) => Math.max(0, Math.ceil((d - KILL) / ASH))
  const info = humans.map((h) => {
    let n = Infinity
    for (const z of zombies) {
      const d = dist(z.x, z.y, h.x, h.y)
      if (d < n) n = d
    }
    return { h, zE: zEtaOf(n), aE: aEtaOf(dist(ash.x, ash.y, h.x, h.y)) }
  })
  const savable = info.filter((o) => o.aE < o.zE)
  if (savable.length) {
    savable.sort((a, b) => a.zE - b.zE)
    return { x: savable[0].h.x, y: savable[0].h.y }
  }
  const threatened = info.filter((o) => o.zE <= 15)
  if (threatened.length) {
    threatened.sort((a, b) => a.aE - b.aE)
    return { x: threatened[0].h.x, y: threatened[0].h.y }
  }
  let bc = -1
  let best = zombies[0]
  for (const z of zombies) {
    let c = 0
    for (const w of zombies) if (dist(z.nx, z.ny, w.nx, w.ny) <= KILL) c++
    if (c > bc) {
      bc = c
      best = z
    }
  }
  return { x: best.nx, y: best.ny }
}

function runGame(init) {
  const state = {
    ash: { ...init.ash },
    humans: init.humans.map((h) => ({ ...h })),
    zombies: init.zombies.map((z) => ({ ...z })),
  }
  let score = 0
  for (let turn = 0; turn < 1000; turn++) {
    if (state.zombies.length === 0) break
    if (state.humans.length === 0) return 0
    // next positions (engine provides these to the bot each turn)
    const nexts = state.zombies.map((z) => moveToward(z, zombieTarget(z, state.humans, state.ash), ZS))
    state.zombies.forEach((z, i) => {
      z.nx = nexts[i].x
      z.ny = nexts[i].y
    })
    const tgt = decide(state.ash, state.humans, state.zombies)
    for (const z of state.zombies) {
      z.x = z.nx
      z.y = z.ny
    }
    state.ash = moveToward(state.ash, tgt, ASH)
    const survivors = []
    let killed = 0
    const alive = state.humans.length
    for (const z of state.zombies) {
      if (dist(z.x, z.y, state.ash.x, state.ash.y) <= KILL) {
        score += alive * alive * 10 * fib[killed]
        killed++
      } else survivors.push(z)
    }
    state.zombies = survivors
    state.humans = state.humans.filter((h) => !state.zombies.some((z) => z.x === h.x && z.y === h.y))
  }
  return state.humans.length === 0 ? 0 : score
}

let total = 0
cases.forEach((s, idx) => {
  const sc = runGame(parse(s))
  total += sc
  console.log(`test ${String(idx + 1).padStart(2)}: ${sc}`)
})
console.log(`TOTAL: ${total}`)
