// 🎮 CodinGame Puzzle - rummikub-2
// https://www.codingame.com/training/hard/rummikub-2

// Iterative deepening on the number of actions (COMBINE = 1, TAKE+PUT = 2,
// final PUT of the goal tile = 1), pruned by a lower bound on the actions still
// needed: cheapest row able to receive the goal tile, where every missing tile
// costs a TAKE+PUT plus what it takes to free it (a set of 3 first needs a
// fourth tile, recursively).
// At the optimal bound, a memoised exhaustive search (mutable table with
// apply/undo, hashed states) returns the preferred plan: actions compared by
// class (COMBINE with lowest ids < joker move < plain move), then by details.
// Among plans of the same length, fewer joker moves come first.

const COLORS = "BGRY"
const JOKER = 1000

type Tiles = number[]
interface RowInfo {
  idx: number // interning index
  isRun: boolean
  isSet: boolean
  color: number
  lo: number
  hi: number
  jokers: number
  nums: Set<number>
  colors: Set<number>
}
interface Action {
  text: string
  coarse: number[]
  fine: number[]
}
interface Plan {
  actions: Action[]
  next: Plan | null
  final: Map<number, Tiles> | null
  jokerMoves: number // joker moves in the whole (sub)plan
}

const parseTile = (s: string): number =>
  s === "J" ? JOKER : parseInt(s.slice(0, -1)) * 4 + COLORS.indexOf(s[s.length - 1])
const tileName = (t: number): string => (t === JOKER ? "J" : `${Math.floor(t / 4)}${COLORS[t % 4]}`)
const numOf = (t: number): number => Math.floor(t / 4)

// ---------- rows: interned arrays with cached analysis ----------
const internPool = new Map<string, Tiles>()
const infoCache = new WeakMap<Tiles, RowInfo>()
const analyse = (tiles: Tiles, idx: number): RowInfo => {
  const plain = tiles.filter(t => t !== JOKER)
  const jokers = tiles.length - plain.length
  const nums = new Set(plain.map(numOf))
  const colors = new Set(plain.map(t => t % 4))
  const lo = plain.length ? Math.min(...nums) : 0
  const hi = plain.length ? Math.max(...nums) : 0
  const ok = plain.length > 0 && jokers <= 1
  const isSet = ok && tiles.length >= 3 && tiles.length <= 4 && nums.size === 1 && colors.size === plain.length
  const isRun =
    ok &&
    !isSet &&
    tiles.length >= 3 &&
    tiles.length <= 13 &&
    colors.size === 1 &&
    nums.size === plain.length &&
    hi - lo + 1 - plain.length <= jokers
  return { idx, isRun, isSet, color: plain.length ? plain[0] % 4 : -1, lo, hi, jokers, nums, colors }
}
const canon = (tiles: Tiles): Tiles => {
  const s = [...tiles].sort((a, b) => a - b)
  const k = s.join(",")
  let r = internPool.get(k)
  if (!r) {
    r = s
    internPool.set(k, r)
    infoCache.set(r, analyse(r, internPool.size))
  }
  return r
}
const info = (tiles: Tiles): RowInfo => infoCache.get(tiles)!
const isValid = (tiles: Tiles): boolean => info(tiles).isRun || info(tiles).isSet

// Split a run-like multiset into two valid runs (lower, upper). The cut is
// where a tile was taken (numbers below / above `cut`), between the two copies
// of a put duplicate, or anywhere when the taken tile was the joker (cut < 0).
const splitRun = (tiles: Tiles, cut: number, isPut: boolean): Tiles[][] => {
  const plain = tiles.filter(t => t !== JOKER)
  const hasJoker = plain.length !== tiles.length
  const cuts: [Tiles, Tiles][] = []
  if (cut < 0) for (let k = 1; k < plain.length; k++) cuts.push([plain.slice(0, k), plain.slice(k)])
  else if (isPut) {
    const first = plain.findIndex(t => numOf(t) === cut)
    if (first >= 0 && first + 1 < plain.length && numOf(plain[first + 1]) === cut)
      cuts.push([plain.slice(0, first + 1), plain.slice(first + 1)])
  } else cuts.push([plain.filter(t => numOf(t) < cut), plain.filter(t => numOf(t) > cut)])
  const res: Tiles[][] = []
  for (const [lower, upper] of cuts) {
    const options: Tiles[][] = hasJoker
      ? [
          [[...lower, JOKER], upper],
          [lower, [...upper, JOKER]],
        ]
      : [[lower, upper]]
    for (const [a, b] of options) {
      if (a.length === 0 || b.length === 0) continue
      const ca = canon(a)
      const cb = canon(b)
      if (info(ca).isRun && info(cb).isRun) res.push([ca, cb])
    }
  }
  return res
}

