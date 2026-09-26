// 🎮 CodinGame Optimization - bender-episode-4
// https://www.codingame.com/training/optim/bender---episode-4
//
// Rules: 21x21 maze, walk Bender from start to Fry. Entering a switch cell toggles
// its magnetic field; standing on an active field kills. Garbage balls get pushed
// when walked into (we never push: a push is an invalid move, an unpushable ball is
// a wall). Output ONE program "main;f1;...;f9" (U/D/R/L, digits call functions,
// functions may recurse). Blocked moves are no-ops; reaching Fry at any point wins,
// even mid-function. Each char, call and return costs a turn (1000 turn cap).
// Score = program length summed over the 30 validators (lower is better).
//
// Approach: for a fixed set of function bodies, the shortest main is a BFS over
// (cell, switch mask) where each edge is a move or a whole function macro
// (simulated, so wall-sliding is free). A tail-recursive "loop" function is a
// terminal edge (repeat until Fry is reached). SA mutates the function set
// (add a chunk of the current path, edit/insert/delete/swap tokens, inline-remove,
// toggle loop) with cost = |main| + Σ(|f|+1). The BFS is restricted to the
// corridor of states lying on shortest plain paths (ds + dt = L), which makes an
// eval ~1 ms instead of ~30 ms and is also better (1788 vs 1901 offline at +10).
// Every candidate is re-checked by a faithful referee port before output.
//
// Submitted: see bender-episode-4-tools/NOTES.md.

// ---- Tunables -------------------------------------------------------------
const TIME_MS = envNum("B4_MS", 700) // whole search budget (response limit 1000 ms)
const MAX_TURNS = 980 // referee stops at 1000 turns (calls + returns count)
const T0 = envNum("B4_T0", 1.5) // SA start temperature
const T1 = envNum("B4_T1", 0.1) // SA end temperature
const MAX_FUNCS = 9
const MAX_BODY = 14
const SLACK = envNum("B4_SLACK", 0) // corridor: states with ds + dt <= shortest + SLACK
let rngState = envNum("B4_SEED", 12345) | 0

function envNum(key: string, def: number): number {
  const p = (globalThis as { process?: { env: Record<string, string | undefined> } }).process
  const v = p && p.env && p.env[key]
  return v ? +v : def
}
function rnd(n: number): number {
  rngState ^= rngState << 13
  rngState ^= rngState >>> 17
  rngState ^= rngState << 5
  return (rngState >>> 0) % n
}

// ---- Input ----------------------------------------------------------------
const [W, H] = readline().split(" ").map(Number)
const t0 = Date.now() // clock starts once the input arrives
const rows: string[] = []
for (let y = 0; y < H; y++) rows.push(readline())
const [sx, sy] = readline().split(" ").map(Number)
const [tx, ty] = readline().split(" ").map(Number)
const SWN = +readline()
const swPos: number[] = []
const blkPos: number[] = []
let initMask = 0
for (let i = 0; i < SWN; i++) {
  const [a, b, c, d, e] = readline().split(" ").map(Number)
  swPos.push(b * W + a)
  blkPos.push(d * W + c)
  if (e === 1) initMask |= 1 << i
}
const NC = W * H
const START = sy * W + sx
const TARGET = ty * W + tx
const DIRS = "UDRL"
const DX = [0, 0, 1, -1]
const DY = [-1, 1, 0, 0]

// cell.sw = last switch that references the cell (switchPos then blockingPos)
const lastSw = new Int32Array(NC).fill(-1)
for (let i = 0; i < SWN; i++) {
  lastSw[swPos[i]] = i
  lastSw[blkPos[i]] = i
}
const togAt = new Int32Array(NC).fill(-1)
const dzAt = new Int32Array(NC).fill(-1)
for (let c = 0; c < NC; c++) {
  const s = lastSw[c]
  if (s < 0) continue
  if (swPos[s] === c) togAt[c] = s
  if (blkPos[s] === c) dzAt[c] = s
}
const wall = (x: number, y: number) => x < 0 || y < 0 || x >= W || y >= H || rows[y][x] === "#"
const box = (x: number, y: number) => !wall(x, y) && rows[y][x] === "+"
// mv[c*4+d]: destination (c itself when blocked), -1 when the move would push a ball
const mv = new Int32Array(NC * 4)
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    for (let d = 0; d < 4; d++) {
      const c = y * W + x
      const nx = x + DX[d]
      const ny = y + DY[d]
      let r = c
      if (!wall(nx, ny)) {
        if (box(nx, ny)) {
          const bx = nx + DX[d]
          const by = ny + DY[d]
          r = !wall(bx, by) && !box(bx, by) ? -1 : c
        } else r = ny * W + nx
      }
      mv[c * 4 + d] = r
    }

