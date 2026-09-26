// 🎮 CodinGame Optimization - selenia-city
// https://www.codingame.com/training/optim/selenia-city
//
// Fall Challenge 2024. 20 months x 20 days. Each month: resources (+10% interest on
// savings), new buildings (landing pads with a fixed monthly crowd of typed
// astronauts, typed modules). Build non-crossing TUBEs (cost 10/km, <=5 per
// building), UPGRADE capacity (cost x new capacity), one-way TELEPORTs (5000, one
// endpoint per building), PODs (1000, route of <=21 stops, looping if first==last).
// Astronauts greedily move to strictly reduce their tube-hop distance to the
// nearest module of their type (teleport if not farther). Arrival scores
// (50 - day) + max(0, 50 - already arrived at that module this month).
// Criterion = total points summed over the validators.
//
// Approach: an exact port of the month simulation (TravelManager) evaluates
// candidate bundles: tube + looping pod, pad->type path bundles (Dijkstra over
// existing + buildable tubes), pad->module teleporters, upgrade + extra pod.
// Lazy greedy on (gain this month / cost) with a persistent gain cache across
// turns, time-budgeted.
const BUDGET_FIRST = 750 // ms, first turn (limit 1000)
const BUDGET_TURN = 330 // ms, other turns (limit 500)
const K_NEAR = 6 // candidate tube partners per building
const TOTAL_MONTHS = 20
const W_EXIST = 300 // path-search cost of riding an existing tube (hop penalty)
const MIN_RATIO = 0 // accept an action only if gain*monthsLeft/cost > this
const DBG = false // re-simulate last month from the input (checks the sim)

const MAXB = 160
const INF = 10000
const NT = 21 // building types 0..20

// ---------------- state ----------------
let nB = 0
const bx: number[] = []
const by: number[] = []
const btype: number[] = []
const padAst: number[][] = []
let adj: number[][] = []
let tubeCap = new Map<number, number>()
let tubeList: number[] = [] // keys
const tpOut = new Int16Array(MAXB)
const tpIn = new Int16Array(MAXB)
let pods = new Map<number, number[]>()
let resources = 0
let month = 0

const tkey = (a: number, b: number): number => (a < b ? a * 256 + b : b * 256 + a)
const tubeCost = (a: number, b: number): number =>
  Math.floor(Math.sqrt((bx[a] - bx[b]) ** 2 + (by[a] - by[b]) ** 2) * 10)
const edist = (a: number, b: number): number => Math.sqrt((bx[a] - bx[b]) ** 2 + (by[a] - by[b]) ** 2)

function orient(a: number, b: number, c: number): number {
  return Math.sign((by[c] - by[a]) * (bx[b] - bx[a]) - (by[b] - by[a]) * (bx[c] - bx[a]))
}
function crosses(a: number, b: number, c: number, d: number): boolean {
  return orient(a, b, c) * orient(a, b, d) < 0 && orient(c, d, a) * orient(c, d, b) < 0
}
// geometric validity of a new tube vs current buildings/tubes (+ extra pending edges)
function tubeOk(a: number, b: number, extra: number[] = []): boolean {
  if (a === b || tubeCap.has(tkey(a, b))) return false
  if (adj[a].length >= 5 || adj[b].length >= 5) return false
  const d = edist(a, b)
  for (let w = 0; w < nB; w++) {
    if (w === a || w === b) continue
    const dd = edist(a, w) + edist(w, b) - d
    if (-1e-7 < dd && dd < 1e-7) return false
  }
  for (const k of tubeList) if (crosses(a, b, k >> 8, k & 255)) return false
  for (const k of extra) if (crosses(a, b, k >> 8, k & 255)) return false
  return true
}

// ---------------- month simulation (port of TravelManager) ----------------
const dist = new Int16Array(NT * MAXB)
const typesPresent: boolean[] = new Array(NT).fill(false)
let astType = new Int8Array(0)
let astStart = new Int16Array(0)
const dq = new Int32Array(8192)

