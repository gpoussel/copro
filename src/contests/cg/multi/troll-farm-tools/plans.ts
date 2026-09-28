// Compares training plans: each plan plays every seed (both seats) against the reference bot.
// Prints per-plan mean score difference and, per seed, which plan was best.
import { Bot, DEFAULT_PARAMS } from "./bot.js"
import { Bot as RefBot, DEFAULT_PARAMS as REF } from "./bot-ref.js"
import { play } from "./arena.js"
const PLANS: Record<string, number[][]> = {
  A: [[1, 2, 1, 1], [2, 4, 1, 2], [2, 4, 1, 2]],
  B: [[1, 2, 1, 1], [2, 3, 1, 2], [2, 3, 1, 2]],
  C: [[1, 2, 1, 1], [1, 2, 1, 1], [2, 4, 1, 2]],
  D: [[1, 2, 1, 1], [1, 2, 1, 2], [1, 2, 1, 2], [1, 2, 1, 2]],
  E: [[2, 4, 1, 2], [2, 4, 1, 2]],
  F: [[1, 2, 2, 1], [2, 4, 2, 2]],
  G: [[1, 2, 1, 1], [2, 4, 1, 2]],
  H: [[1, 2, 1, 1], [2, 4, 1, 3], [2, 4, 1, 2]],
  I: [[1, 2, 1, 1], [2, 3, 1, 2], [2, 4, 1, 2], [2, 4, 1, 2]],
  J: [[1, 1, 1, 1], [2, 4, 1, 2], [2, 4, 1, 2]],
}
const n = +(process.argv[2] ?? 20)
const names = Object.keys(PLANS)
const diff: Record<string, number[]> = {}
for (const k of names) diff[k] = []
for (let s = 1; s <= n; s++) {
  for (const k of names) {
    const A = (i: string[]) => new Bot(i, { ...DEFAULT_PARAMS, plan: PLANS[k] })
    const B = (i: string[]) => new RefBot(i, REF)
    const r1 = play(s, A, B)
    const r2 = play(s, B, A)
    diff[k].push((r1.s[0] - r1.s[1] + r2.s[1] - r2.s[0]) / 2)
  }
}
const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length
for (const k of names) console.log(k, mean(diff[k]).toFixed(1), JSON.stringify(PLANS[k]))
let oracle = 0
const bestCount: Record<string, number> = {}
for (let i = 0; i < n; i++) {
  let b = names[0]
  for (const k of names) if (diff[k][i] > diff[b][i]) b = k
  oracle += diff[b][i]
  bestCount[b] = (bestCount[b] ?? 0) + 1
}
console.log("oracle (best plan per seed):", (oracle / n).toFixed(1), JSON.stringify(bestCount))
