// 🎮 CodinGame Optimization - flames-extinguisher
// https://www.codingame.com/training/optim/flames-extinguisher
//
// Rules: 35x34 fixed map, 40 HP, 10 AP/cycle, 2 jumps/cycle. Cycles 0..5 spawn 6
// glyphs (2 of 4 fixed regions, fixed rank order) that become flames on PASS unless
// the cell holds the character or a flame; from cycle 6 each PASS costs 1 HP.
// MOVE/JUMP cost 1 HP (refunded when landing on a flame = extinguish). An extinguish
// pushes the 8 neighbours 1 cell away (blocked push = death), then every flame is
// attracted 1 step toward the character (reaching it = death). IMMO: 5 HP, attract
// toward a diagonal cell. Score = HP left at victory, summed over 50 validators.
//
// Approach: one action per turn (100 ms each). Beam search over time layers
// (cycle*10 + spent AP), exact inline simulator (zero desync on the real runner),
// eval ~ estimated final HP: hp - wait moves - bleed - flame count - adjacent flame
// pairs (clumps make every step deadly). No PASS at full AP after cycle 6.
//
// Submitted (1 submission): 100% (50/50), criteriaScore 1101, global rank 4 / 49.

// ---- Tunables -------------------------------------------------------------
const TURN_MS = envNum("FE_TURN", 60) // search budget per turn (one action per turn)
const BEAM = envNum("FE_BEAM", 100) // states kept per time layer
const HORIZON = envNum("FE_HOR", 30) // time units (AP) looked ahead
const W_BLEED = envNum("FE_WBLEED", 1.0) // HP per 10 actions beyond the free AP budget
const W_FLAME = envNum("FE_WFLAME", 0.2) // HP per remaining flame (realistic inefficiency)
const W_ADJ = envNum("FE_WADJ", 0.6) // HP per pair of adjacent flames
const RATE = envNum("FE_RATE", 0.7) // fraction of the free AP that can realistically extinguish
const DIAG_D = envNum("FE_DIAG", 3) // effective distance of a diagonal-adjacent flame
const W_WAIT = envNum("FE_WWAIT", 1.0) // HP per estimated non-extinguishing wait move
const W_DIST = envNum("FE_WDIST", 0.002) // tie-break: total distance of flames
const DEBUG = envNum("FE_DEBUG", 0)

function envNum(key: string, def: number): number {
  const p = (globalThis as { process?: { env: Record<string, string | undefined> } }).process
  const v = p && p.env && p.env[key]
  return v ? +v : def
}

// ---- Board ----------------------------------------------------------------
const GW = 35
const GH = 34
const NCELL = GW * GH
const wallGrid = new Uint8Array(NCELL)
const occ = new Uint8Array(NCELL) // scratch occupancy (flames), always cleared after use

// action codes: 0..3 MOVE N E S W, 4..7 JUMP N E S W, 8..11 IMMO NE SE SW NW, 12 PASS
const DX = [0, 1, 0, -1]
const DY = [-1, 0, 1, 0]
const IDX = [1, 1, -1, -1] // IMMO NE SE SW NW
const IDY = [-1, 1, 1, -1]
const ACT_NAMES = [
  "MOVE N",
  "MOVE E",
  "MOVE S",
  "MOVE W",
  "JUMP N",
  "JUMP E",
  "JUMP S",
  "JUMP W",
  "IMMO NE",
  "IMMO SE",
  "IMMO SW",
  "IMMO NW",
  "PASS",
]
const PASS = 12
const GLYPH_CYCLES = 6 // cycles 0..5 spawn glyphs

interface FState {
  pos: number
  hp: number
  ap: number
  jumps: number
  cycle: number
  flames: Int16Array
  glyphs: Int16Array // glyphs of the current cycle (become flames on PASS)
}

function cloneState(s: FState): FState {
  return { pos: s.pos, hp: s.hp, ap: s.ap, jumps: s.jumps, cycle: s.cycle, flames: s.flames, glyphs: s.glyphs }
}

