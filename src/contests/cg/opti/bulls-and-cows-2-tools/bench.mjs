// Offline referee + bench for bulls-and-cows-2.
// Usage: pnpm exec node src/contests/cg/opti/bulls-and-cows-2-tools/bench.mjs [gamesPerLen=20] [seed=1]
// Transpiles ../bulls-and-cows-2.ts and runs it in-process: readline() answers the
// previous console.log guess; a correct guess ends the game (thrown sentinel).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const here = path.dirname(fileURLToPath(import.meta.url))
const src = fs.readFileSync(path.join(here, '..', 'bulls-and-cows-2.ts'), 'utf8')
const js = ts.transpileModule(src, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText
const prog = new Function('readline', 'console', js)

const games = +(process.argv[2] || 20)
let seed = +(process.argv[3] || 1)
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x80000000)
const randSecret = (n) => {
  for (;;) {
    const d = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (let i = 9; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [d[i], d[j]] = [d[j], d[i]] }
    if (d[0] !== 0) return d.slice(0, n).join('')
  }
}
const END = {}
function play(secret) {
  const n = secret.length
  let step = 0, last = null, turns = 0, maxT = 0, t
  const readline = () => {
    if (step++ === 0) return String(n)
    if (last === null) { t = performance.now(); return '-1 -1' }
    let b = 0, c = 0
    for (let i = 0; i < n; i++) { if (last[i] === secret[i]) b++; else if (secret.includes(last[i])) c++ }
    if (b === n) throw END
    t = performance.now()
    return `${b} ${c}`
  }
  const con = { log: (s) => {
    { const dt = performance.now() - t; if (dt > 45) console.error(`slow n=${n} turn=${turns} ${dt.toFixed(1)}ms`); maxT = Math.max(maxT, dt) }
    s = String(s); turns++
    if (s.length !== n || new Set(s).size !== n || s[0] === '0') throw new Error('bad guess ' + s)
    last = s
    if (turns > 300) throw new Error('too many turns')
  }, error: () => {} }
  try { prog(readline, con) } catch (e) { if (e !== END) throw e }
  return { turns, maxT }
}
let total = 0, worstT = 0
const tests = ['4', '69', '420', '4623', '27469', '816257', '6590812', '46725908', '593817462', '6025974318']
let visible = 0
for (const s of tests) visible += play(s).turns
for (let n = 1; n <= 10; n++) {
  let sum = 0, mx = 0
  for (let g = 0; g < games; g++) { const r = play(randSecret(n)); sum += r.turns; mx = Math.max(mx, r.turns); worstT = Math.max(worstT, r.maxT) }
  total += sum / games
  console.log(`n=${n} mean=${(sum / games).toFixed(2)} max=${mx}`)
}
console.log(`sum of means=${total.toFixed(2)} visible=${visible} worstTurnMs=${worstT.toFixed(1)}`)
