// 🎮 CodinGame Optimization - snake
// https://www.codingame.com/training/optim/snake
//
// Rules: 96x54 grid, snake starts at (10..14, 10) heading right, N rabbits
// (50-70) all known on turn 1; step onto a rabbit to catch it (snake grows by
// 1). Die on wall / self hit. 600 turns max, 50 ms/turn.
// Score per catch at turn t, gap g = t - lastCatch (referee code from the
// author on the forum): combo = g <= 2 ? combo+1 : 1;
//   SCORE += 10000 + (combo > 1 ? 15000*combo : 0) - (g > 10 ? t*g : 0)
// (no penalty on the first catch). Criterion = sum over validators.
//
// Approach: plan = order of the remaining rabbits, scored with the exact
// formula above (first leg = time-aware BFS distance from the head, other legs
// Manhattan, same cell = 2). Simulated annealing (reverse / segment move /
// swap) runs ~30 ms each turn and persists across turns. The head follows a
// time-aware BFS path to the first planned rabbit (tie-break: avoid stepping on
// other rabbits), with a flood-fill safety check against self-trapping.
//
// Submitted (1 submission): 100%, criteriaScore 6628463, global rank 7 / 369.

// ---- Tunables -------------------------------------------------------------
const FIRST_TURN_MS = envNum("SN_FIRST", 40)
const TURN_MS = envNum("SN_TURN", 30)
const T_START = envNum("SN_T0", 20000) // SA temperature at the start of the game
const T_END = envNum("SN_T1", 100) // SA temperature floor
const T_DECAY_ITERS = envNum("SN_DECAY", 3e6) // iterations over which T decays geometrically
const DEBUG = envNum("SN_DEBUG", 0)

function envNum(key: string, def: number): number {
  const p = (globalThis as { process?: { env: Record<string, string | undefined> } }).process
  const v = p && p.env && p.env[key]
  return v ? +v : def
}

// ---- Constants ------------------------------------------------------------
const GW = 96
const GH = 54
const NC = GW * GH
const MAX_TURN = 600
const NO_CATCH = -10000

// ---- Input ---------------------------------------------------------------
const nRab = parseInt(readline())
const rabX: number[] = []
const rabY: number[] = []
for (let i = 0; i < nRab; i++) {
  const p = readline().trim().split(/\s+/).map(Number)
  rabX.push(p[0])
  rabY.push(p[1])
}
const alive: boolean[] = new Array(nRab).fill(true)
const rabCell: number[] = rabX.map((x, i) => rabY[i] * GW + x)
// pairwise leg length: Manhattan, same cell = 2 (leave and come back)
const pairD: Int32Array = new Int32Array(nRab * nRab)
for (let a = 0; a < nRab; a++)
  for (let b = 0; b < nRab; b++) {
    const d = Math.abs(rabX[a] - rabX[b]) + Math.abs(rabY[a] - rabY[b])
    pairD[a * nRab + b] = d === 0 ? 2 : d
  }

// ---- Game state -----------------------------------------------------------
let turn = 0 // moves already made
let lastCatch = NO_CATCH
let combo = 0
let prevLen = -1

// ---- Order (planned catching sequence of alive rabbits) --------------------
let cur: number[] = []
let best: number[] = []
let bestScore = -Infinity
let curScore = -Infinity
let saIters = 0
const headD: Int32Array = new Int32Array(nRab) // BFS distance head -> rabbit this turn

// Simulated score of catching `ord` in order starting now (referee formula).
function evalOrder(ord: number[]): number {
  let t = turn
  let last = lastCatch
  let cb = combo
  let s = 0
  let prev = -1
  for (let k = 0; k < ord.length; k++) {
    const r = ord[k]
    t += prev < 0 ? headD[r] : pairD[prev * nRab + r]
    if (t > MAX_TURN) {
      s -= 20000 * (ord.length - k)
      break
    }
    const g = t - last
    if (g <= 2) cb++
    else cb = 1
    s += 10000 + (cb > 1 ? 15000 * cb : 0) - (last !== NO_CATCH && g > 10 ? t * g : 0)
    last = t
    prev = r
  }
  return s
}

