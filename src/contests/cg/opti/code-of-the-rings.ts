// 🎮 CodinGame Optimization - code-of-the-rings
// https://www.codingame.com/training/optim/code-of-the-rings
//
// "Brain Fork": print the magic phrase with a Brainfuck dialect on a circular
// tape of 30 cells, each holding a rune in the 27-symbol ring " ABC…Z" (space=0,
// wraps both ways), pointer also wraps. Ops: < > + - . and loops [ ] (skip/repeat
// while the current cell is not space). Score = total output length summed over the
// hidden validators (lower is better); a wrong phrase or >4000 executed ops fails it.
//
// Approach: beam search over the phrase index. A state is (tape, pointer, cost).
// Transitions:
//  - print one char from any of the 30 cells (move + adjust + '.');
//  - a loop covering r repetitions of a period P of length L where each position j
//    advances by a small delta d_j per repetition (repeats d=0, alphabets d=±1…).
//    Period cells are laid out contiguously next to a counter cell; the counter is
//    either a dedicated cell stepping by k (k coprime to 27, so it hits space exactly
//    after r steps) or one of the period cells itself when it reaches space after r.
// States are bucketed by phrase index; each bucket is deduped (zobrist) and cut to
// the BEAM cheapest before expansion (width adapts to the time budget).
//
// Submitted: 100% (23/23), criteriaScore 3306, rank 52/1000 (#1 = 2491). Visible
// bench total 3314 (code-of-the-rings-tools/bench.mjs).

const BEAM = 200
const BEAM_MIN = 8
const LMAX = 14
const DMAX = 3
const TIME_BUDGET_MS = 900

const NCELL = 30
const NRUNE = 27

const phrase: string = readline().replace(/[^A-Z ]/g, "")
const S: number[] = []
for (let q = 0; q < phrase.length; q++) {
  const ch = phrase.charCodeAt(q)
  S.push(ch === 32 ? 0 : ch - 64)
}
const n = S.length
const startTime = Date.now()

const mvCost = (a: number, b: number): number => {
  const d = Math.abs(a - b)
  return Math.min(d, NCELL - d)
}
const runeCost = (a: number, b: number): number => {
  const d = (((b - a) % NRUNE) + NRUNE) % NRUNE
  return Math.min(d, NRUNE - d)
}
const rep = (c: string, k: number): string => (k > 0 ? c.repeat(k) : "")
const moveStr = (a: number, b: number): string => {
  const d = (((b - a) % NCELL) + NCELL) % NCELL
  return d <= NCELL / 2 ? rep(">", d) : rep("<", NCELL - d)
}
const runeStr = (a: number, b: number): string => {
  const d = (((b - a) % NRUNE) + NRUNE) % NRUNE
  return d <= NRUNE / 2 ? rep("+", d) : rep("-", NRUNE - d)
}
const wrapC = (c: number): number => ((c % NCELL) + NCELL) % NCELL
const wrapR = (v: number): number => ((v % NRUNE) + NRUNE) % NRUNE

// zobrist hashing
let seedZ = 123456789
const rnd32 = (): number => {
  seedZ ^= seedZ << 13
  seedZ ^= seedZ >>> 17
  seedZ ^= seedZ << 5
  return seedZ >>> 0
}
const ZT: number[] = []
for (let q = 0; q < NCELL * NRUNE; q++) ZT.push(rnd32())
const ZP: number[] = []
for (let q = 0; q < NCELL; q++) ZP.push(rnd32())

interface BeamNode {
  tape: Uint8Array
  pos: number
  cost: number
  parent: BeamNode | null
  frag: string
  hash: number
}

interface Cand {
  cost: number
  hash: number
  parent: BeamNode | null
  // single char: cell/val; loop: pattern variant v (0 = dedicated counter, g+1 = self
  // counter on group g), repetitions r, counter cell c0, layout direction, step k
  cell: number
  val: number
  pat: Pattern | null
  v: number
  r: number
  dir: number
  k: number
}