// ---- Macro simulation -------------------------------------------------------
// Flat programs are Int8Array of directions. Result: -1 dead/invalid, -2 target
// reached, else new state (pos * MS + mask).
const MS = 1 << SWN
function runFlat(flat: Int8Array, st: number): number {
  let p = (st / MS) | 0
  let m = st % MS
  for (let i = 0; i < flat.length; i++) {
    const q = mv[p * 4 + flat[i]]
    if (q < 0) return -1
    if (q !== p) {
      const s = togAt[q]
      if (s >= 0) m ^= 1 << s
      const z = dzAt[q]
      if (z >= 0 && (m >> z) & 1) return -1
      p = q
      if (p === TARGET) return -2
    }
  }
  return p * MS + m
}
function runLoop(flat: Int8Array, st: number): boolean {
  const seen: number[] = [st]
  for (let it = 0; it < 60; it++) {
    const r = runFlat(flat, st)
    if (r === -2) return true
    if (r === -1) return false
    if (seen.indexOf(r) >= 0) return false
    seen.push(r)
    st = r
  }
  return false
}

// ---- Program model --------------------------------------------------------------
// body tokens: 0..3 = move, 4+k = call function k. loop: body then self-call.
interface Prog {
  f: number[][]
  loop: boolean[]
}
function clone(p: Prog): Prog {
  return { f: p.f.map(b => b.slice()), loop: p.loop.slice() }
}
function flatten(p: Prog): (Int8Array | null)[] | null {
  const res: (number[] | null)[] = new Array(p.f.length).fill(null)
  const state = new Int8Array(p.f.length)
  let ok = true
  const go = (k: number): number[] | null => {
    if (state[k] === 2) return res[k]
    if (state[k] === 1) {
      ok = false
      return null
    }
    state[k] = 1
    const out: number[] = []
    for (const t of p.f[k]) {
      if (t < 4) out.push(t)
      else {
        const j = t - 4
        if (j >= p.f.length || j === k || p.loop[j]) {
          ok = false
          return null
        }
        const sub = go(j)
        if (!sub) return null
        for (const x of sub) out.push(x)
      }
      if (out.length > 400) {
        ok = false
        return null
      }
    }
    state[k] = 2
    res[k] = out
    return out
  }
  for (let k = 0; k < p.f.length; k++) if (!go(k) || !ok) return null
  return res.map(r => (r ? Int8Array.from(r) : null))
}
function defsCost(p: Prog): number {
  let c = 0
  for (let k = 0; k < p.f.length; k++) c += 1 + p.f[k].length + (p.loop[k] ? 1 : 0)
  return c
}

// ---- BFS for shortest main ------------------------------------------------------
const NS = NC * MS
const stamp = new Int32Array(NS)
const par = new Int32Array(NS)
const ptok = new Int8Array(NS)
let gen = 0
let queue = new Int32Array(1 << 16)
// returns main tokens (move 0..3 or call 4+k) or null if longer than limit
function bfsMain(p: Prog, flats: (Int8Array | null)[], limit: number): number[] | null {
  gen++
  const nF = p.f.length
  const s0 = START * MS + initMask
  stamp[s0] = gen
  par[s0] = -1
  let qh = 0
  let qt = 0
  queue[qt++] = s0
  let levelEnd = qt
  let depth = 0
  const build = (st: number, last: number): number[] => {
    const out = [last]
    while (par[st] >= 0) {
      out.push(ptok[st])
      st = par[st]
    }
    return out.reverse()
  }
  while (qh < qt) {
    if (qh === levelEnd) {
      depth++
      levelEnd = qt
    }
    if (depth + 1 > limit) return null
    const st = queue[qh++]
    for (let t = 0; t < 4 + nF; t++) {
      let r: number
      if (t < 4) {
        const pp = (st / MS) | 0
        const q = mv[pp * 4 + t]
        if (q < 0 || q === pp) continue
        let m = st % MS
        const s = togAt[q]
        if (s >= 0) m ^= 1 << s
        const z = dzAt[q]
        if (z >= 0 && (m >> z) & 1) continue
        if (q === TARGET) return build(st, t)
        r = q * MS + m
      } else {
        const k = t - 4
        const fl = flats[k]!
        if (p.loop[k]) {
          if (runLoop(fl, st)) return build(st, t)
          continue
        }
        r = runFlat(fl, st)
        if (r === -2) return build(st, t)
        if (r < 0) continue
      }
      if (stamp[r] === gen || !inC[r]) continue
      stamp[r] = gen
      par[r] = st
      ptok[r] = t
      if (qt >= queue.length) {
        const nq = new Int32Array(queue.length * 2)
        nq.set(queue)
        queue = nq
      }
      queue[qt++] = r
    }
  }
  return null
}