let rng = 12345
function rnd(n: number): number {
  rng ^= rng << 13
  rng ^= rng >>> 17
  rng ^= rng << 5
  return ((rng >>> 0) % n) | 0
}

function temperature(): number {
  const f = Math.min(1, saIters / T_DECAY_ITERS)
  return T_START * Math.pow(T_END / T_START, f)
}

// Simulated annealing on `cur` (2-opt reversal, segment move, swap).
function anneal(deadline: number): void {
  const m = cur.length
  if (m < 2) return
  const tmp: number[] = new Array(m)
  let T = temperature()
  for (let it = 0; ; it++) {
    if ((it & 255) === 0) {
      if (Date.now() >= deadline) break
      T = temperature()
    }
    saIters++
    const kind = rnd(3)
    let i = rnd(m)
    let j = rnd(m)
    if (i === j) continue
    if (i > j) {
      const x = i
      i = j
      j = x
    }
    for (let k = 0; k < m; k++) tmp[k] = cur[k]
    if (kind === 0) {
      // reverse [i, j]
      for (let a = i, b = j; a < b; a++, b--) {
        const x = cur[a]
        cur[a] = cur[b]
        cur[b] = x
      }
    } else if (kind === 1) {
      // move segment [i, i+len) to after j
      const len = 1 + rnd(Math.min(3, j - i))
      const seg = cur.slice(i, i + len)
      cur.splice(i, len)
      const pos = rnd(cur.length + 1)
      cur.splice(pos, 0, ...seg)
    } else {
      const x = cur[i]
      cur[i] = cur[j]
      cur[j] = x
    }
    const s = evalOrder(cur)
    if (s >= curScore || Math.random() < Math.exp((s - curScore) / T)) {
      curScore = s
      if (s > bestScore) {
        bestScore = s
        best = cur.slice()
      }
    } else {
      for (let k = 0; k < m; k++) cur[k] = tmp[k]
    }
  }
}

function greedyOrder(): number[] {
  const left: number[] = []
  for (let i = 0; i < nRab; i++) if (alive[i]) left.push(i)
  const ord: number[] = []
  let prev = -1
  while (left.length) {
    let bi = 0
    let bd = 1e9
    for (let k = 0; k < left.length; k++) {
      const d = prev < 0 ? headD[left[k]] : pairD[prev * nRab + left[k]]
      if (d < bd) {
        bd = d
        bi = k
      }
    }
    prev = left[bi]
    ord.push(prev)
    left.splice(bi, 1)
  }
  return ord
}

// ---- Grid search -----------------------------------------------------------
const freeAt = new Int32Array(NC) // move index from which a body cell is free
const dist = new Int32Array(NC)
const par = new Int32Array(NC)
const hits = new Int32Array(NC)
const queue = new Int32Array(NC)
const rabAt = new Int32Array(NC) // number of alive rabbits on a cell
const DX = [1, 0, -1, 0]
const DY = [0, 1, 0, -1]

function setBody(sx: number[], sy: number[]): void {
  freeAt.fill(0)
  const L = sx.length
  for (let i = 1; i < L; i++) freeAt[sy[i] * GW + sx[i]] = L - i + 1 // conservative: +1 for growth
}

// Time-aware BFS from `start`; avoidCell rabbits (other than target) count as hits.
function bfs(start: number, target: number): number {
  dist.fill(-1)
  dist[start] = 0
  hits[start] = 0
  par[start] = -1
  let qh = 0
  let qt = 0
  queue[qt++] = start
  while (qh < qt) {
    const u = queue[qh++]
    const ux = u % GW
    const uy = (u / GW) | 0
    const du = dist[u] + 1
    for (let d = 0; d < 4; d++) {
      const x = ux + DX[d]
      const y = uy + DY[d]
      if (x < 0 || y < 0 || x >= GW || y >= GH) continue
      const c = y * GW + x
      if (du < freeAt[c]) continue
      const h = hits[u] + (c !== target && rabAt[c] > 0 ? 1 : 0)
      if (dist[c] < 0) {
        dist[c] = du
        hits[c] = h
        par[c] = u
        queue[qt++] = c
      } else if (dist[c] === du && h < hits[c]) {
        hits[c] = h
        par[c] = u
      }
    }
  }
  return qt
}