// Outcomes of changing a row: the row itself, or a split into two runs
const reshape = (tiles: Tiles, wasRun: boolean, tile: number, isPut: boolean): Tiles[][] => {
  const s = canon(tiles)
  if (isValid(s)) return [[s]]
  if (!wasRun || (isPut && tile === JOKER)) return []
  return splitRun(s, tile === JOKER ? -1 : numOf(tile), isPut)
}

// Cached results of putting / taking one tile on an interned row
const putCache = new Map<number, Tiles[][]>()
const takeCache = new Map<number, Tiles[][]>()
const putResult = (tiles: Tiles, tile: number): Tiles[][] => {
  const k = info(tiles).idx * 2048 + tile
  let r = putCache.get(k)
  if (!r) {
    r = reshape([...tiles, tile], info(tiles).isRun, tile, true)
    putCache.set(k, r)
  }
  return r
}
const takeResult = (tiles: Tiles, tile: number): Tiles[][] => {
  const k = info(tiles).idx * 2048 + tile
  let r = takeCache.get(k)
  if (!r) {
    const rest = [...tiles]
    rest.splice(rest.indexOf(tile), 1)
    r = reshape(rest, info(tiles).isRun, tile, false)
    takeCache.set(k, r)
  }
  return r
}

// Cheap necessary condition for a PUT to be possible
const mayAccept = (r: RowInfo, tile: number): boolean => {
  if (tile === JOKER) return r.jokers === 0
  if (r.isSet) return numOf(tile) === r.lo && !r.colors.has(tile % 4)
  return tile % 4 === r.color && numOf(tile) >= r.lo - 1 - r.jokers && numOf(tile) <= r.hi + 1 + r.jokers
}
const acceptsNow = (tiles: Tiles, tile: number): boolean =>
  mayAccept(info(tiles), tile) && putResult(tiles, tile).length > 0

// Removing one copy of `tile` keeps the row valid (possibly split)
const releasable = (tiles: Tiles, tile: number): boolean => takeResult(tiles, tile).length > 0

