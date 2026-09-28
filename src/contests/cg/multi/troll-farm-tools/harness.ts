// Replay check for engine.ts: our stderr (DUMP build) holds our full input each turn. Each turn the
// state is rebuilt from our input, both recorded outputs are applied, and the input we would get
// next is compared with the recorded one. Enemy MOVEs with several equally good destinations
// (the referee picks at random) are tried in every combination.
// Run: node --import <repo>/node_modules/tsx/dist/esm/index.mjs harness.ts replay.json
import { readFileSync } from "fs"
import { COOLDOWN, Game, ITEMS, WATER_BOOST, WATER, nearType, parseOutput, step, turnInput } from "./engine.js"

type Frame = { stdout?: string; stderr?: string; seat: number }
const rp = JSON.parse(readFileSync(process.argv[2], "utf8")) as { frames: Frame[]; agents: { seat: number; pseudo: string }[] }
const meSeat = rp.agents.find(a => a.pseudo === "gpoussel_")!.seat
const inputs: string[][] = []
const outs: string[][] = []
let init: string[] = []
for (const f of rp.frames.slice(1)) {
  if (f.seat === meSeat) {
    let l = (f.stderr ?? "").trim().split("\n")[0].split("|")
    if (inputs.length === 0) {
      const n = parseInt(l[0])
      init = l.slice(1, n + 1)
      l = l.slice(n + 1)
    }
    inputs.push(l)
    outs.push(["", ""])
    outs[outs.length - 1][0] = (f.stdout ?? "").trim()
  } else if (outs.length) outs[outs.length - 1][1] = (f.stdout ?? "").trim()
}
// frames alternate seat 0 then seat 1 within a turn: if we are seat 1, the enemy output of turn t
// comes before ours. Re-pair accordingly.
if (meSeat === 1) {
  const enemy = rp.frames.slice(1).filter(f => f.seat === 0).map(f => (f.stdout ?? "").trim())
  for (let t = 0; t < outs.length; t++) outs[t][1] = enemy[t] ?? ""
}
const [W, H] = init[0].split(" ").map(Number)
function stateFrom(lines: string[]): Game {
  const g: Game = { W, H, grid: new Uint8Array(W * H), shack: [0, 0], inv: [], trees: [], trolls: [], nextId: 0, turn: 0, turnsUntilEnd: 0, over: false, dead: [false, false] }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const ch = init[1 + y][x]
      const c = y * W + x
      g.grid[c] = ch === "." ? 0 : ch === "~" ? 1 : ch === "#" ? 2 : ch === "+" ? 3 : 4
      if (ch === "0") g.shack[0] = c
      if (ch === "1") g.shack[1] = c
    }
  let i = 0
  g.inv = [lines[i++].split(" ").map(Number), lines[i++].split(" ").map(Number)]
  const nt = +lines[i++]
  for (let k = 0; k < nt; k++) {
    const p = lines[i++].split(" ")
    const type = ITEMS.indexOf(p[0])
    const cell = +p[2] * W + +p[1]
    g.trees.push({ type, cell, size: +p[3], health: +p[4], fruits: +p[5], cooldown: +p[6], growth: 0 })
  }
  for (const t of g.trees) t.growth = COOLDOWN[t.type] - (nearType(g, t.cell, WATER) ? WATER_BOOST[t.type] : 0)
  const nu = +lines[i++]
  for (let k = 0; k < nu; k++) {
    const v = lines[i++].split(" ").map(Number)
    g.trolls.push({ id: v[0], owner: v[1], cell: v[3] * W + v[2], speed: v[4], carry: v[5], harvest: v[6], chop: v[7], inv: v.slice(8, 14) })
    g.nextId = Math.max(g.nextId, v[0] + 1)
  }
  return g
}
let ok = 0
let bad = 0
for (let t = 0; t + 1 < inputs.length; t++) {
  const want = inputs[t + 1].join("\n")
  let matched = false
  let firstDiff = ""
  // enumerate random choices: rand returns choice index from a counter-based odometer
  for (let combo = 0; combo < 64 && !matched; combo++) {
    const g = stateFrom(inputs[t])
    let digit = combo
    const rand = (n: number) => {
      const r = digit % n
      digit = Math.floor(digit / n)
      return r
    }
    const a = parseOutput(g, 0, outs[t][0], () => 0)
    const b = parseOutput(g, 1, outs[t][1], rand)
    step(g, [...a.tasks, ...b.tasks])
    const got = turnInput(g, 0).join("\n")
    if (got === want) matched = true
    else if (!firstDiff) {
      const gl = got.split("\n")
      const wl = want.split("\n")
      for (let k = 0; k < Math.max(gl.length, wl.length); k++)
        if (gl[k] !== wl[k]) {
          firstDiff = `line ${k}: got "${gl[k]}" want "${wl[k]}"`
          break
        }
      if (a.errors.length) firstDiff += " | my errors: " + a.errors.join(", ")
    }
    if (combo === 0 && b.errors.length === 0 && !outs[t][1].includes("MOVE")) break
  }
  if (matched) ok++
  else {
    bad++
    if (bad <= 8) console.log(`turn ${t + 1}: ${firstDiff}\n   me: ${outs[t][0]}\n   opp: ${outs[t][1]}`)
  }
}
console.log(`${ok} turns exact, ${bad} mismatches`)
