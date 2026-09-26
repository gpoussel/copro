// Offline bench for code-of-the-rings: runs the TS solver on every visible test,
// checks the output with a faithful Brainfork interpreter and sums the lengths.
// Usage: pnpm exec node src/contests/cg/opti/code-of-the-rings-tools/bench.mjs [testIndex...]
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const solver = path.join(here, "..", "code-of-the-rings.ts")
const preload = path.join(here, "preload.mjs")
const tests = fs.readFileSync(path.join(here, "tests.txt"), "utf8").split("\n").filter((l) => l.length)

function run(code) {
  const tape = new Array(30).fill(0)
  let p = 0
  let out = ""
  let steps = 0
  const match = new Map()
  const st = []
  for (let i = 0; i < code.length; i++) {
    if (code[i] === "[") st.push(i)
    else if (code[i] === "]") {
      if (!st.length) throw new Error("unbalanced ]")
      const j = st.pop()
      match.set(i, j)
      match.set(j, i)
    } else if (!"<>+-.".includes(code[i])) throw new Error("bad char " + code[i])
  }
  if (st.length) throw new Error("unbalanced [")
  for (let i = 0; i < code.length; i++) {
    steps++
    if (steps > 4000) throw new Error("too many steps")
    const c = code[i]
    if (c === ">") p = (p + 1) % 30
    else if (c === "<") p = (p + 29) % 30
    else if (c === "+") tape[p] = (tape[p] + 1) % 27
    else if (c === "-") tape[p] = (tape[p] + 26) % 27
    else if (c === ".") out += tape[p] === 0 ? " " : String.fromCharCode(64 + tape[p])
    else if (c === "[") {
      if (tape[p] === 0) i = match.get(i)
    } else if (c === "]") {
      if (tape[p] !== 0) i = match.get(i)
    }
  }
  return { out, steps }
}

const only = process.argv.slice(2).map(Number)
let total = 0
let maxMs = 0
tests.forEach((t, k) => {
  if (only.length && !only.includes(k + 1)) return
  const t0 = Date.now()
  const code = execFileSync("node", ["--import", preload, "--import", "tsx", solver], { input: t + "\n" })
    .toString()
    .trim()
  const ms = Date.now() - t0
  maxMs = Math.max(maxMs, ms)
  const { out, steps } = run(code)
  const ok = out === t
  total += code.length
  console.log(`${String(k + 1).padStart(2)} ${ok ? "OK " : "BAD"} len=${String(code.length).padStart(4)} steps=${steps} ${ms}ms  ${code.length < 90 ? code : ""}`)
  if (!ok) console.log("   got:", JSON.stringify(out))
})
console.log("TOTAL", total, "maxMs", maxMs)