// ---------- mutable table ----------
const rows: (Tiles | null)[] = []
let maxId = 0
let hashA = 0
let hashB = 0
// Zobrist-style hashing of (row id, row content) pairs
const mix32 = (v: number): number => {
  let h = Math.imul(v ^ (v >>> 16), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return (h ^ (h >>> 16)) >>> 0
}
const zA = (id: number, t: Tiles): number => mix32(id * 1000003 + info(t).idx * 7 + 1)
const zB = (id: number, t: Tiles): number => mix32(info(t).idx * 2654435 + id * 97 + 12345)
const setRowRaw = (id: number, t: Tiles | null): void => {
  const old = rows[id] ?? null
  if (old) {
    hashA = (hashA ^ zA(id, old)) >>> 0
    hashB = (hashB ^ zB(id, old)) >>> 0
  }
  rows[id] = t
  if (t) {
    hashA = (hashA ^ zA(id, t)) >>> 0
    hashB = (hashB ^ zB(id, t)) >>> 0
  }
}
const stateKey = (): number => hashA * 2097152 + ((mix32(hashB + maxId * 0x9e3779b1) >>> 11) & 0x1fffff)
const liveIds = (): number[] => {
  const res: number[] = []
  for (let id = 1; id <= maxId; id++) if (rows[id]) res.push(id)
  return res
}

interface Change {
  id: number
  old: Tiles | null
}
// Apply parts to row id (second part gets a new id), logging the changes
const applyParts = (id: number, parts: Tiles[], log: Change[]): number => {
  log.push({ id, old: rows[id] ?? null })
  setRowRaw(id, parts[0])
  if (parts.length === 1) return -1
  maxId++
  log.push({ id: maxId, old: null })
  setRowRaw(maxId, parts[1])
  return maxId
}
const undo = (log: Change[], oldMax: number): void => {
  for (let i = log.length - 1; i >= 0; i--) setRowRaw(log[i].id, log[i].old)
  maxId = oldMax
}

// ---------- lower bound ----------
let goalTile = 0

const hCache = new Map<number, number>()
const heuristic = (): number => {
  const key = stateKey()
  let h = hCache.get(key)
  if (h === undefined) {
    h = computeHeuristic()
    hCache.set(key, h)
  }
  return h
}

const computeHeuristic = (): number => {
  const x = numOf(goalTile)
  const c = goalTile % 4
  const ids = liveIds()
  const holders = new Map<number, number[]>()
  for (const id of ids) {
    const tiles = rows[id]!
    for (let i = 0; i < tiles.length; i++) {
      if (i > 0 && tiles[i] === tiles[i - 1]) continue
      const list = holders.get(tiles[i])
      if (list) list.push(id)
      else holders.set(tiles[i], [id])
    }
  }

  // extra cost to free tile t from row h: a set of 3 first needs a fourth tile,
  // the end of a 3-tile run needs an extension (inner run tiles: optimistic 0)
  const unlock = (t: number, h: number, depth: number): number => {
    const tiles = rows[h]!
    const r = info(tiles)
    if (releasable(tiles, t) || depth > 3) return 0
    const cands: number[] = [JOKER]
    if (r.isSet) {
      for (let col = 0; col < 4; col++) if (!r.colors.has(col)) cands.push(r.lo * 4 + col)
    } else {
      if (tiles.length > 3 || t === JOKER || (numOf(t) !== r.lo && numOf(t) !== r.hi)) return 0
      if (ids.some(o => o !== h && info(rows[o]!).isRun && info(rows[o]!).color === r.color)) return 1
      if (r.lo > 1) cands.push((r.lo - 1) * 4 + r.color)
      if (r.hi < 13) cands.push((r.hi + 1) * 4 + r.color)
    }
    let best = Infinity
    for (const u of cands) {
      if (tiles.includes(u)) continue
      for (const hu of holders.get(u) ?? []) if (hu !== h) best = Math.min(best, 2 + unlock(u, hu, depth + 1))
    }
    return best
  }
  // cost of getting tile t out of any holder but `except` (move + freeing)
  const acquire = (t: number, except: number): number => {
    let best = Infinity
    for (const h of holders.get(t) ?? []) if (h !== except) best = Math.min(best, 2 + unlock(t, h, 0))
    return best
  }
  const jokerCost = (except: number): number => acquire(JOKER, except)
  // does some row (other than `except`) accept tile t right now?
  const hasDestination = (t: number, except: number): boolean =>
    ids.some(id => id !== except && acceptsNow(rows[id]!, t))

  // cost to bring the numbers `needed` (goal color) into run R
  const bring = (id: number, needed: number[], freeJ: number): number => {
    const costs: number[] = []
    let viaCombine = false
    for (const n of needed) {
      const t = n * 4 + c
      let cost = acquire(t, id)
      if ((holders.get(t) ?? []).some(h => h !== id && info(rows[h]!).isRun && !info(rows[h]!).nums.has(x))) {
        viaCombine = true
        cost = 0
      }
      costs.push(cost)
    }
    costs.sort((a, b) => b - a)
    let j = freeJ
    for (let i = 0; i < costs.length && j > 0; i++, j--) costs[i] = 0
    if (costs.length > 0 && costs[0] > 2) {
      costs[0] = Math.min(costs[0], jokerCost(id))
      costs.sort((a, b) => b - a)
    }
    return costs.reduce((a, b) => a + b, 0) + (viaCombine ? 1 : 0)
  }

  // First pass: every row, ignoring routes that need the goal's twin moved away
  const rowCost = new Map<number, number>()
  const twinRows: number[] = []
  for (const id of ids) {
    const tiles = rows[id]!
    const r = info(tiles)
    let h = Infinity
    if (r.isRun && r.color === c) {
      const freeJ = r.jokers - (r.hi - r.lo + 1 - r.nums.size)
      if (x >= r.lo && x <= r.hi) {
        if (putResult(tiles, goalTile).length > 0 || !r.nums.has(x)) h = 0
        else {
          twinRows.push(id)
          // put the goal as a duplicate: both halves need 3 tiles
          const need: number[] = []
          for (let k = 0; k < 3 - (x - r.lo + 1); k++) need.push(r.lo - 1 - k)
          for (let k = 0; k < 3 - (r.hi - x + 1); k++) need.push(r.hi + 1 + k)
          h = bring(id, need, freeJ)
          // or split the row with another duplicate tile (halves padded to 3)
          for (const n of r.nums) {
            if (n === x) continue
            const deficit = Math.max(0, 3 - (n - r.lo + 1)) + Math.max(0, 3 - (r.hi - n + 1)) - freeJ
            h = Math.min(h, acquire(n * 4 + c, id) + 2 * Math.max(0, deficit))
          }
        }
      } else {
        const needed: number[] = []
        if (x < r.lo) for (let n = x + 1; n < r.lo; n++) needed.push(n)
        else for (let n = r.hi + 1; n < x; n++) needed.push(n)
        h = bring(id, needed, freeJ)
      }
    } else if (r.isSet && r.lo === x) {
      if (!r.colors.has(c)) h = tiles.length < 4 ? 0 : 2 + (hasDestination(JOKER, id) ? 0 : 2)
      else {
        twinRows.push(id)
        if (tiles.length === 3) {
          let add = Infinity
          for (let col = 0; col < 4; col++) if (!r.colors.has(col)) add = Math.min(add, acquire(x * 4 + col, id))
          h = Math.min(add, jokerCost(id))
        } else h = 0
      }
    }
    rowCost.set(id, h)
  }
  // Second pass: rows holding the goal's twin may also send it elsewhere first
  // (the twin then needs a place, which costs as much as placing the goal there)
  const others = (id: number): number => {
    let m = Infinity
    for (const [o, v] of rowCost) if (o !== id) m = Math.min(m, v)
    return m
  }
  for (const id of twinRows) {
    const tiles = rows[id]!
    const r = info(tiles)
    const twin = x * 4 + c
    const out = 2 + (releasable(tiles, twin) ? 0 : 2) + others(id)
    if (r.isSet) rowCost.set(id, rowCost.get(id)! + 2 + others(id))
    else rowCost.set(id, Math.min(rowCost.get(id)!, out))
  }
  let best = Infinity
  for (const v of rowCost.values()) best = Math.min(best, v)
  return best + 1
}

// ---------- moves ----------
interface Move {
  actions: Action[]
  apply: (log: Change[]) => void
}

const successors = (): Move[] => {
  const res: Move[] = []
  const ids = liveIds()
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = rows[ids[i]]!
      const b = rows[ids[j]]!
      const ra = info(a)
      const rb = info(b)
      if (!ra.isRun || !rb.isRun || ra.color !== rb.color || ra.jokers + rb.jokers > 1) continue
      const merged = canon([...a, ...b])
      if (!info(merged).isRun) continue
      const [i1, i2] = [ids[i], ids[j]]
      const act = [0, i1, i2]
      res.push({
        actions: [{ text: `COMBINE ${i1} ${i2}`, coarse: act, fine: act }],
        apply: log => {
          log.push({ id: i1, old: rows[i1] }, { id: i2, old: rows[i2] })
          setRowRaw(i1, merged)
          setRowRaw(i2, null)
        },
      })
    }
  }
  for (const id of ids) {
    const tiles = rows[id]!
    for (const tile of new Set(tiles)) {
      const cls = tile === JOKER ? 1 : 2
      for (const parts of takeResult(tiles, tile)) {
        // destinations after the take (a split creates row maxId + 1)
        const splitId = parts.length === 2 ? maxId + 1 : -1
        const dests: { id: number; tiles: Tiles }[] = []
        for (const d of ids) if (d !== id) dests.push({ id: d, tiles: rows[d]! })
        dests.push({ id, tiles: parts[0] })
        if (splitId > 0) dests.push({ id: splitId, tiles: parts[1] })
        for (const d of dests) {
          if (d.id === id && parts.length === 1) continue // back where it was
          if (!mayAccept(info(d.tiles), tile)) continue
          for (const putParts of putResult(d.tiles, tile)) {
            res.push({
              actions: [
                { text: `TAKE ${tileName(tile)} ${id}`, coarse: [cls], fine: [cls, 0, tile, id] },
                { text: `PUT ${tileName(tile)} ${d.id}`, coarse: [cls], fine: [cls, 1, tile, d.id] },
              ],
              apply: log => {
                applyParts(id, parts, log)
                applyParts(d.id, putParts, log)
              },
            })
          }
        }
      }
    }
  }
  return res
}