// ---- Output + verification (faithful port of the referee) -------------------------
function progString(p: Prog, main: number[]): string {
  const tok = (t: number) => (t < 4 ? DIRS[t] : String(t - 3))
  let s = main.map(tok).join("")
  for (let k = 0; k < p.f.length; k++) s += ";" + p.f[k].map(tok).join("") + (p.loop[k] ? String(k + 1) : "")
  return s
}
function verify(prog: string): boolean {
  const fns = prog.split(";")
  const stack: [string, number][] = [[fns[0], 0]]
  let p = START
  let m = initMask
  let finished = false
  for (let turn = 1; turn <= MAX_TURNS; turn++) {
    if (finished) return true
    const z = dzAt[p]
    if (z >= 0 && (m >> z) & 1) return false
    if (p === TARGET) finished = true
    if (stack.length === 0) return finished
    const top = stack[stack.length - 1]
    if (top[1] === top[0].length) {
      stack.pop()
      if (stack.length) stack[stack.length - 1][1]++
      continue
    }
    const c = top[0][top[1]++]
    if (c >= "1" && c <= "9") {
      top[1]--
      const k = c.charCodeAt(0) - 48
      if (k >= fns.length) return false
      stack.push([fns[k], 0])
      continue
    }
    const d = DIRS.indexOf(c)
    if (d < 0) continue
    const q = mv[p * 4 + d]
    if (q < 0) return false
    if (q !== p) {
      const s = togAt[q]
      if (s >= 0) m ^= 1 << s
      p = q
    }
  }
  return false
}

// ---- Corridor of near-shortest plain paths ------------------------------------------
// ds: plain-move distance from the start state, dt: to the target. BFS for main
// only keeps states inside the corridor, which bounds the eval cost.
const ds = new Int16Array(NS).fill(-1)
const dt = new Int16Array(NS).fill(-1)
const inC = new Uint8Array(NS)
{
  let q = new Int32Array(1 << 16)
  let qt = 0
  const push = (x: number) => {
    if (qt >= q.length) {
      const nq = new Int32Array(q.length * 2)
      nq.set(q)
      q = nq
    }
    q[qt++] = x
  }
  const s0 = START * MS + initMask
  ds[s0] = 0
  push(s0)
  let qh = 0
  const tgt: number[] = []
  while (qh < qt) {
    const st = q[qh++]
    const p = (st / MS) | 0
    if (p === TARGET) {
      tgt.push(st)
      continue
    }
    for (let d = 0; d < 4; d++) {
      const nq = mv[p * 4 + d]
      if (nq < 0 || nq === p) continue
      let m = st % MS
      const s = togAt[nq]
      if (s >= 0) m ^= 1 << s
      const z = dzAt[nq]
      if (z >= 0 && (m >> z) & 1) continue
      const r = nq * MS + m
      if (ds[r] >= 0) continue
      ds[r] = ds[st] + 1
      push(r)
    }
  }
  qt = 0
  qh = 0
  for (const t of tgt) {
    dt[t] = 0
    push(t)
  }
  while (qh < qt) {
    const st = q[qh++]
    const p = (st / MS) | 0
    const m1 = st % MS
    const s = togAt[p]
    const m = s >= 0 ? m1 ^ (1 << s) : m1
    for (let d = 0; d < 4; d++) {
      // predecessor pp moved in direction d to reach p
      const x = (p % W) - DX[d]
      const y = ((p / W) | 0) - DY[d]
      if (x < 0 || y < 0 || x >= W || y >= H) continue
      const pp = y * W + x
      if (mv[pp * 4 + d] !== p) continue
      const r = pp * MS + m
      if (ds[r] < 0 || dt[r] >= 0 || pp === TARGET) continue
      dt[r] = dt[st] + 1
      push(r)
    }
  }
  let L = 1 << 30
  for (const t of tgt) L = Math.min(L, ds[t])
  for (let i = 0; i < NS; i++) if (ds[i] >= 0 && dt[i] >= 0 && ds[i] + dt[i] <= L + SLACK) inC[i] = 1
}