// ---- period patterns starting at each index ----
interface Pattern {
  L: number
  d: number[]
  rmax: number
  // groups (cells) of the period
  gInit: number[]
  gDelta: number[]
  cellOf: number[]
  // variants: index 0 = dedicated counter, g+1 = self counter on group g
  offs: number[][]
  bodies: string[]
  reps: number[]
}
const patterns: Pattern[][] = []
for (let i = 0; i < n; i++) {
  const list: Pattern[] = []
  for (let L = 1; L <= LMAX && i + 2 * L <= n; L++) {
    const d: number[] = []
    let ok = true
    for (let j = 0; j < L; j++) {
      let dd = wrapR(S[i + L + j] - S[i + j])
      if (dd > NRUNE / 2) dd -= NRUNE
      if (Math.abs(dd) > DMAX) {
        ok = false
        break
      }
      d.push(dd)
    }
    if (!ok) continue
    let r = 2
    for (;;) {
      if (i + (r + 1) * L > n) break
      let good = true
      for (let j = 0; j < L; j++)
        if (S[i + r * L + j] !== wrapR(S[i + j] + r * d[j])) {
          good = false
          break
        }
      if (!good) break
      r++
    }
    if ((r - 1) * L < 3) continue
    // skip a period that is a pure multiple of an already listed shorter one that
    // needs no more than 26 iterations
    let redundant = false
    for (const q of list)
      if (L % q.L === 0 && q.rmax <= 26 && q.rmax * q.L >= r * L) {
        let same = true
        for (let j = 0; j < L; j++)
          if (d[j] !== q.d[j % q.L] || S[i + j] !== wrapR(S[i + (j % q.L)] + Math.floor(j / q.L) * q.d[j % q.L]))
            same = false
        if (same) redundant = true
      }
    if (redundant) continue
    const gInit: number[] = []
    const gDelta: number[] = []
    const cellOf: number[] = []
    for (let j = 0; j < L; j++) {
      let g = -1
      if (d[j] === 0) for (let h = 0; h < gInit.length; h++) if (gDelta[h] === 0 && gInit[h] === S[i + j]) g = h
      if (g < 0) {
        g = gInit.length
        gInit.push(S[i + j])
        gDelta.push(d[j])
      }
      cellOf.push(g)
    }
    const p: Pattern = { L, d, rmax: r, gInit, gDelta, cellOf, offs: [], bodies: [], reps: [] }
    const m = gInit.length
    for (let v = 0; v <= m; v++) {
      const off: number[] = []
      let rs = Math.min(r, 26)
      if (v === 0) for (let g = 0; g < m; g++) off.push(g + 1)
      else {
        const gs = v - 1
        const dd = gDelta[gs]
        rs = 0
        if (dd !== 0 && gInit[gs] !== 0) {
          rs = 1
          while (rs <= r && wrapR(gInit[gs] + rs * dd) !== 0) rs++
          if (rs > r || rs < 2) rs = 0
        }
        let o = 1
        for (let g = 0; g < m; g++) off.push(g === gs ? 0 : o++)
      }
      p.offs.push(off)
      p.reps.push(rs)
      p.bodies.push(rs > 0 ? bodyStr(p, off, v - 1) : "")
    }
    list.push(p)
  }
  patterns.push(list)
}

// body of a loop in "direction +1" layout: counter/self cell at offset 0, group g at
// offset off[g]; returns the string (without counter ops and brackets).
function bodyStr(p: Pattern, off: number[], selfG: number): string {
  let s = ""
  let cur = 0
  for (let j = 0; j < p.L; j++) {
    const g = p.cellOf[j]
    const t = off[g]
    s += t > cur ? rep(">", t - cur) : rep("<", cur - t)
    cur = t
    s += "."
    if (g !== selfG) s += p.gDelta[g] > 0 ? rep("+", p.gDelta[g]) : rep("-", -p.gDelta[g])
  }
  s += cur > 0 ? rep("<", cur) : rep(">", -cur)
  if (selfG >= 0) s += p.gDelta[selfG] > 0 ? rep("+", p.gDelta[selfG]) : rep("-", -p.gDelta[selfG])
  return s
}
const mirror = (s: string): string => s.replace(/[<>]/g, c => (c === "<" ? ">" : "<"))