// ---------- plan comparison ----------
const planActions = (p: Plan | null): Action[] => {
  const out: Action[] = []
  for (let q = p; q; q = q.next) out.push(...q.actions)
  return out
}
const comparePlans = (pa: Plan, pb: Plan): number => {
  if (pa.jokerMoves !== pb.jokerMoves) return pa.jokerMoves - pb.jokerMoves
  const a = planActions(pa)
  const b = planActions(pb)
  for (const field of ["coarse", "fine"] as const) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const ra = a[i][field]
      const rb = b[i][field]
      for (let k = 0; k < Math.max(ra.length, rb.length); k++) {
        const d = (ra[k] ?? -1) - (rb[k] ?? -1)
        if (d !== 0) return d
      }
    }
  }
  return 0
}

let memo: Map<number, Plan | null>[] = []
const better = (p: Plan, cur: Plan | null): boolean => cur === null || comparePlans(p, cur) < 0

// Preferred plan of exactly `budget` actions from the current table (fewest
// joker moves first, then action order preferences)
const bestPlan = (budget: number): Plan | null => {
  if (heuristic() > budget) return null
  const key = stateKey()
  if (!memo[budget]) memo[budget] = new Map()
  const known = memo[budget].get(key)
  if (known !== undefined) return known
  let best: Plan | null = null
  if (budget === 1) {
    for (const id of liveIds()) {
      const tiles = rows[id]!
      if (!mayAccept(info(tiles), goalTile)) continue
      for (const parts of putResult(tiles, goalTile)) {
        const log: Change[] = []
        const oldMax = maxId
        applyParts(id, parts, log)
        const final = new Map<number, Tiles>()
        for (const i of liveIds()) final.set(i, rows[i]!)
        undo(log, oldMax)
        const act: Action = { text: `PUT ${tileName(goalTile)} ${id}`, coarse: [2], fine: [2, 1, goalTile, id] }
        const plan: Plan = { actions: [act], next: null, final, jokerMoves: 0 }
        if (better(plan, best)) best = plan
      }
    }
  } else {
    for (const mv of successors()) {
      if (mv.actions.length >= budget) continue
      const log: Change[] = []
      const oldMax = maxId
      mv.apply(log)
      const sub = bestPlan(budget - mv.actions.length)
      undo(log, oldMax)
      if (sub === null) continue
      const jokerMove = mv.actions[0].coarse[0] === 1 ? 1 : 0
      const plan: Plan = { actions: mv.actions, next: sub, final: null, jokerMoves: sub.jokerMoves + jokerMove }
      if (better(plan, best)) best = plan
    }
  }
  memo[budget].set(key, best)
  return best
}

