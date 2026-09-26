// 🎮 CodinGame Optimization - block-the-spreading-fire
// https://www.codingame.com/training/optim/block-the-spreading-fire
//
// Rules: a fire starts on one cell and spreads 4-way; a cell burns for fireDuration
// turns, then ignites its free neighbours. Each turn you may "cut" (secure) one free
// cell, then wait cutDuration turns. Score per test = value of cells neither burnt
// nor cut (trees / houses have their own cut, fire and value params); criterion =
// sum over validators (the 8 validators mirror the 8 visible maps).
//
// The game is deterministic and fully known on turn 1, so the bot plans every cut
// on turn 1 (5 s limit, 4 s budget) and replays the plan. The planner is an exact
// event simulator (Dijkstra over ignition turns, cuts interleaved in turn order;
// a cut at turn s blocks iff the cell is not yet ignited) + simulated annealing over
// the cut set (add / remove / shift to a nearby cell / nudge a cell's order key; cuts
// are ordered by key = uncut fire arrival turn). Seeds: every arrival-time ring
// around the start and every full row/column line, best one kept.
//
// Submitted (1 submission): 100%, criteriaScore 43326, global rank 123 / 806
// (top ~15%). Offline visible-test total ≈ 42.6-43.1k at 2 s.

// ---- Tunables -------------------------------------------------------------
const PLAN_MS = envNum("BF_BUDGET", 4000) // turn-1 limit is 5 s
const T_START_FRAC = 0.004 // SA start temperature, fraction of total map value
const T_END_ABS = 0.3 // SA end temperature (absolute)

function envNum(key: string, def: number): number {
  const p = (globalThis as { process?: { env: Record<string, string | undefined> } }).process
  const v = p && p.env && p.env[key]
  return v ? +v : def
}

// ---- Input ----------------------------------------------------------------
const tIn = readline().split(" ").map(Number)
const hIn = readline().split(" ").map(Number)
const [W, H] = readline().split(" ").map(Number)
const [FX, FY] = readline().split(" ").map(Number)
const NC = W * H
const kindOf = new Int8Array(NC)
for (let y = 0; y < H; y++) {
  const row = readline()
  for (let x = 0; x < W; x++) {
    const ch = row[x]
    kindOf[y * W + x] = ch === "." ? 1 : ch === "X" ? 2 : 0
  }
}
const CUT = [0, tIn[0], hIn[0]]
const FIRE = [0, tIn[1], hIn[1]]
const VAL = [0, tIn[2], hIn[2]]
const cStep = new Int32Array(NC)
const cFire = new Int32Array(NC)
const cVal = new Int32Array(NC)
let totalValue = 0
for (let c = 0; c < NC; c++) {
  const k = kindOf[c]
  cStep[c] = Math.max(1, CUT[k])
  cFire[c] = FIRE[k]
  cVal[c] = VAL[k]
  totalValue += cVal[c]
}
const DIRS = [1, -1, W, -W]
const startCell = FY * W + FX

// ---- Evaluator ------------------------------------------------------------
// Exact event simulation of a cut order. Ignition "turn" t = the propagation step in
// which the cell gets fireProgress 0; the start cell has t = -1. A burning cell c
// ignites its neighbours at t + fire(c). A cut issued at turn s is applied before the
// propagation of turn s, so it blocks iff the cell is not yet ignited (ign >= s);
// otherwise the cut is skipped (the replay skips it too) and costs no time.
const INF = 0x3fffffff
const ign = new Int32Array(NC)
const state = new Uint8Array(NC) // 0 free, 1 cut, 2 burnt
const heap = new Int32Array(NC * 4 + 16)
let hLen = 0
function hPush(v: number): void {
  let i = hLen++
  while (i > 0) {
    const p = (i - 1) >> 1
    if (heap[p] <= v) break
    heap[i] = heap[p]
    i = p
  }
  heap[i] = v
}
function hPop(): number {
  const top = heap[0]
  const v = heap[--hLen]
  let i = 0
  for (;;) {
    let l = 2 * i + 1
    if (l >= hLen) break
    if (l + 1 < hLen && heap[l + 1] < heap[l]) l++
    if (heap[l] >= v) break
    heap[i] = heap[l]
    i = l
  }
  heap[i] = v
  return top
}
const executed = new Int32Array(NC)
let nExec = 0
const SH = 4096 // > max cells
const TOFF = 2 // time offset so the start cell's -1 packs positive

function evaluate(order: Int32Array, n: number): number {
  ign.fill(INF)
  state.fill(0)
  nExec = 0
  hLen = 0
  ign[startCell] = -1
  hPush((-1 + TOFF) * SH + startCell)
  let s = 0
  let k = 0
  let lost = 0
  while (hLen > 0) {
    while (k < n && ((heap[0] / SH) | 0) - TOFF >= s) {
      const c = order[k++]
      if (state[c] !== 0) continue
      state[c] = 1
      executed[nExec++] = c
      lost += cVal[c]
      s += cStep[c]
    }
    const e = hPop()
    const c = e % SH
    if (state[c] !== 0) continue
    const t = ((e / SH) | 0) - TOFF
    if (t !== ign[c]) continue
    state[c] = 2
    lost += cVal[c]
    const nt = t + cFire[c]
    for (let d = 0; d < 4; d++) {
      const m = c + DIRS[d]
      if (kindOf[m] === 0 || state[m] !== 0 || ign[m] <= nt) continue
      ign[m] = nt
      hPush((nt + TOFF) * SH + m)
    }
  }
  return totalValue - lost
}