function computeDist(): void {
  for (let t = 1; t < NT; t++) {
    if (!typesPresent[t]) continue
    const off = t * MAXB
    let h = 4096,
      tl = 4096
    for (let b = 0; b < nB; b++) {
      if (btype[b] === t) {
        dist[off + b] = 0
        dq[tl++] = b
      } else dist[off + b] = INF
    }
    while (h < tl) {
      const u = dq[h++]
      const du = dist[off + u]
      // reverse teleporter: entrance e (e -> u) gets du
      const e = tpIn[u]
      if (e >= 0 && dist[off + e] > du) {
        dist[off + e] = du
        dq[--h] = e
      }
      for (const v of adj[u]) {
        if (dist[off + v] > du + 1) {
          dist[off + v] = du + 1
          dq[tl++] = v
        }
      }
    }
  }
}

const podPos = new Int32Array(512)
const podRem = new Int32Array(512)
const podLen = new Int32Array(512)
const podLoop = new Uint8Array(512)
const podRoute: number[][] = []
const tubeUse = new Map<number, number>()
const alloc = new Int32Array(MAXB)
const leaveHead: number[][] = []
for (let i = 0; i < MAXB; i++) leaveHead.push([])

function simulate(): number {
  computeDist()
  const ids = [...pods.keys()].sort((a, b) => a - b)
  const P = ids.length
  for (let i = 0; i < P; i++) {
    const r = pods.get(ids[i])!
    podRoute[i] = r
    podLen[i] = r.length
    podLoop[i] = r[0] === r[r.length - 1] ? 1 : 0
    podPos[i] = 0
  }
  const nA = astType.length
  const pos = new Int16Array(nA)
  let alive: number[] = []
  for (let a = 0; a < nA; a++) {
    pos[a] = astStart[a]
    if (dist[astType[a] * MAXB + astStart[a]] < INF || tpOut[astStart[a]] >= 0) alive.push(a)
  }
  alloc.fill(0)
  let score = 0
  for (let b = 0; b < MAXB; b++) leaveHead[b].length = 0
  const touched: number[] = []
  for (let day = 0; day < 20 && alive.length > 0; day++) {
    // teleporters
    let moved = false
    const next: number[] = []
    for (const a of alive) {
      const cur = pos[a]
      const e = tpOut[cur]
      if (e >= 0) {
        const off = astType[a] * MAXB
        const de = dist[off + e]
        if (de < INF && de <= dist[off + cur]) {
          pos[a] = e
          moved = true
          if (btype[e] === astType[a]) {
            const k = alloc[e]++
            score += 50 - day + (k < 50 ? 50 - k : 0)
            continue
          }
        }
      }
      next.push(a)
    }
    alive = next
    // pods
    tubeUse.clear()
    for (const b of touched) leaveHead[b].length = 0
    touched.length = 0
    for (let i = 0; i < P; i++) {
      const pi = podPos[i]
      if (pi + 1 >= podLen[i]) continue
      const r = podRoute[i]
      const cur = r[pi],
        nx = r[pi + 1]
      const k = tkey(cur, nx)
      const u = tubeUse.get(k) || 0
      if (u < tubeCap.get(k)!) {
        tubeUse.set(k, u + 1)
        if (leaveHead[cur].length === 0) touched.push(cur)
        leaveHead[cur].push(i)
        podRem[i] = 10
        let ni = pi + 1
        if (ni === podLen[i] - 1 && podLoop[i]) ni = 0
        podPos[i] = ni
        moved = true
      }
    }
    if (!moved) break
    // astronauts board
    const next2: number[] = []
    for (const a of alive) {
      const cur = pos[a]
      const lst = leaveHead[cur]
      if (lst.length) {
        const off = astType[a] * MAXB
        const dc = dist[off + cur]
        if (dc < INF) {
          let arrived = false
          for (const i of lst) {
            if (podRem[i] <= 0) continue
            const nb = podRoute[i][podPos[i]]
            if (dist[off + nb] < dc) {
              podRem[i]--
              pos[a] = nb
              if (btype[nb] === astType[a]) {
                const k = alloc[nb]++
                score += 49 - day + (k < 50 ? 50 - k : 0)
                arrived = true
              }
              break
            }
          }
          if (arrived) continue
        }
      }
      next2.push(a)
    }
    alive = next2
  }
  return score
}

