// 🎮 CodinGame Optimization - samegame
// https://www.codingame.com/training/optim/samegame
//
// Rules: 15x15 board, 5 colors. A move removes a 4-connected same-color group of
// size n >= 2 and scores (n-2)^2; cells fall down, empty columns shift left.
// Clearing the whole board adds +1000. The leaderboard criterion is the sum of
// the game scores over the hidden validators.
//
// The game is fully deterministic and the whole board is known on turn 1, so
// the bot plans the entire game on the first turn (20 s budget) and then just
// replays the plan (one move per turn, re-checking the board each turn).
//
// Search: iterated beam search with widening widths (60, x1.6, ...) until the
// budget runs out, best full line kept. Children are ranked by a cheap eval
// computed from the parent's group list only: score + W_COLOR * Σ_c (n_c-2)^2
// (color counts after the move; a lone leftover cell of a color costs -50), +1000
// if the move clears the board. Keeping colors big rewards saving them for one
// huge final removal. Only the survivors are materialized, deduped by Zobrist
// hash. Later turns replay the plan (replan on any board mismatch).
//
// Submitted: v1 (slower beam that materialized every child, W_COLOR 0.25)
// scored 49901, rank 195. This file = v2 (lazy materialization, ~7x wider beam,
// W_COLOR 0.3): 100% (40/40 validators = Standard Testset 1-20 + recolored),
// criteriaScore 67552, global rank 119 / ~1000 (top ~12-13%).

// ---- Tunables -------------------------------------------------------------
const FIRST_TURN_MS = envNum("SG_BUDGET", 15000) // limit is 20 s on turn 1
const START_WIDTH = 60
const WIDTH_GROWTH = 1.6
const MAX_WIDTH = 40000
const W_COLOR = envNum("SG_WC", 0.3) // weight of Σ_c (n_c - 2)^2 in the beam eval

function envNum(key: string, def: number): number {
  const p = (globalThis as { process?: { env: Record<string, string | undefined> } }).process
  const v = p && p.env && p.env[key]
  return v ? +v : def
}

const N = 15
const CELLS = N * N

// Board: Int8Array(225), index = x*15 + y (column-major, y=0 is bottom). -1 = empty.

const stackBuf = new Int16Array(CELLS)
const seen = new Int32Array(CELLS)
let seenStamp = 0

// Zobrist
const zobA = new Int32Array(CELLS * 5)
const zobB = new Int32Array(CELLS * 5)
{
  let s = 0x9e3779b9 | 0
  const rnd = (): number => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return s
  }
  for (let i = 0; i < CELLS * 5; i++) {
    zobA[i] = rnd()
    zobB[i] = rnd()
  }
}

// Group enumeration: fills gRep/gSize/gColor, returns count. Also computes
// potential for eval.
const gRep = new Int16Array(CELLS)
const gSize = new Int16Array(CELLS)
const colorCount = new Int32Array(5)

function listGroups(b: Int8Array): number {
  seenStamp++
  let ng = 0
  colorCount.fill(0)
  for (let x = 0; x < N; x++) {
    const base = x * N
    if (b[base] < 0) break
    for (let y = 0; y < N; y++) {
      const i = base + y
      const c = b[i]
      if (c < 0) break
      colorCount[c]++
      if (seen[i] === seenStamp) continue
      // flood
      let sp = 0
      let size = 0
      stackBuf[sp++] = i
      seen[i] = seenStamp
      while (sp > 0) {
        const j = stackBuf[--sp]
        size++
        const jx = (j / N) | 0
        const jy = j - jx * N
        if (jy > 0 && b[j - 1] === c && seen[j - 1] !== seenStamp) {
          seen[j - 1] = seenStamp
          stackBuf[sp++] = j - 1
        }
        if (jy < N - 1 && b[j + 1] === c && seen[j + 1] !== seenStamp) {
          seen[j + 1] = seenStamp
          stackBuf[sp++] = j + 1
        }
        if (jx > 0 && b[j - N] === c && seen[j - N] !== seenStamp) {
          seen[j - N] = seenStamp
          stackBuf[sp++] = j - N
        }
        if (jx < N - 1 && b[j + N] === c && seen[j + N] !== seenStamp) {
          seen[j + N] = seenStamp
          stackBuf[sp++] = j + N
        }
      }
      if (size >= 2) {
        gRep[ng] = i
        gSize[ng] = size
        ng++
      }
    }
  }
  return ng
}