// attraction order key: Manhattan distance, then clockwise from North
function attractKey(f: number, t: number): number {
  const dx = (f % GW) - (t % GW)
  const dy = ((f / GW) | 0) - ((t / GW) | 0)
  const d = Math.abs(dx) + Math.abs(dy)
  let r: number
  if (dx >= 0 && dy < 0) r = dx
  else if (dx > 0 && dy >= 0) r = d + dy
  else if (dx <= 0 && dy > 0) r = 2 * d - dx
  else r = 3 * d - dy
  return d * 1024 + r
}

const keyBuf = new Float64Array(64)
const ordBuf = new Int32Array(64)

// Moves every flame one step toward target t. charCell: character position.
// immo: the character cell behaves as a wall; otherwise a flame reaching it kills.
// Returns false on death. Mutates arr in place. occ must hold the flames.
function attract(arr: Int16Array, t: number, charCell: number, immo: boolean): boolean {
  const n = arr.length
  for (let i = 0; i < n; i++) {
    keyBuf[i] = attractKey(arr[i], t)
    ordBuf[i] = i
  }
  // insertion sort (n <= 36)
  for (let i = 1; i < n; i++) {
    const o = ordBuf[i]
    const k = keyBuf[o]
    let j = i - 1
    while (j >= 0 && keyBuf[ordBuf[j]] > k) {
      ordBuf[j + 1] = ordBuf[j]
      j--
    }
    ordBuf[j + 1] = o
  }
  const tx = t % GW
  const ty = (t / GW) | 0
  for (let q = 0; q < n; q++) {
    const i = ordBuf[q]
    const f = arr[i]
    const fx = f % GW
    const fy = (f / GW) | 0
    const dx = tx - fx
    const dy = ty - fy
    if (dx === 0 && dy === 0) continue
    const adx = dx < 0 ? -dx : dx
    const ady = dy < 0 ? -dy : dy
    const sx = dx > 0 ? 1 : dx < 0 ? -1 : 0
    const sy = dy > 0 ? 1 : dy < 0 ? -1 : 0
    let mx = 0
    let my = 0
    if (dx === 0) my = sy
    else if (dy === 0) mx = sx
    else if (adx === ady) {
      mx = sx
      my = sy
    } else if (adx > ady) mx = sx
    else my = sy
    const dest = f + mx + my * GW
    if (dest === charCell) {
      if (!immo) return false
      continue
    }
    if (wallGrid[dest] || occ[dest]) continue
    if (mx !== 0 && my !== 0) {
      const o1 = f + mx
      const o2 = f + my * GW
      if (wallGrid[o1] || occ[o1] || o1 === charCell) continue
      if (wallGrid[o2] || occ[o2] || o2 === charCell) continue
    }
    occ[f] = 0
    occ[dest] = 1
    arr[i] = dest
  }
  return true
}

function clearOcc(arr: Int16Array) {
  for (let i = 0; i < arr.length; i++) occ[arr[i]] = 0
}