// ---------------- reversible modifications ----------------
type Op = { k: 0 | 1 | 2 | 3; a: number; b: number; route?: number[]; id?: number }
// k: 0 tube, 1 upgrade, 2 teleport, 3 pod
function costOf(ops: Op[]): number {
  let c = 0
  const caps = new Map<number, number>()
  for (const o of ops) {
    if (o.k === 0) c += tubeCost(o.a, o.b)
    else if (o.k === 1) {
      const key = tkey(o.a, o.b)
      const cap = (caps.get(key) ?? tubeCap.get(key) ?? 1) + 1
      caps.set(key, cap)
      c += cap * tubeCost(o.a, o.b)
    } else if (o.k === 2) c += 5000
    else c += 1000
  }
  return c
}
let nextPodId = 1
function freePodId(): number {
  while (pods.has(nextPodId)) nextPodId++
  return nextPodId
}
function apply(o: Op): void {
  if (o.k === 0) {
    adj[o.a].push(o.b)
    adj[o.b].push(o.a)
    const key = tkey(o.a, o.b)
    tubeCap.set(key, 1)
    tubeList.push(key)
  } else if (o.k === 1) {
    const key = tkey(o.a, o.b)
    tubeCap.set(key, tubeCap.get(key)! + 1)
  } else if (o.k === 2) {
    tpOut[o.a] = o.b
    tpIn[o.b] = o.a
  } else {
    o.id = freePodId()
    pods.set(o.id, o.route!)
  }
}
function undo(o: Op): void {
  if (o.k === 0) {
    adj[o.a].pop()
    adj[o.b].pop()
    const key = tkey(o.a, o.b)
    tubeCap.delete(key)
    tubeList.pop()
  } else if (o.k === 1) {
    const key = tkey(o.a, o.b)
    tubeCap.set(key, tubeCap.get(key)! - 1)
  } else if (o.k === 2) {
    tpOut[o.a] = -1
    tpIn[o.b] = -1
  } else {
    pods.delete(o.id!)
    if (o.id! < nextPodId) nextPodId = o.id!
  }
}
function evalOps(ops: Op[]): number {
  for (const o of ops) apply(o)
  const s = simulate()
  for (let i = ops.length - 1; i >= 0; i--) undo(ops[i])
  return s
}
function opStr(o: Op): string {
  if (o.k === 0) return `TUBE ${o.a} ${o.b}`
  if (o.k === 1) return `UPGRADE ${o.a} ${o.b}`
  if (o.k === 2) return `TELEPORT ${o.a} ${o.b}`
  return `POD ${o.id} ${o.route!.join(" ")}`
}

// ---------------- candidate generation ----------------
type Cand = { key: string; ops: Op[]; cost: number; gain: number; fresh: boolean }
const loopPod = (a: number, b: number): Op => ({ k: 3, a, b, route: [a, b, a] })

let near: number[][] = []
function computeNear(): void {
  near = []
  for (let u = 0; u < nB; u++) {
    const o: number[] = []
    for (let v = 0; v < nB; v++) if (v !== u) o.push(v)
    o.sort((p, q) => edist(u, p) - edist(u, q))
    near.push(o)
  }
}
// valid new-tube partners of u (K nearest valid)
function partners(u: number): number[] {
  const res: number[] = []
  if (adj[u].length >= 5) return res
  for (const v of near[u]) {
    if (res.length >= K_NEAR) break
    if (tubeOk(u, v)) res.push(v)
  }
  return res
}