const KS = [1, -1, 2, -2, 4, -4, 5, -5, 7, -7]
// best counter step k for (current value v, iterations r): cost |k| + adjust
const kCostT: number[] = []
const kBestT: number[] = []
for (let v = 0; v < NRUNE; v++)
  for (let r = 0; r < NRUNE; r++) {
    let kc = 1e9
    let kk = 1
    for (const k of KS) {
      const c = Math.abs(k) + runeCost(v, wrapR(k * r))
      if (c < kc) {
        kc = c
        kk = k
      }
    }
    kCostT.push(kc)
    kBestT.push(kk)
  }

// ---- beam ----
const buckets: Cand[][] = []
for (let i = 0; i <= n; i++) buckets.push([])
const root: BeamNode = { tape: new Uint8Array(NCELL), pos: 0, cost: 0, parent: null, frag: "", hash: ZP[0] }
for (let c = 0; c < NCELL; c++) root.hash ^= ZT[c * NRUNE]

function materialize(c: Cand): BeamNode {
  const par = c.parent as BeamNode
  const tape = par.tape.slice()
  if (c.pat === null) {
    const frag = moveStr(par.pos, c.cell) + runeStr(tape[c.cell], c.val) + "."
    tape[c.cell] = c.val
    return { tape, pos: c.cell, cost: c.cost, parent: par, frag, hash: c.hash }
  }
  const p = c.pat
  const off = p.offs[c.v]
  const m = p.gInit.length
  const c0 = c.cell
  const dir = c.dir
  // target per offset
  const tgt: number[] = []
  if (c.v === 0) tgt[0] = wrapR(c.k * c.r)
  for (let g = 0; g < m; g++) tgt[off[g]] = p.gInit[g]
  let far = 0
  for (let o = 1; o < tgt.length; o++) if (tape[wrapC(c0 + dir * o)] !== tgt[o]) far = o
  let frag = moveStr(par.pos, wrapC(c0 + dir * far))
  for (let o = far; o >= 0; o--) {
    frag += runeStr(tape[wrapC(c0 + dir * o)], tgt[o])
    if (o > 0) frag += dir === 1 ? "<" : ">"
  }
  const body = p.bodies[c.v]
  frag += "[" + (dir === 1 ? body : mirror(body))
  if (c.v === 0) frag += c.k > 0 ? rep("-", c.k) : rep("+", -c.k)
  frag += "]"
  if (c.v === 0) tape[c0] = 0
  for (let g = 0; g < m; g++) tape[wrapC(c0 + dir * off[g])] = wrapR(p.gInit[g] + c.r * p.gDelta[g])
  return { tape, pos: c0, cost: c.cost, parent: par, frag, hash: c.hash }
}