// Applies action a to s, returns new state or null (illegal or death).
function applyAction(s: FState, a: number): FState | null {
  if (a === PASS) {
    // a PASS with full AP after the glyph phase only bleeds 1 HP for an identical state
    if (s.cycle >= GLYPH_CYCLES && s.ap === 10) return null
    const ns = cloneState(s)
    if (s.glyphs.length) {
      const fl: number[] = Array.from(s.flames)
      for (let i = 0; i < s.flames.length; i++) occ[s.flames[i]] = 1
      for (let i = 0; i < s.glyphs.length; i++) {
        const g = s.glyphs[i]
        if (g !== s.pos && !occ[g]) {
          occ[g] = 1
          fl.push(g)
        }
      }
      for (let i = 0; i < fl.length; i++) occ[fl[i]] = 0
      ns.flames = Int16Array.from(fl)
      ns.glyphs = new Int16Array(0)
    } else if (s.cycle >= GLYPH_CYCLES) {
      ns.hp--
      if (ns.hp <= 0) return null
    }
    ns.ap = 10
    ns.jumps = 2
    ns.cycle++
    return ns
  }
  if (a < 8) {
    const d = a & 3
    const jump = a >= 4
    if (jump ? s.ap < 2 || s.jumps < 1 : s.ap < 1) return null
    const k = jump ? 2 : 1
    const x = (s.pos % GW) + DX[d] * k
    const y = ((s.pos / GW) | 0) + DY[d] * k
    if (x < 0 || y < 0 || x >= GW || y >= GH) return null
    const dest = x + y * GW
    if (wallGrid[dest]) return null
    const hp = s.hp - 1
    if (hp <= 0) return null
    const n = s.flames.length
    let hit = -1
    for (let i = 0; i < n; i++)
      if (s.flames[i] === dest) {
        hit = i
        break
      }
    let arr: Int16Array
    const ns = cloneState(s)
    ns.pos = dest
    ns.ap = s.ap - k
    if (jump) ns.jumps = s.jumps - 1
    if (hit >= 0) {
      ns.hp = hp + 1
      arr = new Int16Array(n - 1)
      for (let i = 0, j = 0; i < n; i++) if (i !== hit) arr[j++] = s.flames[i]
      for (let i = 0; i < arr.length; i++) occ[arr[i]] = 1
      // push adjacent flames away
      let ok = true
      const pushes: number[] = []
      for (let i = 0; i < arr.length; i++) {
        const f = arr[i]
        const ddx = (f % GW) - x
        const ddy = ((f / GW) | 0) - y
        if (ddx < -1 || ddx > 1 || ddy < -1 || ddy > 1) continue
        const nd = f + ddx + ddy * GW
        if (wallGrid[nd] || occ[nd]) {
          ok = false
          break
        }
        if (ddx !== 0 && ddy !== 0) {
          const o1 = f + ddx
          const o2 = f + ddy * GW
          if (wallGrid[o1] || occ[o1] || wallGrid[o2] || occ[o2]) {
            ok = false
            break
          }
        }
        pushes.push(i, nd)
      }
      if (ok) {
        for (let p = 0; p < pushes.length; p += 2) occ[arr[pushes[p]]] = 0
        for (let p = 0; p < pushes.length; p += 2) {
          arr[pushes[p]] = pushes[p + 1]
          occ[pushes[p + 1]] = 1
        }
        ok = attract(arr, dest, dest, false)
      }
      clearOcc(arr)
      if (!ok) return null
    } else {
      ns.hp = hp
      arr = Int16Array.from(s.flames)
      for (let i = 0; i < n; i++) occ[arr[i]] = 1
      const ok = attract(arr, dest, dest, false)
      clearOcc(arr)
      if (!ok) return null
    }
    ns.flames = arr
    return ns
  }
  // IMMO
  const d = a - 8
  if (s.ap < 1) return null
  const t = s.pos + IDX[d] + IDY[d] * GW
  if (wallGrid[t]) return null
  const hp = s.hp - 5
  if (hp <= 0) return null
  const ns = cloneState(s)
  ns.hp = hp
  ns.ap = s.ap - 1
  const arr = Int16Array.from(s.flames)
  for (let i = 0; i < arr.length; i++) occ[arr[i]] = 1
  attract(arr, t, s.pos, true)
  clearOcc(arr)
  ns.flames = arr
  return ns
}

function isWin(s: FState): boolean {
  return s.flames.length === 0 && s.glyphs.length === 0 && s.cycle >= GLYPH_CYCLES
}