// ---- Planning ---------------------------------------------------------------
const t0 = Date.now()
// base arrival (no cuts)
evaluate(new Int32Array(0), 0)
const base = Int32Array.from(ign)
const free: number[] = []
for (let c = 0; c < NC; c++) if (kindOf[c] !== 0 && c !== startCell && base[c] < INF) free.push(c)

let rng = 0x9e3779b9
function rnd(): number {
  rng ^= rng << 13
  rng ^= rng >>> 17
  rng ^= rng << 5
  return (rng >>> 0) / 4294967296
}

// plan = cells + keys, sorted by key
function sortPlan(cells: number[], keys: Map<number, number>): Int32Array {
  const a = cells.slice().sort((p, q) => keys.get(p)! - keys.get(q)! || p - q)
  return Int32Array.from(a)
}

const keyOf = new Map<number, number>()
for (const c of free) keyOf.set(c, base[c])

// initial candidates
let bestCells: number[] = []
let bestOrd: Int32Array = new Int32Array(0)
let bestScore = evaluate(new Int32Array(0), 0)
function tryCand(cells: number[]): void {
  const ord = sortPlan(cells, keyOf)
  const sc = evaluate(ord, ord.length)
  if (sc > bestScore) {
    bestScore = sc
    bestCells = cells.slice()
    bestOrd = ord
  }
}
{
  let maxR = 0
  for (const c of free) maxR = Math.max(maxR, base[c])
  for (let R = -1; R <= maxR; R++) {
    const ring: number[] = []
    for (const c of free) {
      if (base[c] <= R) continue
      let adj = false
      for (let d = 0; d < 4; d++) {
        const m = c + DIRS[d]
        if ((kindOf[m] !== 0 && base[m] <= R) || m === startCell) adj = true
      }
      if (adj) ring.push(c)
    }
    tryCand(ring)
  }
  for (let y = 1; y < H - 1; y++) {
    const line: number[] = []
    for (let x = 0; x < W; x++) if (kindOf[y * W + x] !== 0 && y * W + x !== startCell) line.push(y * W + x)
    tryCand(line)
  }
  for (let x = 1; x < W - 1; x++) {
    const line: number[] = []
    for (let y = 0; y < H; y++) if (kindOf[y * W + x] !== 0 && y * W + x !== startCell) line.push(y * W + x)
    tryCand(line)
  }
}

// simulated annealing over the cut set (order = key)
{
  let cur = bestCells.slice()
  let curScore = bestScore
  const inPlan = new Uint8Array(NC)
  for (const c of cur) inPlan[c] = 1
  const T0 = Math.max(1, totalValue * T_START_FRAC)
  const T1 = T_END_ABS
  let iter = 0
  let T = T0
  const NB8 = [1, -1, W, -W, W + 1, W - 1, -W + 1, -W - 1, 2, -2, 2 * W, -2 * W]
  for (;;) {
    if ((iter & 63) === 0) {
      const el = (Date.now() - t0) / PLAN_MS
      if (el >= 1) break
      T = T0 * Math.pow(T1 / T0, el)
    }
    iter++
    const r = rnd()
    const next = cur.slice()
    let changedKey = -1
    let oldKey = 0
    if (r < 0.3 || next.length === 0) {
      // add: neighbour of a plan cell or a random free cell
      let c: number
      if (next.length > 0 && rnd() < 0.7) c = next[(rnd() * next.length) | 0] + NB8[(rnd() * NB8.length) | 0]
      else c = free[(rnd() * free.length) | 0]
      if (c < 0 || c >= NC || kindOf[c] === 0 || inPlan[c] || c === startCell) continue
      next.push(c)
    } else if (r < 0.5) {
      next.splice((rnd() * next.length) | 0, 1)
    } else if (r < 0.8) {
      const i = (rnd() * next.length) | 0
      const c = next[i] + NB8[(rnd() * NB8.length) | 0]
      if (c < 0 || c >= NC || kindOf[c] === 0 || inPlan[c] || c === startCell) continue
      next[i] = c
    } else {
      const c = next[(rnd() * next.length) | 0]
      changedKey = c
      oldKey = keyOf.get(c)!
      keyOf.set(c, oldKey + (rnd() < 0.5 ? -1 : 1) * (1 + ((rnd() * 4) | 0)))
    }
    const ord = sortPlan(next, keyOf)
    const sc = evaluate(ord, ord.length)
    if (sc >= curScore || rnd() < Math.exp((sc - curScore) / T)) {
      for (const c of cur) inPlan[c] = 0
      cur = next
      for (const c of cur) inPlan[c] = 1
      curScore = sc
      if (sc > bestScore) {
        bestScore = sc
        bestCells = cur.slice()
        bestOrd = ord
      }
    } else if (changedKey >= 0) keyOf.set(changedKey, oldKey)
  }
  console.error(`PLAN score ${bestScore} cuts ${bestCells.length} iters ${iter}`)
}

// executed cut order (skipped cuts removed)
evaluate(bestOrd, bestOrd.length)
const planOrder = executed.slice(0, nExec)

// ---- Replay ---------------------------------------------------------------
let pi = 0
for (;;) {
  const cd = +readline()
  const prog: number[] = []
  for (let y = 0; y < H; y++) {
    const row = readline().split(" ")
    for (let x = 0; x < W; x++) prog.push(+row[x])
  }
  if (cd > 0) {
    console.log("WAIT")
    continue
  }
  while (pi < planOrder.length && prog[planOrder[pi]] !== -1) console.error("SKIP " + planOrder[pi++])
  if (pi < planOrder.length) {
    const c = planOrder[pi++]
    console.log(`${c % W} ${(c / W) | 0}`)
  } else console.log("WAIT")
}