// ---------- main ----------
goalTile = parseTile(readline().trim())
const rowCount = parseInt(readline())
for (let i = 0; i < rowCount; i++) {
  const parts = readline().trim().split(/\s+/)
  const id = parseInt(parts[0])
  maxId = Math.max(maxId, id)
  setRowRaw(id, canon(parts.slice(1).map(parseTile)))
}

let answer: Plan | null = null
for (let bound = heuristic(); answer === null && bound < 100; bound++) {
  memo = []
  answer = bestPlan(bound)
}

const formatRow = (tiles: Tiles): string => {
  const plain = tiles.filter(t => t !== JOKER)
  const out = plain.map(tileName)
  if (plain.length === tiles.length) return out.join(" ")
  if (info(tiles).isRun) {
    // the joker fills an inner gap if there is one, otherwise it goes to the right
    for (let i = 1; i < plain.length; i++) {
      if (numOf(plain[i]) - numOf(plain[i - 1]) > 1) {
        out.splice(i, 0, "J")
        return out.join(" ")
      }
    }
  }
  out.push("J")
  return out.join(" ")
}

if (answer !== null) {
  for (const a of planActions(answer)) console.log(a.text)
  let last: Plan = answer
  while (last.next) last = last.next
  const final = last.final!
  for (const id of [...final.keys()].sort((a, b) => a - b)) console.log(`${id} ${formatRow(final.get(id)!)}`)
}