function pathBundle(pad: number, t: number, part: number[][]): Op[] | null {
  // Dijkstra from pad to any module of type t; existing tubes cost W_EXIST, new ones build cost
  const d = new Float64Array(nB).fill(1e18)
  const prev = new Int32Array(nB).fill(-1)
  const isNew = new Uint8Array(nB)
  const done = new Uint8Array(nB)
  d[pad] = 0
  for (;;) {
    let u = -1
    let best = 1e18
    for (let i = 0; i < nB; i++) if (!done[i] && d[i] < best) ((best = d[i]), (u = i))
    if (u < 0) return null
    if (btype[u] === t) {
      const ops: Op[] = []
      const path: number[] = []
      let x = u
      while (x !== pad) {
        path.push(x)
        x = prev[x]
      }
      path.push(pad)
      path.reverse()
      const newEdges: number[] = []
      for (let i = 0; i + 1 < path.length; i++) {
        const a = path[i],
          b = path[i + 1]
        if (isNew[b]) {
          const k = tkey(a, b)
          for (const e of newEdges) if (e !== k && crosses(a, b, e >> 8, e & 255)) return null
          newEdges.push(k)
          ops.push({ k: 0, a, b })
          ops.push(i % 2 === 0 ? loopPod(a, b) : loopPod(b, a))
        }
      }
      if (ops.length === 0) return null
      // slot check
      const cnt = new Map<number, number>()
      for (const o of ops) if (o.k === 0) for (const z of [o.a, o.b]) cnt.set(z, (cnt.get(z) || 0) + 1)
      for (const [z, c] of cnt) if (adj[z].length + c > 5) return null
      return ops
    }
    done[u] = 1
    const e = tpOut[u]
    if (e >= 0 && d[u] < d[e]) {
      d[e] = d[u]
      prev[e] = u
      isNew[e] = 0
    }
    for (const v of adj[u]) {
      const nd = d[u] + W_EXIST
      if (nd < d[v]) {
        d[v] = nd
        prev[v] = u
        isNew[v] = 0
      }
    }
    for (const v of part[u]) {
      const nd = d[u] + tubeCost(u, v) + 1000
      if (nd < d[v]) {
        d[v] = nd
        prev[v] = u
        isNew[v] = 1
      }
    }
  }
}

const live = (u: number): boolean => btype[u] === 0 || adj[u].length > 0 || tpOut[u] >= 0 || tpIn[u] >= 0
function genCands(): Cand[] {
  const out: Cand[] = []
  const part: number[][] = []
  for (let u = 0; u < nB; u++) part.push(partners(u))
  // symmetric partner lists for path search
  const sym: number[][] = part.map(p => p.slice())
  for (let u = 0; u < nB; u++) for (const v of part[u]) if (!sym[v].includes(u)) sym[v].push(u)
  // B: path bundles per (pad, type)
  for (let p = 0; p < nB; p++) {
    if (btype[p] !== 0) continue
    const types = new Set(padAst[p])
    for (const t of types) {
      const ops = pathBundle(p, t, sym)
      if (ops && ops.length > 2) {
        const key =
          "B" +
          ops
            .filter(o => o.k === 0)
            .map(o => tkey(o.a, o.b))
            .join("_")
        out.push({ key, ops, cost: 0, gain: 0, fresh: false })
      }
    }
    // C: teleporter pad -> module of each type
    if (tpOut[p] < 0 && tpIn[p] < 0) {
      for (const t of types) {
        let c = 0
        for (const m of near[p]) {
          if (btype[m] !== t || tpOut[m] >= 0 || tpIn[m] >= 0) continue
          out.push({ key: `C${p}_${m}`, ops: [{ k: 2, a: p, b: m }], cost: 0, gain: 0, fresh: false })
          if (++c >= 2) break
        }
      }
    }
  }
  // D: upgrade existing tube + extra loop pod (both orientations)
  for (const key of tubeList) {
    const a = key >> 8,
      b = key & 255
    out.push({ key: `D${a}_${b}`, ops: [{ k: 1, a, b }, loopPod(a, b)], cost: 0, gain: 0, fresh: false })
    out.push({ key: `D${b}_${a}`, ops: [{ k: 1, a, b }, loopPod(b, a)], cost: 0, gain: 0, fresh: false })
  }
  // A: single tube + loop pod
  for (let u = 0; u < nB; u++)
    for (const v of part[u]) {
      if (v < u && part[v].includes(u)) continue
      if (!live(u) && !live(v)) continue
      out.push({
        key: `A${Math.min(u, v)}_${Math.max(u, v)}`,
        ops: [{ k: 0, a: u, b: v }, loopPod(u, v)],
        cost: 0,
        gain: 0,
        fresh: false,
      })
    }
  for (const c of out) c.cost = costOf(c.ops)
  return out
}

