// 🎮 CodinGame Optimization - bulls-and-cows-2
// https://www.codingame.com/training/optim/bulls-and-cows-2
//
// Rules: guess a secret of numberLength (1..10) distinct digits, no leading 0. After each
// guess the referee answers "bulls cows" (right digit right place / right digit wrong
// place). Score = total number of guesses over all validators (lower is better).
// 50ms per turn, 300 turns max.
//
// Approach: every guess is consistent with all previous answers (a candidate secret).
// Consistent codes are found by a DFS over positions with per-answer pruning (partial
// bulls / common-digit counts vs. the target). If the whole consistent set can be
// enumerated (<= ENUM_CAP) we pick the candidate that minimises the expected size of the
// remaining set (sum of squared partition sizes); otherwise we draw random consistent
// samples (random-restart DFS) and pick the sample that best splits the sample set.
//
// Validators: 46 games (1x length 1, 5x each length 2..10).
// Submitted: 100% (46/46), criteriaScore 319, global rank 79 / 770 (top ~10%).

const ENUM_CAP = 3000
const TIME_BUDGET = 30 // ms per turn
const SAMPLE_MAX = 400

const bcNow = (): number => Date.now()

const bcLen = parseInt(readline())

interface BcHist {
  g: Int8Array
  b: number
  t: number // bulls + cows = common digits
  inG: Uint8Array // inG[d] = 1 if digit d is in guess
}

const bcHistory: BcHist[] = []
let bcRng = 0x9e3779b9 >>> 0
const bcRand = (k: number): number => {
  bcRng ^= bcRng << 13
  bcRng >>>= 0
  bcRng ^= bcRng >>> 17
  bcRng ^= bcRng << 5
  bcRng >>>= 0
  return bcRng % k
}

// DFS state
const bcCur = new Int8Array(bcLen)
const bcUsed = new Uint8Array(10)
let bcBulls = new Int32Array(0)
let bcCommon = new Int32Array(0)
let bcOut: Int8Array[] = []
let bcCap = 0
let bcRandomOrder = false
let bcDeadline = 0
let bcNodes = 0
let bcAborted = false

function bcDfs(pos: number): boolean {
  // returns true to stop the search
  if (pos === bcLen) {
    bcOut.push(Int8Array.from(bcCur))
    return bcOut.length >= bcCap
  }
  if ((++bcNodes & 1023) === 0 && bcNow() > bcDeadline) {
    bcAborted = true
    return true
  }
  const rem = bcLen - pos - 1
  const H = bcHistory.length
  let start = 0
  if (bcRandomOrder) start = bcRand(10)
  for (let k = 0; k < 10; k++) {
    const d = (start + k) % 10
    if (bcUsed[d] || (pos === 0 && d === 0)) continue
    let ok = true
    let i = 0
    for (; i < H; i++) {
      const h = bcHistory[i]
      const nb = bcBulls[i] + (h.g[pos] === d ? 1 : 0)
      const nc = bcCommon[i] + h.inG[d]
      if (nb > h.b || nc > h.t || nb + rem < h.b || nc + rem < h.t) {
        ok = false
        break
      }
      bcBulls[i] = nb
      bcCommon[i] = nc
    }
    if (ok) {
      bcUsed[d] = 1
      bcCur[pos] = d
      const stop = bcDfs(pos + 1)
      bcUsed[d] = 0
      for (let j = 0; j < H; j++) {
        const h = bcHistory[j]
        if (h.g[pos] === d) bcBulls[j]--
        bcCommon[j] -= h.inG[d]
      }
      if (stop) return true
    } else {
      for (let j = 0; j < i; j++) {
        const h = bcHistory[j]
        if (h.g[pos] === d) bcBulls[j]--
        bcCommon[j] -= h.inG[d]
      }
    }
  }
  return false
}

function bcSearch(cap: number, randomOrder: boolean, deadline: number): Int8Array[] {
  bcBulls = new Int32Array(bcHistory.length)
  bcCommon = new Int32Array(bcHistory.length)
  bcUsed.fill(0)
  bcOut = []
  bcCap = cap
  bcRandomOrder = randomOrder
  bcDeadline = deadline
  bcAborted = false
  bcDfs(0)
  return bcOut
}

function bcScore(a: Int8Array, b: Int8Array, maskA: number, maskB: number): number {
  let bulls = 0
  for (let i = 0; i < bcLen; i++) if (a[i] === b[i]) bulls++
  let m = maskA & maskB
  let common = 0
  while (m) {
    m &= m - 1
    common++
  }
  return bulls * 11 + (common - bulls)
}

const bcMask = (a: Int8Array): number => {
  let m = 0
  for (let i = 0; i < a.length; i++) m |= 1 << a[i]
  return m
}

function bcChoose(cands: Int8Array[], deadline: number): Int8Array {
  const N = cands.length
  if (N <= 2) return cands[0]
  const masks = cands.map(bcMask)
  const counts = new Int32Array(121)
  let best = 0
  let bestVal = Infinity
  for (let gi = 0; gi < N; gi++) {
    if ((gi & 7) === 7 && bcNow() > deadline) break
    counts.fill(0)
    const g = cands[gi]
    const mg = masks[gi]
    for (let j = 0; j < N; j++) counts[bcScore(g, cands[j], mg, masks[j])]++
    let s = 0
    for (let r = 0; r < 121; r++) s += counts[r] * counts[r]
    if (s < bestVal) {
      bestVal = s
      best = gi
    }
  }
  return cands[best]
}

function bcNextGuess(t0: number): Int8Array {
  if (bcHistory.length === 0) {
    const g = new Int8Array(bcLen)
    for (let i = 0; i < bcLen; i++) g[i] = (i + 1) % 10
    return g
  }
  const deadline = t0 + TIME_BUDGET
  const all = bcSearch(ENUM_CAP + 1, false, t0 + TIME_BUDGET * 0.4)
  if (!bcAborted && all.length <= ENUM_CAP) {
    return bcChoose(all, deadline)
  }
  const samples: Int8Array[] = []
  const seen = new Set<string>()
  const sampleDeadline = t0 + TIME_BUDGET * 0.55
  while (samples.length < SAMPLE_MAX && bcNow() < sampleDeadline) {
    const r = bcSearch(1, true, sampleDeadline)
    if (r.length === 0) break
    const key = r[0].join("")
    if (!seen.has(key)) {
      seen.add(key)
      samples.push(r[0])
    }
  }
  if (samples.length === 0) {
    if (all.length > 0) return all[0]
    const r = bcSearch(1, true, t0 + 1000)
    return r[0]
  }
  return bcChoose(samples, deadline)
}

let bcLast: Int8Array | null = null
while (true) {
  const parts = readline().split(" ").map(Number)
  const t0 = bcNow()
  if (bcLast !== null && parts[0] >= 0) {
    const inG = new Uint8Array(10)
    for (let i = 0; i < bcLen; i++) inG[bcLast[i]] = 1
    bcHistory.push({ g: bcLast, b: parts[0], t: parts[0] + parts[1], inG })
  }
  bcLast = bcNextGuess(t0)
  console.log(bcLast.join(""))
}
