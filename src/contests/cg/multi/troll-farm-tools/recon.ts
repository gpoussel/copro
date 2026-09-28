// Rebuilds any downloaded replay (anyone's games) turn by turn: the map from the seed (seedmap.ts),
// then both seats' recorded outputs through the engine; random MOVE fallbacks are resolved with
// the referee summary ("troll N moved to (x, y)"). Checks the final scores.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs recon.ts replay.json...
import { readFileSync } from "fs"
import { Game, parseOutput, score, step, initInput } from "./engine.js"
import { findSeed, javaGame } from "./seedmap.js"

type Frame = { agentId: string; stdout?: string; summary?: string; view?: string }
export interface Recon {
  gameId: number
  pseudos: string[]
  scores: number[]
  states: Game[] // states[t] = before turn t + 1's outputs
  outs: string[][] // outs[t][seat]
  ok: boolean
}

export const clone = (g: Game): Game => ({
  ...g,
  grid: g.grid,
  shack: [...g.shack],
  inv: g.inv.map(v => [...v]),
  trees: g.trees.map(t => ({ ...t })),
  trolls: g.trolls.map(u => ({ ...u, inv: [...u.inv] })),
  dead: [...g.dead],
  dist: g.dist,
})

export function reconstruct(file: string): Recon | null {
  const rp = JSON.parse(readFileSync(file, "utf8"))
  const v0: string = rp.frames[0].view
  const want = JSON.parse(v0.slice(v0.indexOf("{"))).global.inputmodule as string
  const seed = findSeed(rp.refereeInput, want)
  if (seed === null) return null
  const g = javaGame(seed)
  const pseudos = rp.agents.sort((a: { index: number }, b: { index: number }) => a.index - b.index).map((a: { codingamer: { pseudo: string } }) => a.codingamer.pseudo)
  const turns: { out: string[]; summary: string }[] = []
  for (const f of rp.frames.slice(1) as Frame[]) {
    const seat = +f.agentId
    if (seat === 0 || !turns.length) turns.push({ out: ["", ""], summary: "" })
    const cur = turns[turns.length - 1]
    cur.out[seat] = (f.stdout ?? "").trim()
    if (f.summary && f.summary !== "None") cur.summary += f.summary
  }
  let firstBad = -1
  const states: Game[] = []
  const outs: string[][] = []
  for (const t of turns) {
    if (g.over) break
    states.push(clone(g))
    outs.push(t.out.map(s => (s === "None" ? "" : s)))
    const moved = new Map<number, number>()
    for (const m of t.summary.matchAll(/troll (\d+) moved to \((\d+), (\d+)\)/g)) moved.set(+m[1], +m[3] * g.W + +m[2])
    const tasks = []
    for (let p = 0; p < 2; p++) {
      const r = parseOutput(g, p, outs[outs.length - 1][p], () => 0)
      for (const task of r.tasks) if (task.unit && moved.has(task.unit.id) && task.kind === 1) task.target = moved.get(task.unit.id)!
      tasks.push(...r.tasks)
    }
    step(g, tasks)
    if (process.env.RECON_DEBUG && firstBad < 0)
      for (const [id, c] of moved) {
        const u = g.trolls.find(x => x.id === id)
        if (!u || u.cell !== c) {
          firstBad = g.turn
          console.log(`turn ${g.turn}: troll ${id} at ${u && [u.cell % g.W, Math.floor(u.cell / g.W)]} want ${[c % g.W, Math.floor(c / g.W)]}\n  ${outs[outs.length - 1].join("\n  ")}\n  ${t.summary.replace(/\n/g, " | ")}`)
        }
      }
  }
  states.push(clone(g))
  const scores = [score(g, 0), score(g, 1)]
  return { gameId: rp.gameId, pseudos, scores, states, outs, ok: scores[0] === rp.scores[0] && scores[1] === rp.scores[1] }
}

if (process.argv[1]?.endsWith("recon.ts"))
  for (const f of process.argv.slice(2)) {
    const r = reconstruct(f)
    if (!r) console.log(f, "seed not found")
    else console.log(f, r.pseudos.join(" vs "), r.scores.join("-"), r.ok ? "OK" : "MISMATCH", r.states.length - 1, "turns")
  }
void initInput
