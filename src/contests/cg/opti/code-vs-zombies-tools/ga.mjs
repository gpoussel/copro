// Offline scorer for the GENETIC bot (code-vs-zombies.ts), simulating the real
// online replanning: each turn run a seeded GA for a fixed eval budget, play the
// first move, advance, repeat. Mirrors the bot's evalGenome/heuristic/plan.
//
// Run:   pnpm exec node src/contests/cg/opti/code-vs-zombies-tools/ga.mjs
//        POP=60 GENS=30 node .../ga.mjs   (override budget)
//
// Offline TOTAL lands ~250k on the 21 visible cases (~5x the pure heuristic in
// sim.mjs). The bot itself uses a TIME budget (90ms/turn) instead of fixed gens,
// so on CodinGame it does as many generations as the hardware allows. Standard
// caveat: visible totals don't predict the hidden validator.

import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const HERE = dirname(fileURLToPath(import.meta.url))
const cases = JSON.parse(readFileSync(join(HERE, "cases.json"), "utf8"))

const ASH = 1000, ZS = 400, KILL = 2000, W = 16000, H = 9000, TAU = Math.PI * 2
const HOR = process.env.HOR?+process.env.HOR:40
const POP = process.env.POP ? +process.env.POP : 60
const GENS = process.env.GENS ? +process.env.GENS : 30
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by)
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
const fib = [1, 2]
for (let i = 2; i < 400; i++) fib[i] = fib[i - 1] + fib[i - 2]