// ---- Search ---------------------------------------------------------------------
const empty: Prog = { f: [], loop: [] }
const baseMain = bfsMain(empty, [], 100000)!
let bestProg = empty
let bestMain = baseMain
let bestCost = baseMain.length
let bestStr = progString(empty, baseMain)

function expand(p: Prog, main: number[]): number[] {
  const out: number[] = []
  const go = (toks: number[], depth: number) => {
    for (const t of toks) {
      if (t < 4) out.push(t)
      else if (depth < 10) go(p.f[t - 4], depth + 1)
    }
  }
  go(main, 0)
  return out
}

function mutate(src: Prog, path: number[]): Prog {
  const p = clone(src)
  const nF = p.f.length
  const r = rnd(100)
  if (nF === 0 || (r < 20 && nF < MAX_FUNCS)) {
    const len = 2 + rnd(9)
    const a = rnd(Math.max(1, path.length - len))
    p.f.push(path.slice(a, a + len))
    p.loop.push(rnd(8) === 0)
    return p
  }
  const k = rnd(nF)
  const b = p.f[k]
  const randTok = () => (rnd(4) < 3 || nF < 2 ? rnd(4) : 4 + rnd(nF))
  if (r < 30) {
    // remove function k: inline its body into callers, renumber
    const body = b
    p.f.splice(k, 1)
    p.loop.splice(k, 1)
    for (let j = 0; j < p.f.length; j++) {
      const nb: number[] = []
      for (const t of p.f[j]) {
        if (t === 4 + k) nb.push(...body)
        else nb.push(t > 4 + k ? t - 1 : t)
      }
      p.f[j] = nb
    }
  } else if (r < 50) b[rnd(b.length)] = randTok()
  else if (r < 65) {
    if (b.length < MAX_BODY) b.splice(rnd(b.length + 1), 0, randTok())
  } else if (r < 80) {
    if (b.length > 1) b.splice(rnd(b.length), 1)
  } else if (r < 88) {
    if (b.length > 1) {
      const i = rnd(b.length - 1)
      const x = b[i]
      b[i] = b[i + 1]
      b[i + 1] = x
    }
  } else if (r < 93) p.loop[k] = !p.loop[k]
  else {
    // replace body with a fresh path chunk
    const len = 2 + rnd(9)
    const a = rnd(Math.max(1, path.length - len))
    p.f[k] = path.slice(a, a + len)
  }
  return p
}

let cur = bestProg
let curCost = bestCost
let curPath = expand(cur, bestMain)
let iters = 0
for (;;) {
  const el = Date.now() - t0
  if (el > TIME_MS) break
  const T = T0 + (T1 - T0) * (el / TIME_MS)
  for (let rep = 0; rep < 1; rep++) {
    iters++
    const cand = mutate(cur, curPath)
    if (cand.f.some(b => b.length === 0)) continue
    const flats = flatten(cand)
    if (!flats) continue
    const dc = defsCost(cand)
    const slack = Math.floor(T * 3)
    const limit = curCost + slack - dc
    if (limit < 1) continue
    const main = bfsMain(cand, flats, limit)
    if (!main) continue
    const c = dc + main.length
    if (c <= curCost || rnd(1000) < 1000 * Math.exp((curCost - c) / T)) {
      cur = cand
      curCost = c
      curPath = expand(cand, main)
      if (c < bestCost) {
        const s = progString(cand, main)
        if (verify(s)) {
          bestCost = c
          bestProg = cand
          bestMain = main
          bestStr = s
        }
      }
    }
  }
}
if (!verify(bestStr)) bestStr = progString(empty, baseMain)
console.error(`iters ${iters} cost ${bestStr.length} base ${baseMain.length} ms ${Date.now() - t0}`)
console.log(bestStr)