// Apply move at cell `rep` in place on `b`; returns removed count.
function applyMove(b: Int8Array, rep: number): number {
  const c = b[rep]
  let sp = 0
  let removed = 0
  stackBuf[sp++] = rep
  b[rep] = -2
  let minX = N
  while (sp > 0) {
    const j = stackBuf[--sp]
    removed++
    const jx = (j / N) | 0
    if (jx < minX) minX = jx
    const jy = j - jx * N
    if (jy > 0 && b[j - 1] === c) {
      b[j - 1] = -2
      stackBuf[sp++] = j - 1
    }
    if (jy < N - 1 && b[j + 1] === c) {
      b[j + 1] = -2
      stackBuf[sp++] = j + 1
    }
    if (jx > 0 && b[j - N] === c) {
      b[j - N] = -2
      stackBuf[sp++] = j - N
    }
    if (jx < N - 1 && b[j + N] === c) {
      b[j + N] = -2
      stackBuf[sp++] = j + N
    }
  }
  // gravity + column shift
  let wx = minX
  for (let x = minX; x < N; x++) {
    const base = x * N
    if (b[base] === -1) break // rest empty
    let w = wx * N
    for (let y = 0; y < N; y++) {
      const v = b[base + y]
      if (v === -1) break
      if (v >= 0) b[w++] = v
    }
    const end = wx * N + N
    if (w > wx * N) {
      while (w < end) b[w++] = -1
      wx++
    } else {
      // column became empty; clear it (will be overwritten or remain empty)
      for (let k = wx * N; k < end; k++) b[k] = -1
    }
  }
  for (let k = wx * N; k < CELLS; k++) b[k] = -1
  return removed
}

function hashBoard(b: Int8Array): number {
  let a = 0
  let h = 0
  for (let x = 0; x < N; x++) {
    const base = x * N
    if (b[base] < 0) break
    for (let y = 0; y < N; y++) {
      const c = b[base + y]
      if (c < 0) break
      const k = (base + y) * 5 + c
      a ^= zobA[k]
      h ^= zobB[k]
    }
  }
  return a * 4294967296 + (h >>> 0)
}

interface Plan {
  score: number
  moves: number[] // rep cell index at each step (in that step's board)
}

// Children are ranked by a cheap eval that needs only the parent's group list:
// score + W_COLOR * Σ_c (n_c - 2)^2 (color counts after the move). Only the
// survivors are materialized (copy + apply + hash); duplicates are skipped in
// rank order until the width is filled.
let candP = new Int32Array(0)
let candM = new Int16Array(0)
let candS = new Int32Array(0)
let candE = new Float64Array(0)
let candO = new Int32Array(0)
function ensureCand(n: number): void {
  if (candP.length >= n) return
  const m = Math.max(n, candP.length * 2)
  candP = new Int32Array(m)
  candM = new Int16Array(m)
  candS = new Int32Array(m)
  candE = new Float64Array(m)
  candO = new Int32Array(m)
}
const colorSq = new Float64Array(CELLS + 1)
for (let n = 0; n <= CELLS; n++) colorSq[n] = n >= 2 ? (n - 2) * (n - 2) : n === 1 ? -50 : 0