// ---- Main loop -------------------------------------------------------------
for (;;) {
  const ns = parseInt(readline())
  const t0 = Date.now()
  const sx: number[] = []
  const sy: number[] = []
  for (let i = 0; i < ns; i++) {
    const p = readline().trim().split(/\s+/).map(Number)
    sx.push(p[0])
    sy.push(p[1])
  }
  const head = sy[0] * GW + sx[0]
  // Update catch state from the previous move.
  if (prevLen >= 0) {
    let caught = -1
    for (let i = 0; i < nRab; i++)
      if (alive[i] && rabCell[i] === head) {
        caught = i
        break
      }
    if (ns > prevLen) {
      if (caught >= 0) alive[caught] = false
      const g = turn - lastCatch
      if (g <= 2) combo++
      else combo = 1
      lastCatch = turn
    } else if (caught >= 0) {
      // stepped on it but nothing happened: rabbit is not catchable
      for (let i = 0; i < nRab; i++) if (alive[i] && rabCell[i] === head) alive[i] = false
    }
  }
  prevLen = ns
  rabAt.fill(0)
  for (let i = 0; i < nRab; i++) if (alive[i]) rabAt[rabCell[i]]++

  setBody(sx, sy)
  bfs(head, -1)
  for (let i = 0; i < nRab; i++) {
    if (!alive[i]) continue
    const d = dist[rabCell[i]]
    headD[i] = d > 0 ? d : d === 0 ? 2 : Math.abs(rabX[i] - sx[0]) + Math.abs(rabY[i] - sy[0]) + 20
  }

  // Refresh plan.
  const filt = (o: number[]) => o.filter(r => alive[r])
  if (turn === 0) {
    cur = greedyOrder()
    best = cur.slice()
  } else {
    cur = filt(cur)
    best = filt(best)
  }
  bestScore = evalOrder(best)
  curScore = evalOrder(cur)
  if (bestScore > curScore) {
    cur = best.slice()
    curScore = bestScore
  }
  anneal(t0 + (turn === 0 ? FIRST_TURN_MS : TURN_MS))
  cur = best.slice()
  curScore = bestScore
  if (DEBUG && (turn % 25 === 0 || turn < 3)) {
    let len = 0
    for (let k = 0; k < best.length; k++) len += k ? pairD[best[k - 1] * nRab + best[k]] : headD[best[0]]
    console.error(
      `turn ${turn} left ${best.length} planLen ${len} end ${turn + len} planScore ${bestScore} iters ${saIters} T ${temperature() | 0}`
    )
  }

  // Move toward the first planned rabbit.
  let move = -1
  if (best.length) {
    const tgt = rabCell[best[0]]
    bfs(head, tgt)
    if (dist[tgt] > 0) {
      let c = tgt
      while (par[c] !== head) c = par[c]
      move = c
    }
  }
  // Safety: next cell must keep enough room (time-aware reachability).
  const safeRoom = (c: number): number => {
    const L = ns + 1
    freeAt.fill(0)
    freeAt[head] = L
    for (let i = 1; i < ns; i++) freeAt[sy[i] * GW + sx[i]] = L - i
    return bfs(c, -1)
  }
  if (move < 0 || safeRoom(move) < ns + 2) {
    let bestC = move
    let bestR = -1
    let bestD = 1e9
    for (let d = 0; d < 4; d++) {
      const x = sx[0] + DX[d]
      const y = sy[0] + DY[d]
      if (x < 0 || y < 0 || x >= GW || y >= GH) continue
      const c = y * GW + x
      let blocked = false
      for (let i = 1; i < ns; i++) if (sx[i] === x && sy[i] === y) blocked = true
      if (blocked) continue
      const room = Math.min(safeRoom(c), ns + 2)
      const md = best.length ? Math.abs(x - rabX[best[0]]) + Math.abs(y - rabY[best[0]]) : 0
      if (room > bestR || (room === bestR && md < bestD)) {
        bestR = room
        bestD = md
        bestC = c
      }
    }
    if (bestC >= 0) move = bestC
  }
  if (move < 0) move = head + 1
  turn++
  console.log((move % GW) + " " + ((move / GW) | 0))
}