function parse(s) {
  const L = s.split("\n"); let i = 0
  const [ax, ay] = L[i++].split(" ").map(Number)
  const hc = +L[i++]; const humans = []
  for (let k = 0; k < hc; k++) { const [x, y] = L[i++].split(" ").map(Number); humans.push({ x, y }) }
  const zc = +L[i++]; const zombies = []
  for (let k = 0; k < zc; k++) { const [x, y] = L[i++].split(" ").map(Number); zombies.push({ x, y }) }
  return { ash: { x: ax, y: ay }, humans, zombies }
}
const moveToward = (p, t, step) => {
  const d = dist(p.x, p.y, t.x, t.y)
  if (d <= step || d === 0) return { x: t.x, y: t.y }
  return { x: Math.floor(p.x + ((t.x - p.x) / d) * step), y: Math.floor(p.y + ((t.y - p.y) / d) * step) }
}
const zTarget = (z, humans, ash) => {
  let best = ash, bd = dist(z.x, z.y, ash.x, ash.y)
  for (const h of humans) { const d = dist(z.x, z.y, h.x, h.y); if (d < bd) { bd = d; best = h } }
  return best
}
const clone = (st) => ({ ash: { ...st.ash }, humans: st.humans.map((h) => ({ ...h })), zombies: st.zombies.map((z) => ({ ...z })) })
function computeNexts(st) {
  for (const z of st.zombies) { const t = zTarget(z, st.humans, st.ash); const n = moveToward(z, t, ZS); z.nx = n.x; z.ny = n.y }
}
function decide(ash, humans, zombies) {
  const zE = (d) => Math.ceil(d / ZS), aE = (d) => Math.max(0, Math.ceil((d - KILL) / ASH))
  const info = humans.map((h) => {
    let n = Infinity
    for (const z of zombies) { const d = dist(z.x, z.y, h.x, h.y); if (d < n) n = d }
    return { h, zE: zE(n), aE: aE(dist(ash.x, ash.y, h.x, h.y)) }
  })
  const sav = info.filter((o) => o.aE < o.zE); if (sav.length) { sav.sort((a, b) => a.zE - b.zE); return { x: sav[0].h.x, y: sav[0].h.y } }
  const thr = info.filter((o) => o.zE <= 15); if (thr.length) { thr.sort((a, b) => a.aE - b.aE); return { x: thr[0].h.x, y: thr[0].h.y } }
  let bc = -1, best = zombies[0]
  for (const z of zombies) { let c = 0; for (const w of zombies) if (dist(z.nx, z.ny, w.nx, w.ny) <= KILL) c++; if (c > bc) { bc = c; best = z } }
  return { x: best.nx, y: best.ny }
}
function applyTurn(st, target) {
  let s = 0
  for (const z of st.zombies) { z.x = z.nx; z.y = z.ny }
  st.ash = moveToward(st.ash, target, ASH)
  const surv = []; let k = 0; const alive = st.humans.length
  for (const z of st.zombies) { if (dist(z.x, z.y, st.ash.x, st.ash.y) <= KILL) { s += alive * alive * 10 * fib[k]; k++ } else surv.push(z) }
  st.zombies = surv
  st.humans = st.humans.filter((h) => !st.zombies.some((z) => z.x === h.x && z.y === h.y))
  return s
}
function evalGenome(st0, genome) {
  const st = clone(st0); let score = 0
  for (let t = 0; t < genome.length; t++) {
    if (st.zombies.length === 0) break
    if (st.humans.length === 0) return -1e9
    computeNexts(st)
    const ang = genome[t]
    const tx = clamp(Math.round(st.ash.x + Math.cos(ang) * ASH), 0, W - 1)
    const ty = clamp(Math.round(st.ash.y + Math.sin(ang) * ASH), 0, H - 1)
    score += applyTurn(st, { x: tx, y: ty })
  }
  if (st.humans.length === 0) return -1e9
  return score + st.humans.length * st.humans.length * 50
}
function heuristicGenome(st0) {
  const st = clone(st0); const g = []
  for (let t = 0; t < HOR; t++) {
    if (st.zombies.length === 0 || st.humans.length === 0) { g.push(0); continue }
    computeNexts(st); const tgt = decide(st.ash, st.humans, st.zombies)
    g.push(Math.atan2(tgt.y - st.ash.y, tgt.x - st.ash.x)); applyTurn(st, tgt)
  }
  return g
}
const rnd = Math.random
function plan(st, prev) {
  const seed = heuristicGenome(st)
  const P = [seed.slice()]
  if (prev) { const g = prev.slice(); while (g.length < HOR) g.push(rnd() * TAU); P.push(g.slice(0, HOR)) }
  for (let i = 0; i < 4; i++) { const g = seed.slice(); for (let t = 0; t < HOR; t++) if (rnd() < 0.3) g[t] = (g[t] + (rnd() - 0.5)) % TAU; P.push(g) }
  while (P.length < POP) { const g = []; for (let t = 0; t < HOR; t++) g.push(rnd() * TAU); P.push(g) }
  let best = seed, bestS = evalGenome(st, seed)
  for (let gen = 0; gen < GENS; gen++) {
    const sc = P.map((g) => ({ g, s: evalGenome(st, g) })).sort((a, b) => b.s - a.s)
    if (sc[0].s > bestS) { bestS = sc[0].s; best = sc[0].g.slice() }
    const en = Math.max(3, POP >> 2)
    const elite = sc.slice(0, en).map((x) => x.g)
    const next = elite.map((g) => g.slice()); next.push(seed.slice())
    while (next.length < POP) {
      const a = elite[(rnd() * en) | 0], b = elite[(rnd() * en) | 0], c = []
      for (let t = 0; t < HOR; t++) { let v = rnd() < 0.5 ? a[t] : b[t]; if (rnd() < 0.15) v = rnd() * TAU; else if (rnd() < 0.35) v = (v + (rnd() - 0.5)) % TAU; c.push(v) }
      next.push(c)
    }
    for (let i = 0; i < POP; i++) P[i] = next[i]
  }
  return best
}
let total = 0, t0 = Date.now()
cases.forEach((s, idx) => {
  let st = parse(s); let score = 0, prev = null, turns = 0
  for (; turns < 300; turns++) {
    if (st.zombies.length === 0) break
    if (st.humans.length === 0) { score = 0; break }
    const best = plan(st, prev)
    computeNexts(st)
    const ang = best[0]
    const tx = clamp(Math.round(st.ash.x + Math.cos(ang) * ASH), 0, W - 1)
    const ty = clamp(Math.round(st.ash.y + Math.sin(ang) * ASH), 0, H - 1)
    score += applyTurn(st, { x: tx, y: ty })
    prev = best.slice(1)
  }
  if (st.humans.length === 0) score = 0
  total += score
  console.log(`test ${String(idx + 1).padStart(2)}: ${score} (${turns}t)`)
})
console.log(`GA TOTAL: ${total}  [${Date.now() - t0}ms, POP=${POP} GENS=${GENS} HOR=${HOR}]`)
