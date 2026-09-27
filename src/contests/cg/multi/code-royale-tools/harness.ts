// Replay check for engine.ts. The replay's agent-0 stderr holds our full input each turn (lines
// joined with "|"). Each turn: rebuild the state from our input, apply both recorded outputs,
// render the input we would receive next and compare it line by line with the recorded one (gold,
// touched site, every site's gold / size / structure / owner / params, units). The referee sends
// units per player in spawn order with the queen last, so units are matched by list position
// (stricter than nearest-position matching). The enemy's gold is checked against the HUD text of the
// view frames. Two passes:
// - honest: hidden info (enemy gold, hidden site gold, hidden max mine sizes and enemy mine rates) is
//   carried over from the previous simulated state / mirror site / defaults, as a bot would;
// - oracle: hidden info comes from the replay's view data (HUD gold, site tooltips), which isolates
//   engine errors from hidden-information drift.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs harness.ts [replay.json]
import { readFileSync } from "fs"
import {
  Action,
  State,
  clone,
  parseAction,
  parseInit,
  renderInput,
  sideFromQueen,
  stateFromInput,
  step,
} from "./engine.js"

type Frame = { agentId: number; stdout: string | null; stderr: string | null; view: string }
const file = process.argv[2] ?? "/root/.claude/jobs/2abbad3f/tmp/crsim/906108983.json"
const replay = JSON.parse(readFileSync(file, "utf8")) as { frames: Frame[] }
const frames = replay.frames

const inputs: string[][] = [] // inputs[t] for turn t (1-based)
const outs: [string[], string[]][] = [] // outs[t] = [player0 lines, player1 lines] by agent id
let initLines: string[] = []
let turn = 0
for (const f of frames) {
  if (f.agentId === 0) {
    turn++
    let lines = (f.stderr ?? "").trim().split("|")
    if (turn === 1) {
      const n = parseInt(lines[0])
      initLines = lines.slice(0, n + 1)
      lines = lines.slice(n + 1)
    }
    inputs[turn] = lines
    outs[turn] = [(f.stdout ?? "").trim().split("\n"), ["WAIT", "TRAIN"]]
  } else if (f.agentId === 1 && turn > 0) outs[turn][1] = (f.stdout ?? "").trim().split("\n")
}
const T = turn
const map = parseInit(initLines)
const nSites = map.length

// First view frame: tooltips give the true initial gold of every site (entity id -> site id).
const view0 = JSON.parse(frames[0].view.slice(frames[0].view.indexOf("{"))).frame
const ent2site = new Map<string, number>()
const tt0 = view0.tooltips[0] as Record<string, { type: string; id?: number }>
for (const k of Object.keys(tt0)) if (tt0[k].type === "Site") ent2site.set(k, tt0[k].id as number)
const initGold: number[] = []
const tt1 = view0.tooltips[1] as Record<string, string[]>
for (const k of Object.keys(tt1)) {
  const id = ent2site.get(k)
  if (id === undefined) continue
  for (const l of tt1[k]) if (l.startsWith("Remaining gold: ")) initGold[id] = parseInt(l.slice(16))
}

// Our side: the first player's queen starts top-left.
const firstQueen = inputs[1].slice(nSites + 2).find(l => l.split(" ")[2] === "0" && l.split(" ")[3] === "-1")!
const me = sideFromQueen(parseInt(firstQueen.split(" ")[0]))
const en = 1 - me