// ---- Evaluation ------------------------------------------------------------
const distBuf = new Int32Array(64)
// Estimated final HP: hp - wait moves - bleed cycles.
function evaluate(s: FState): number {
  if (isWin(s)) return s.hp * 1000 + 500
  const n = s.flames.length
  const futureCycles = Math.max(0, GLYPH_CYCLES - 1 - s.cycle) // unknown cycles still to spawn
  const px = s.pos % GW
  const py = (s.pos / GW) | 0
  let sum = 0
  for (let i = 0; i < n; i++) {
    const f = s.flames[i]
    const dx = Math.abs((f % GW) - px)
    const dy = Math.abs(((f / GW) | 0) - py)
    let d = dx > dy ? dx : dy
    if (dx === 1 && dy === 1) d = DIAG_D
    distBuf[i] = d
    sum += d
  }
  for (let i = 1; i < n; i++) {
    const v = distBuf[i]
    let j = i - 1
    while (j >= 0 && distBuf[j] > v) {
      distBuf[j + 1] = distBuf[j]
      j--
    }
    distBuf[j + 1] = v
  }
  let wait = 0
  for (let i = 0; i < n; i++) {
    const w = distBuf[i] - (i + 1)
    if (w > wait) wait = w
  }
  // clumps: pairs of 8-adjacent flames (blocked pushes kill)
  let pairs = 0
  if (W_ADJ > 0) {
    const fl = s.flames
    for (let i = 0; i < n; i++) occ[fl[i]] = 1
    for (let i = 0; i < n; i++) {
      const f = fl[i]
      pairs += occ[f + 1] + occ[f + GW - 1] + occ[f + GW] + occ[f + GW + 1]
    }
    for (let i = 0; i < n; i++) occ[fl[i]] = 0
  }
  const need = n + s.glyphs.length + 6 * futureCycles + wait
  const freeAp = (s.ap + 10 * Math.max(0, GLYPH_CYCLES - s.cycle)) * RATE
  const bleed = Math.max(0, need - freeAp) / 10
  return (s.hp - W_WAIT * wait - W_BLEED * bleed - W_DIST * sum - W_FLAME * n - W_ADJ * pairs) * 1000
}

// ---- Beam search over time layers -------------------------------------------
interface Node {
  s: FState
  first: number // first action of the path
  v: number
  a: number // action leading here
  par: Node | null
}

function pathOf(nd: Node): number[] {
  const out: number[] = []
  for (let p: Node | null = nd; p; p = p.par) out.push(p.a)
  return out.reverse()
}

function timeOf(s: FState): number {
  return s.cycle * 10 + (10 - s.ap)
}

function search(root: FState, deadline: number): number {
  const t0 = timeOf(root)
  const tMax = t0 + HORIZON
  const layers: Node[][] = []
  for (let i = 0; i <= HORIZON + 11; i++) layers.push([])
  const bestBox: { n: Node | null } = { n: null }
  const consider = (nd: Node) => {
    if (!bestBox.n || nd.v > bestBox.n.v) bestBox.n = nd
  }
  const push = (nd: Node) => {
    if (isWin(nd.s)) return consider(nd)
    const t = timeOf(nd.s)
    if (t > tMax) return consider(nd)
    layers[t - t0].push(nd)
  }
  for (let a = 0; a <= PASS; a++) {
    const ns = applyAction(root, a)
    if (DEBUG >= 3) console.error(`  root ${ACT_NAMES[a]}: ${ns ? (evaluate(ns) / 1000).toFixed(2) : "dead"}`)
    if (ns) push({ s: ns, first: a, v: evaluate(ns), a, par: null })
  }
  let expanded = 0
  let timeUp = false
  for (let L = 1; L < layers.length && !timeUp; L++) {
    let layer = layers[L]
    if (!layer.length) continue
    layer.sort((p, q) => q.v - p.v)
    if (layer.length > BEAM) layer = layer.slice(0, BEAM)
    let k = 0
    for (; k < layer.length; k++) {
      const nd = layer[k]
      for (let a = 0; a <= PASS; a++) {
        const ns = applyAction(nd.s, a)
        if (ns) push({ s: ns, first: nd.first, v: evaluate(ns), a, par: nd })
      }
      expanded++
      if ((expanded & 31) === 0 && now() > deadline) {
        timeUp = true
        break
      }
    }
    if (timeUp) {
      for (; k < layer.length; k++) consider(layer[k])
      for (let M = L + 1; M < layers.length; M++) for (const nd of layers[M]) consider(nd)
    }
    layers[L] = []
  }
  const b = bestBox.n
  if (DEBUG)
    console.error(
      `search t0=${t0} expanded=${expanded} best=${b ? b.v / 1000 : "none"} first=${b ? ACT_NAMES[b.first] : "-"} line=${
        b
          ? pathOf(b)
              .map(x => ACT_NAMES[x].replace(/(\w)\w+ /, "$1"))
              .join(",")
          : ""
      } hp=${b ? b.s.hp : 0} f=${b ? b.s.flames.length : 0}`
    )
  return b ? b.first : PASS
}

