// Offline bench for vehicle-routing-problem.ts over CVRPLib .vrp instances.
// usage: node bench.mjs <instDir> <timeMs> [solver.ts] [name-regex] [seedOverride]
// instDir holds <name>.vrp files + opt.txt ("name optimum" per line).
// Rewrites TIME_LIMIT (and optionally the RNG seed) in a temp copy, runs it on
// each instance through Node's type stripping, checks feasibility, prints gap.
import fs from "fs"
import path from "path"
import { execFileSync } from "child_process"
import { fileURLToPath } from "url"

const here = path.dirname(fileURLToPath(import.meta.url))
const [instDir, timeMs = "3000", solverArg, re = ".", seed] = process.argv.slice(2)
const solver = solverArg || path.join(here, "..", "vehicle-routing-problem.ts")
const outDir = path.join(here, "out")
fs.mkdirSync(outDir, { recursive: true })
let src = fs.readFileSync(solver, "utf8").replace(/const TIME_LIMIT = \d+/, `const TIME_LIMIT = ${timeMs}`)
if (seed) src = src.replace(/let rngState = [^\n]*/, `let rngState = ${seed} | 0`)
const tmp = path.join(outDir, "solver.ts")
fs.writeFileSync(tmp, src)

function parseVrp(txt) {
  const lines = txt.split(/\r?\n/)
  let cap = 0, dim = 0, i = 0
  const pts = [], dem = []
  for (; i < lines.length; i++) {
    const l = lines[i].trim()
    if (l.startsWith("CAPACITY")) cap = +l.split(":")[1]
    if (l.startsWith("DIMENSION")) dim = +l.split(":")[1]
    if (l.startsWith("NODE_COORD_SECTION")) {
      for (let k = 0; k < dim; k++) pts.push(lines[++i].trim().split(/\s+/).map(Number))
    }
    if (l.startsWith("DEMAND_SECTION")) {
      for (let k = 0; k < dim; k++) dem.push(+lines[++i].trim().split(/\s+/)[1])
    }
  }
  // depot is node 1 in all A/M/P instances
  let s = `${dim}\n${cap}\n`
  for (let k = 0; k < dim; k++) s += `${k} ${pts[k][1]} ${pts[k][2]} ${dem[k]}\n`
  return { input: s, cap, pts: pts.map((p) => [p[1], p[2]]), dem }
}

const opt = Object.fromEntries(
  fs.readFileSync(path.join(instDir, "opt.txt"), "utf8").trim().split("\n").map((l) => l.split(" ")).map(([a, b]) => [a, +b]),
)
const names = Object.keys(opt).filter((n) => new RegExp(re).test(n) && fs.existsSync(path.join(instDir, n + ".vrp")))
let sumC = 0, sumO = 0
for (const name of names) {
  const inst = parseVrp(fs.readFileSync(path.join(instDir, name + ".vrp"), "utf8"))
  const out = execFileSync("node", ["--no-warnings", "-r", path.join(here, "readline-preload.cjs"), tmp], {
    input: inst.input,
    stdio: ["pipe", "pipe", "ignore"],
  }).toString().trim()
  const n = inst.pts.length
  const seen = new Array(n).fill(0)
  const d = (a, b) => Math.round(Math.hypot(inst.pts[a][0] - inst.pts[b][0], inst.pts[a][1] - inst.pts[b][1]))
  let cost = 0, ok = true
  for (const t of out.split(";")) {
    const r = t.trim().split(/\s+/).map(Number)
    let load = 0, p = 0
    for (const v of r) { seen[v]++; load += inst.dem[v]; cost += d(p, v); p = v }
    cost += d(p, 0)
    if (load > inst.cap) ok = false
  }
  for (let v = 1; v < n; v++) if (seen[v] !== 1) ok = false
  sumC += cost; sumO += opt[name]
  console.log(`${name.padEnd(12)} ${String(cost).padStart(6)} opt ${String(opt[name]).padStart(6)} gap ${((cost / opt[name] - 1) * 100).toFixed(2)}%${ok ? "" : " INVALID"}`)
}
console.log(`TOTAL ${sumC} opt ${sumO} gap ${((sumC / sumO - 1) * 100).toFixed(3)}%`)