// Beam search over full games. Returns best plan found (null on timeout).
function beam(start: Int8Array, width: number, deadline: number): Plan | null {
  let boards = new Int8Array(CELLS)
  boards.set(start)
  let scores = new Int32Array(1)
  let count = 1
  const layersP: Int32Array[] = []
  const layersM: Int16Array[] = []
  let bestScore = -1
  let bestLayer = -1
  let bestIdx = 0
  let iter = 0
  const hs = new Set<number>()
  const cc = new Int32Array(5)
  for (;;) {
    let nc = 0
    for (let k = 0; k < count; k++) {
      if ((++iter & 63) === 0 && Date.now() > deadline) return null
      const b = boards.subarray(k * CELLS, k * CELLS + CELLS)
      const ng = listGroups(b)
      const sc = scores[k]
      if (ng === 0) {
        const fin = sc + (b[0] < 0 ? 1000 : 0)
        if (fin > bestScore) {
          bestScore = fin
          bestLayer = layersP.length - 1
          bestIdx = k
        }
        continue
      }
      ensureCand(nc + ng)
      let base = 0
      for (let c = 0; c < 5; c++) {
        cc[c] = colorCount[c]
        base += colorSq[cc[c]]
      }
      for (let g = 0; g < ng; g++) {
        const rep = gRep[g]
        const sz = gSize[g]
        const c = b[rep]
        const n = cc[c]
        const s = sc + (sz - 2) * (sz - 2)
        let e = s + W_COLOR * (base - colorSq[n] + colorSq[n - sz])
        if (sz === n) {
          let left = 0
          for (let q = 0; q < 5; q++) if (q !== c) left += cc[q]
          if (left === 0) e += 1000
        }
        candP[nc] = k
        candM[nc] = rep
        candS[nc] = s
        candE[nc] = e
        candO[nc] = nc
        nc++
      }
    }
    if (nc === 0) break
    const order = candO.subarray(0, nc)
    if (nc > width) {
      const ev = candE
      order.sort((p, q) => ev[q] - ev[p])
    }
    const lim = Math.min(nc, width)
    const nb = new Int8Array(lim * CELLS)
    const ns = new Int32Array(lim)
    const lp = new Int32Array(lim)
    const lm = new Int16Array(lim)
    hs.clear()
    let w = 0
    for (let t = 0; t < nc && w < lim; t++) {
      const i = order[t]
      const dst = nb.subarray(w * CELLS, w * CELLS + CELLS)
      const pk = candP[i]
      dst.set(boards.subarray(pk * CELLS, pk * CELLS + CELLS))
      applyMove(dst, candM[i])
      const h = hashBoard(dst)
      if (hs.has(h)) continue
      hs.add(h)
      ns[w] = candS[i]
      lp[w] = pk
      lm[w] = candM[i]
      w++
    }
    layersP.push(lp)
    layersM.push(lm)
    boards = nb
    scores = ns
    count = w
  }
  const moves: number[] = []
  let k = bestIdx
  for (let l = bestLayer; l >= 0; l--) {
    moves.push(layersM[l][k])
    k = layersP[l][k]
  }
  moves.reverse()
  return { score: bestScore, moves }
}

let lastWidth = 0
function planGame(start: Int8Array, deadline: number): Plan {
  let best: Plan = { score: -1, moves: [] }
  let w = START_WIDTH
  while (Date.now() < deadline && w <= MAX_WIDTH) {
    const p = beam(start, w, deadline)
    if (!p) break
    if (p.score > best.score) best = p
    lastWidth = w
    w = Math.ceil(w * WIDTH_GROWTH)
  }
  if (best.score < 0) {
    // emergency: greedy
    const b = start.slice()
    const moves: number[] = []
    let sc = 0
    for (;;) {
      const ng = listGroups(b)
      if (ng === 0) break
      let bi = 0
      for (let g = 1; g < ng; g++) if (gSize[g] > gSize[bi]) bi = g
      const r = applyMove(b, gRep[bi])
      sc += (r - 2) * (r - 2)
      moves.push(gRep[bi])
    }
    best = { score: sc + (b[0] < 0 ? 1000 : 0), moves }
  }
  return best
}

// ---- Game loop --------------------------------------------------------------
function readBoard(): Int8Array {
  const b = new Int8Array(CELLS)
  for (let r = 0; r < N; r++) {
    const row = readline().trim().split(/\s+/).map(Number)
    const y = N - 1 - r
    for (let x = 0; x < N; x++) b[x * N + y] = row[x]
  }
  return b
}

function sameBoard(a: Int8Array, b: Int8Array): boolean {
  for (let i = 0; i < CELLS; i++) if (a[i] !== b[i]) return false
  return true
}

let sgPlan: Plan | null = null
let sgStep = 0
const sgExpected = new Int8Array(CELLS)
let sgTurn = 0
for (;;) {
  const board = readBoard()
  const t0 = Date.now()
  if (!sgPlan || !sameBoard(board, sgExpected) || sgStep >= sgPlan.moves.length) {
    sgPlan = planGame(board, t0 + (sgTurn === 0 ? FIRST_TURN_MS : 35))
    sgStep = 0
    console.error(`plan score ${sgPlan.score} moves ${sgPlan.moves.length} w ${lastWidth} in ${Date.now() - t0}ms`)
  }
  sgTurn++
  const rep = sgPlan.moves[sgStep++]
  sgExpected.set(board)
  applyMove(sgExpected, rep)
  const x = (rep / N) | 0
  const y = rep - x * N
  console.log(`${x} ${y} ${sgPlan.score}`)
}