const ext = new Uint8Array(NCELL * 3)
const baseCost = new Int32Array(NCELL * 2)
function expandLoops(st: BeamNode, i: number): void {
  const tape = st.tape
  for (let q = 0; q < NCELL * 3; q++) ext[q] = tape[q % NCELL]
  for (const p of patterns[i]) {
    const m = p.gInit.length
    for (let v = 0; v <= m; v++) {
      const rTop = p.reps[v]
      if (rTop === 0) continue
      const off = p.offs[v]
      const bodyLen = p.bodies[v].length + 2
      // placement cost without the counter part
      for (let di = 0; di < 2; di++) {
        const dir = di === 0 ? 1 : -1
        for (let c0 = 0; c0 < NCELL; c0++) {
          let far = 0
          let chg = 0
          const b = c0 + NCELL
          for (let g = 0; g < m; g++) {
            const o = off[g]
            const cc = runeCost(ext[b + dir * o], p.gInit[g])
            if (cc > 0) {
              chg += cc
              if (o > far) far = o
            }
          }
          const fc = c0 + dir * far
          baseCost[di * NCELL + c0] = mvCost(st.pos, fc < 0 ? fc + NCELL : fc >= NCELL ? fc - NCELL : fc) + far + chg
        }
      }
      const rLow = v === 0 ? Math.max(2, rTop - 1) : rTop
      for (let r = rTop; r >= rLow; r--) {
        if ((r - 1) * p.L < 3) break
        let best = 1e9
        let bestIdx = 0
        for (let q = 0; q < NCELL * 2; q++) {
          const c0 = q % NCELL
          const cost = baseCost[q] + (v === 0 ? kCostT[tape[c0] * NRUNE + r] : 0)
          if (cost < best) {
            best = cost
            bestIdx = q
          }
        }
        const c0 = bestIdx % NCELL
        const dir = bestIdx < NCELL ? 1 : -1
        const bestK = v === 0 ? kBestT[tape[c0] * NRUNE + r] : 0
        let hash = st.hash ^ ZP[st.pos] ^ ZP[c0]
        if (v === 0) hash ^= ZT[c0 * NRUNE + tape[c0]] ^ ZT[c0 * NRUNE]
        for (let g = 0; g < m; g++) {
          const cell = wrapC(c0 + dir * off[g])
          hash ^= ZT[cell * NRUNE + tape[cell]] ^ ZT[cell * NRUNE + wrapR(p.gInit[g] + r * p.gDelta[g])]
        }
        buckets[i + r * p.L].push({
          cost: st.cost + best + bodyLen,
          hash: hash >>> 0,
          parent: st,
          cell: c0,
          val: 0,
          pat: p,
          v,
          r,
          dir,
          k: bestK,
        })
      }
    }
  }
}

let beamW = BEAM
let finalNode: BeamNode | null = null
for (let i = 0; i <= n; i++) {
  const cands = buckets[i]
  buckets[i] = []
  cands.sort((a, b) => a.cost - b.cost)
  const seen = new Set<number>()
  const nodes: BeamNode[] = i === 0 ? [root] : []
  for (const c of cands) {
    if (nodes.length >= beamW) break
    if (seen.has(c.hash)) continue
    seen.add(c.hash)
    nodes.push(materialize(c))
  }
  if (i === n) {
    finalNode = nodes[0]
    break
  }
  // adaptive beam: keep elapsed time proportional to progress through the phrase
  const allowed = (TIME_BUDGET_MS * (i + 1)) / n
  const el = Date.now() - startTime
  if (el > allowed) beamW = Math.max(BEAM_MIN, Math.floor(beamW * 0.85))
  else if (el < 0.7 * allowed && beamW < BEAM) beamW = Math.min(BEAM, beamW + 4)
  if (el > TIME_BUDGET_MS * 1.3) beamW = 1
  const ch = S[i]
  for (const st of nodes) {
    for (let c = 0; c < NCELL; c++) {
      const cost = st.cost + mvCost(st.pos, c) + runeCost(st.tape[c], ch) + 1
      const hash = (st.hash ^ ZP[st.pos] ^ ZP[c] ^ ZT[c * NRUNE + st.tape[c]] ^ ZT[c * NRUNE + ch]) >>> 0
      buckets[i + 1].push({ cost, hash, parent: st, cell: c, val: ch, pat: null, v: 0, r: 0, dir: 0, k: 0 })
    }
    expandLoops(st, i)
  }
}

const frags: string[] = []
for (let nd: BeamNode | null = finalNode; nd !== null; nd = nd.parent) frags.push(nd.frag)
console.log(frags.reverse().join(""))