// ---------------- main loop ----------------
const stale = new Map<string, number>() // candidate key -> last evaluated gain
const stamp = new Map<string, number>() // candidate key -> evaluation counter
let evalStamp = 0
tpOut.fill(-1)
tpIn.fill(-1)
for (;;) {
  const line = readline()
  if (line === undefined || line === null) break
  const tStart = Date.now()
  const budget = month === 0 ? BUDGET_FIRST : BUDGET_TURN
  resources = parseInt(line)
  const nR = parseInt(readline())
  const routes: number[][] = []
  for (let i = 0; i < nR; i++) routes.push(readline().split(" ").map(Number))
  const nP = parseInt(readline())
  pods = new Map()
  for (let i = 0; i < nP; i++) {
    const a = readline().split(" ").map(Number)
    pods.set(a[0], a.slice(2))
  }
  const oldNB = nB
  const nNew = parseInt(readline())
  for (let i = 0; i < nNew; i++) {
    const a = readline().split(" ").map(Number)
    const id = a[1]
    bx[id] = a[2]
    by[id] = a[3]
    btype[id] = a[0]
    padAst[id] = a[0] === 0 ? a.slice(5) : []
    nB = Math.max(nB, id + 1)
  }
  // rebuild network
  adj = []
  for (let i = 0; i < nB; i++) adj.push([])
  tubeCap = new Map()
  tubeList = []
  tpOut.fill(-1)
  tpIn.fill(-1)
  for (const [a, b, c] of routes) {
    if (c === 0) {
      tpOut[a] = b
      tpIn[b] = a
    } else {
      adj[a].push(b)
      adj[b].push(a)
      tubeCap.set(tkey(a, b), c)
      tubeList.push(tkey(a, b))
    }
  }
  if (DBG && month > 0) {
    const nb = nB
    nB = oldNB
    console.error(`prev month resim ${simulate()}`)
    nB = nb
  }
  // astronauts in id order
  const at: number[] = []
  const as: number[] = []
  for (let b = 0; b < nB; b++)
    if (btype[b] === 0)
      for (const t of padAst[b]) {
        at.push(t)
        as.push(b)
        typesPresent[t] = true
      }
  astType = Int8Array.from(at)
  astStart = Int16Array.from(as)
  computeNear()
  nextPodId = 1
  month++
  const monthsLeft = TOTAL_MONTHS - month + 1

  const actions: string[] = []
  let genT = 0
  let steps = 0
  let base = simulate()
  let cands = genCands()
  const ev = (c: Cand): void => {
    c.gain = evalOps(c.ops) - base
    c.fresh = true
    stale.set(c.key, c.gain)
    stamp.set(c.key, ++evalStamp)
  }
  const timeUp = (): boolean => Date.now() - tStart > budget
  for (;;) {
    if (timeUp()) break
    // evaluate never-seen affordable candidates
    for (const c of cands) {
      if (c.cost > resources) continue
      const s = stale.get(c.key)
      if (s === undefined) {
        if (timeUp()) break
        ev(c)
      } else if (!c.fresh) c.gain = s
    }
    // lazy greedy pick on gain/cost
    let chosen: Cand | null = null
    for (;;) {
      let best: Cand | null = null
      let second = -Infinity
      let bestR = -Infinity
      for (const c of cands) {
        if (c.cost > resources || !stale.has(c.key)) continue
        const r = c.gain / c.cost
        if (r > bestR) {
          second = bestR
          bestR = r
          best = c
        } else if (r > second) second = r
      }
      if (!best || best.gain <= 0 || (best.gain * monthsLeft) / best.cost <= MIN_RATIO) break
      if (best.fresh) {
        chosen = best
        break
      }
      if (timeUp()) break
      ev(best)
      if (best.gain / best.cost >= second && best.gain > 0) {
        chosen = best
        break
      }
    }
    if (chosen) {
      for (const o of chosen.ops) {
        apply(o)
        actions.push(opStr(o))
      }
      resources -= chosen.cost
      base += chosen.gain
      stale.delete(chosen.key)
      const tg = Date.now()
      cands = genCands()
      genT += Date.now() - tg
      steps++
      continue
    }
    // nothing positive: refresh the oldest estimates (they may have become useful)
    const old = cands.filter(c => c.cost <= resources && !c.fresh)
    if (old.length === 0) break
    old.sort((a, b) => (stamp.get(a.key) ?? 0) - (stamp.get(b.key) ?? 0))
    for (let k = 0; k < old.length && k < 40 && !timeUp(); k++) ev(old[k])
  }
  console.error(
    `m${month} base ${base} res ${resources} t ${Date.now() - tStart}ms gen ${genT}ms steps ${steps} cands ${cands.length}`
  )
  console.log(actions.length ? actions.join(";") : "WAIT")
}
