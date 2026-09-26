// Offline bench for bender-episode-4.ts.
// usage: node bench.mjs <configDir> [from] [to] [solver.ts]
// configDir holds the referee's test<N>.json (github.com/eulerscheZahl/Bender4, config/);
// tests 31..60 are the validators. Each output is re-checked by a faithful port
// of the Java referee (Referee/Interpreter/Robot/Box/Switch) incl. ball pushing.
import fs from "fs"
import path from "path"
import { execFileSync } from "child_process"
import { fileURLToPath } from "url"

const here = path.dirname(fileURLToPath(import.meta.url))
const [dir, from = "31", to = "60", solverArg] = process.argv.slice(2)
const solver = solverArg || path.join(here, "..", "bender-episode-4.ts")

function referee(inp, out) {
  const L = inp.split("|")
  const [W, H] = L[0].split(" ").map(Number)
  const g = L.slice(1, 1 + H)
  const [sx, sy] = L[H + 1].split(" ").map(Number)
  const [tx, ty] = L[H + 2].split(" ").map(Number)
  const n = +L[H + 3]
  const wall = new Set(), boxes = new Set(), cellSw = new Map(), sws = []
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x] === "#") wall.add(y * W + x)
    if (g[y][x] === "+") boxes.add(y * W + x)
  }
  for (let i = 0; i < n; i++) {
    const [a, b, c, d, e] = L[H + 4 + i].split(" ").map(Number)
    const s = { sp: b * W + a, bp: d * W + c, on: e === 1 }
    sws.push(s); cellSw.set(s.sp, s); cellSw.set(s.bp, s)
  }
  const T = ty * W + tx
  const nb = (c, d) => {
    const x = c % W, y = (c / W) | 0
    const nx = x + [0, 0, 1, -1][d], ny = y + [-1, 1, 0, 0][d]
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) return null
    return ny * W + nx
  }
  const free = (c) => c !== null && !wall.has(c) && !boxes.has(c)
  let p = sy * W + sx
  const fns = out.split(";")
  while (fns.length > 1 && fns[fns.length - 1] === "") fns.pop()
  const stack = [[fns[0], 0]]
  let finished = false, hasLeft = true
  for (let turn = 1; turn <= 1000; turn++) {
    if (finished) return { ok: true, turn }
    const s = cellSw.get(p)
    if (s && s.on && s.bp === p) return { ok: false, why: "field", turn }
    if (boxes.has(T)) return { ok: false, why: "squash", turn }
    if (p === T) finished = true
    if (!hasLeft) return { ok: false, why: "invalid path", turn }
    if (stack.length === 0) { hasLeft = false; continue }
    const top = stack[stack.length - 1]
    if (top[1] === top[0].length) { stack.pop(); if (stack.length) stack[stack.length - 1][1]++; continue }
    const ch = top[0][top[1]++]
    if (ch >= "1" && ch <= "9") {
      top[1]--
      const k = +ch
      if (k >= fns.length) return { ok: false, why: "nofunc" }
      stack.push([fns[k], 0])
      continue
    }
    const d = "UDRL".indexOf(ch)
    if (d < 0) continue
    const q = nb(p, d)
    if (q === null || wall.has(q)) continue
    if (boxes.has(q)) {
      const r = nb(q, d)
      if (!free(r)) continue
    }
    const sq = cellSw.get(q)
    if (sq && sq.sp === q) sq.on = !sq.on
    if (boxes.has(q)) {
      const r = nb(q, d)
      boxes.delete(q); boxes.add(r)
      const sr = cellSw.get(r)
      if (sr && sr.sp === r) sr.on = !sr.on
    }
    p = q
  }
  return { ok: false, why: "turns" }
}

let tot = 0, fails = 0
const rows = []
for (let i = +from; i <= +to; i++) {
  const inp = JSON.parse(fs.readFileSync(path.join(dir, `test${i}.json`), "utf8")).testIn
  const stdin = inp.split("|").join("\n") + "\n"
  const t = Date.now()
  let out = "", err = ""
  try {
    out = execFileSync("node", ["--no-warnings", "-r", path.join(here, "readline-preload.cjs"), solver], { input: stdin, env: process.env, stdio: ["pipe", "pipe", "pipe"] }).toString().trim()
  } catch (e) { err = String(e.stderr || e) }
  const ms = Date.now() - t
  const r = referee(inp, out)
  if (!r.ok) fails++
  tot += out.length
  rows.push(`${i}: ${out.length} ${r.ok ? "ok" : "FAIL " + r.why} t=${r.turn} ${ms}ms ${out}${err ? " ERR " + err.slice(0, 200) : ""}`)
}
console.log(rows.join("\n"))
console.log(`TOTAL ${tot} fails ${fails}`)