// HUD texts in the view frames: entity 39 = first player's gold, 47 = second player's gold (after the turn).
const hudGold: [number, number][] = []
{
  const g: [number, number] = [100, 100]
  let t = 0
  for (const f of frames) {
    if (f.agentId === 0) t++
    if (f.agentId !== 1 || t === 0) continue
    const i = f.view.indexOf("{")
    if (i >= 0) {
      const em = JSON.parse(f.view.slice(i)).entitymodule as string[] | undefined
      for (const e of em ?? []) {
        const m = /^U (39|47) [\d.]+ T (\d+)$/.exec(e)
        if (m) g[m[1] === "39" ? 0 : 1] = parseInt(m[2])
      }
    }
    hudGold[t] = [g[0], g[1]]
  }
}
// Site tooltips (entity -> site from the first frame): true remaining gold and mine rate after each turn.
const tipGold: number[][] = []
const tipRate: number[][] = []
const maxRateSeen: number[] = new Array(nSites).fill(-1)
{
  const g = initGold.slice()
  const r: number[] = new Array(nSites).fill(-1)
  let t = 0
  for (const f of frames) {
    if (f.agentId === 0) t++
    if (f.agentId !== 1 || t === 0) continue
    const i = f.view.indexOf("{")
    if (i >= 0) {
      const tips = JSON.parse(f.view.slice(i)).tooltips as [unknown, Record<string, string[]>] | undefined
      const tt = tips ? tips[1] : {}
      for (const k of Object.keys(tt)) {
        const id = ent2site.get(k)
        if (id === undefined) continue
        r[id] = -1
        for (const l of tt[k]) {
          if (l.startsWith("Remaining gold: ")) g[id] = parseInt(l.slice(16))
          const m = /^MINE \(\+(\d+)\)$/.exec(l)
          if (m) {
            r[id] = parseInt(m[1])
            maxRateSeen[id] = Math.max(maxRateSeen[id], r[id])
          }
        }
      }
    }
    tipGold[t] = g.slice()
    tipRate[t] = r.slice()
  }
}
// Oracle max mine size: the largest value shown in our input or reached by a mine (either mirror site).
const maxMine: number[] = new Array(nSites).fill(-1)
for (let t = 1; t <= T; t++)
  for (let i = 0; i < nSites; i++) {
    const v = parseInt(inputs[t][1 + i].split(" ")[2])
    if (v >= 0) maxMine[i] = maxMine[i ^ 1] = v
  }
for (let i = 0; i < nSites; i++) maxMine[i] = Math.max(maxMine[i], maxRateSeen[i], maxRateSeen[i ^ 1])

function run(oracle: boolean, maxPrint: number) {
  let exact = 0
  let goldOk = 0
  let checked = 0
  let printed = 0
  let sim: State | null = null
  for (let t = 1; t < T; t++) {
    const cur = stateFromInput(map, inputs[t], me, t - 1, sim)
    if (oracle) {
      if (t > 1) cur.gold[en] = hudGold[t - 1][en]
      for (let i = 0; i < nSites; i++) {
        const st = cur.sites[i]
        st.gold = t > 1 ? tipGold[t - 1][i] : initGold[i]
        st.maxMine = maxMine[i]
        if (t > 1 && st.type === 0 && tipRate[t - 1][i] > 0) st.rate = tipRate[t - 1][i]
      }
    }
    const acts: [Action, Action] = [parseAction("WAIT", "TRAIN"), parseAction("WAIT", "TRAIN")]
    acts[me] = parseAction(outs[t][0][0] ?? "WAIT", outs[t][0][1] ?? "TRAIN")
    acts[en] = parseAction(outs[t][1][0] ?? "WAIT", outs[t][1][1] ?? "TRAIN")
    sim = clone(cur)
    step(sim, acts)
    const got = renderInput(sim, me)
    const want = inputs[t + 1]
    const diffs: string[] = []
    const n = Math.max(got.length, want.length)
    for (let i = 0; i < n; i++)
      if (got[i] !== want[i]) diffs.push(`  [${i}] sim=${got[i] ?? "-"} real=${want[i] ?? "-"}`)
    checked++
    if (diffs.length === 0) exact++
    if (sim.gold[en] === hudGold[t][en]) goldOk++
    else diffs.push(`  [enemy gold] sim=${sim.gold[en]} hud=${hudGold[t][en]}`)
    if (diffs.length > 0 && printed < maxPrint) {
      printed++
      console.log(`turn ${t}: ${diffs.length} diff(s)  us: ${outs[t][0].join(" / ")}  them: ${outs[t][1].join(" / ")}`)
      for (const d of diffs.slice(0, 12)) console.log(d)
    }
  }
  console.log(`[${oracle ? "oracle" : "honest"}] turns=${checked} exact=${exact} enemyGold=${goldOk}/${checked}`)
}

console.log("== honest (hidden info carried from the simulation)")
run(false, 15)
console.log("== oracle (hidden info from the replay's view data)")
run(true, 15)