function now(): number {
  return performance.now()
}

function dumpState(s: FState) {
  const rows: string[] = []
  for (let y = 0; y < GH; y++) {
    let r = ""
    for (let x = 0; x < GW; x++) {
      const c = x + y * GW
      let ch = wallGrid[c] ? "#" : "."
      if (s.glyphs.indexOf(c) >= 0) ch = "g"
      if (s.flames.indexOf(c) >= 0) ch = "f"
      if (c === s.pos) ch = "@"
      r += ch
    }
    rows.push(r)
  }
  console.error(`cycle=${s.cycle} hp=${s.hp} ap=${s.ap} j=${s.jumps} eval=${evaluate(s) / 1000}\n` + rows.join("\n"))
}

// any legal non-dying action (PASS first), used if the search found nothing
function fallbackAction(s: FState): number {
  if (!(s.cycle >= GLYPH_CYCLES && s.ap === 10)) return PASS
  for (let a = 0; a < PASS; a++) if (applyAction(s, a)) return a
  return PASS // doomed: PASS is always legal
}

// ---- Main loop -----------------------------------------------------------------
function parseCell(line: string): number {
  const p = line.split(" ")
  return +p[0] + +p[1] * GW
}

const hwLine = readline().split(" ")
const mapH = +hwLine[0]
for (let y = 0; y < mapH; y++) {
  const row = readline()
  for (let x = 0; x < GW; x++) wallGrid[x + y * GW] = row[x] === "#" ? 1 : 0
}

let predicted: FState | null = null
let cycleNo = 0
let prevWasPass = false
for (;;) {
  const pos = parseCell(readline())
  const start = now()
  const hl = readline().split(" ")
  const fc = +readline()
  const fl: number[] = []
  for (let i = 0; i < fc; i++) fl.push(parseCell(readline()))
  const gc = +readline()
  const gl: number[] = []
  for (let i = 0; i < gc; i++) gl.push(parseCell(readline()))
  const vc = +readline()
  for (let i = 0; i < vc; i++) readline()
  if (prevWasPass) cycleNo++
  const st: FState = {
    pos,
    hp: +hl[0],
    ap: +hl[1],
    jumps: +hl[2],
    cycle: cycleNo,
    flames: Int16Array.from(fl),
    glyphs: Int16Array.from(gl),
  }
  if (predicted) {
    const a = Array.from(predicted.flames)
      .sort((p, q) => p - q)
      .join(",")
    const b = Array.from(st.flames)
      .sort((p, q) => p - q)
      .join(",")
    if (a !== b || predicted.pos !== st.pos || predicted.hp !== st.hp || predicted.ap !== st.ap)
      console.error(
        `DESYNC cycle=${cycleNo} pred pos=${predicted.pos} hp=${predicted.hp} ap=${predicted.ap} flames=${a} | real pos=${st.pos} hp=${st.hp} ap=${st.ap} flames=${b}`
      )
  }
  if (DEBUG >= 2) dumpState(st)
  let a = search(st, start + TURN_MS)
  if (!applyAction(st, a)) a = fallbackAction(st)
  predicted = applyAction(st, a)
  if (predicted && a === PASS) predicted.glyphs = new Int16Array(0)
  prevWasPass = a === PASS
  if (DEBUG === 1) console.error(`TR c${st.cycle} ap${st.ap} hp${st.hp} f${st.flames.length} -> ${ACT_NAMES[a]}`)
  console.log(ACT_NAMES[a])
}
