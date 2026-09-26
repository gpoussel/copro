// 🎮 CodinGame Puzzle - tetris-floor
// https://www.codingame.com/training/hard/tetris-floor

// Each connected region of free cells is solved independently. Cells get a
// processing order (row/column sweeps, slabs, rooms split at 1-wide passages,
// greedy growths; smallest "frontier" first). A tiling is built by always
// covering the first uncovered cell of that order, so a state is that
// position plus the set of already covered later cells. An A* search on the
// cost (heuristic: sum over free cells of the cheapest block price / 4) finds the
// minimal cost, counting the tilings reaching each state with that cost.
// Totals: costs and block vectors add up, tiling counts multiply.

const [floorW, floorH] = readline().split(" ").map(Number)
const cents = readline()
  .split(" ")
  .map(v => Math.round(parseFloat(v) * 100))
const floorRows: string[] = []
for (let i = 0; i < floorH; i++) floorRows.push(readline())

type Cell = [number, number]
const BASES = ["####", "##/##", "###/.#.", "###/#..", "###/..#", "##./.##", ".##/##."]

// All rotations of every block (rotations keep the type, reflections do not)
const shapes: { type: number; cells: Cell[] }[] = []
BASES.forEach((base, type) => {
  let cells: Cell[] = []
  base.split("/").forEach((row, r) => [...row].forEach((ch, c) => ch === "#" && cells.push([r, c])))
  const seen = new Set<string>()
  for (let rot = 0; rot < 4; rot++) {
    cells = cells.map(([r, c]) => [c, -r] as Cell)
    const sorted = [...cells].sort((a, b) => a[0] - b[0] || a[1] - b[1])
    const norm = sorted.map(([r, c]) => [r - sorted[0][0], c - sorted[0][1]] as Cell)
    const key = JSON.stringify(norm)
    if (!seen.has(key)) {
      seen.add(key)
      shapes.push({ type, cells: norm })
    }
  }
})

interface Res {
  cost: number
  ways: number
  vec: number[]
}

interface State {
  pos: number
  filled: number[]
  placed: number
  g: number
  h: number
  ways: number
  parent: State | null
  type: number
  closed: boolean
}

// Binary min-heap of state ids ordered by (f, placed), on typed arrays
function makeHeap() {
  let fs = new Float64Array(1024)
  let ps = new Int32Array(1024)
  let ids = new Int32Array(1024)
  let size = 0
  const less = (i: number, j: number) => fs[i] < fs[j] || (fs[i] === fs[j] && ps[i] < ps[j])
  const swap = (i: number, j: number) => {
    ;[fs[i], fs[j]] = [fs[j], fs[i]]
    ;[ps[i], ps[j]] = [ps[j], ps[i]]
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return {
    size: () => size,
    push(f: number, placed: number, id: number) {
      if (size === fs.length) {
        const grow = <T extends Float64Array | Int32Array>(a: T, b: T): T => (b.set(a), b)
        fs = grow(fs, new Float64Array(size * 2))
        ps = grow(ps, new Int32Array(size * 2))
        ids = grow(ids, new Int32Array(size * 2))
      }
      fs[size] = f
      ps[size] = placed
      ids[size] = id
      for (let i = size++; i > 0; ) {
        const parent = (i - 1) >> 1
        if (!less(i, parent)) break
        swap(i, parent)
        i = parent
      }
    },
    pop(): number {
      const top = ids[0]
      size--
      if (size > 0) {
        fs[0] = fs[size]
        ps[0] = ps[size]
        ids[0] = ids[size]
        for (let i = 0; ; ) {
          const l = 2 * i + 1
          let m = i
          if (l < size && less(l, m)) m = l
          if (l + 1 < size && less(l + 1, m)) m = l + 1
          if (m === i) break
          swap(i, m)
          i = m
        }
      }
      return top
    },
  }
}

// Dense lookup table (cell -> rank) with a margin so block offsets never leave it
function rankGrid(cells: Cell[], order: number[]): (r: number, c: number) => number | undefined {
  const width = Math.max(...cells.map(x => x[1])) + 9
  const height = Math.max(...cells.map(x => x[0])) + 9
  const grid = new Int32Array(width * height).fill(-1)
  order.forEach((id, k) => (grid[(cells[id][0] + 4) * width + cells[id][1] + 4] = k))
  return (r, c) => {
    const v = grid[(r + 4) * width + c + 4]
    return v < 0 ? undefined : v
  }
}

// Frontier estimate of an order: max number of later cells that share a
// possible block with an already processed cell
function orderCost(cells: Cell[], order: number[]): number {
  const n = order.length
  const rankAt = rankGrid(cells, order)
  const touch = Array.from({ length: n }, (_, q) => q)
  for (const [r, c] of cells)
    for (const shape of shapes) {
      const ks = shape.cells.map(([dr, dc]) => rankAt(r + dr, c + dc))
      if (ks.some(k => k === undefined)) continue
      const lo = Math.min(...(ks as number[]))
      for (const k of ks as number[]) touch[k] = Math.min(touch[k], lo)
    }
  const delta = new Int32Array(n + 1)
  for (let q = 0; q < n; q++) {
    delta[touch[q]]++
    delta[q]--
  }
  let worst = 0
  let cur = 0
  for (let k = 0; k < n; k++) worst = Math.max(worst, (cur += delta[k]))
  return worst
}

function candidateOrders(cells: Cell[]): number[][] {
  const ids = cells.map((_, i) => i)
  const rowMajor = [...ids].sort((a, b) => cells[a][0] - cells[b][0] || cells[a][1] - cells[b][1])
  const colMajor = [...ids].sort((a, b) => cells[a][1] - cells[b][1] || cells[a][0] - cells[b][0])
  const index = new Map<string, number>()
  cells.forEach((cell, i) => index.set(cell + "", i))
  const neighbours = (id: number): number[] => {
    const [r, c] = cells[id]
    const out: number[] = []
    for (const [dr, dc] of [
      [-1, 0],
      [0, -1],
      [0, 1],
      [1, 0],
    ]) {
      const j = index.get([r + dr, c + dc] + "")
      if (j !== undefined) out.push(j)
    }
    return out
  }
  // Greedy blob growth: always take the frontier cell with most processed
  // neighbours (ties: base order), so rooms are swept one after another
  const greedy = (base: number[]): number[] => {
    const pri = new Int32Array(cells.length)
    base.forEach((id, k) => (pri[id] = k))
    const done = new Uint8Array(cells.length)
    const nb = new Int32Array(cells.length)
    const frontier = new Set<number>([base[0]])
    const out: number[] = []
    while (frontier.size) {
      let pick = -1
      for (const id of frontier)
        if (pick < 0 || nb[id] > nb[pick] || (nb[id] === nb[pick] && pri[id] < pri[pick])) pick = id
      frontier.delete(pick)
      done[pick] = 1
      out.push(pick)
      for (const j of neighbours(pick))
        if (!done[j]) {
          nb[j]++
          frontier.add(j)
        }
    }
    return out
  }
  // Slabs: cut along lines (rows or columns) holding at most 2 cells, then
  // sweep every slab across its smaller dimension
  const slabs = (axis: 0 | 1, ratio: number): number[] => {
    const lines = new Map<number, number[]>()
    for (const id of ids) {
      const v = cells[id][axis]
      if (!lines.has(v)) lines.set(v, [])
      lines.get(v)!.push(id)
    }
    const keys = [...lines.keys()].sort((a, b) => a - b)
    const limit = Math.max(2, ratio * Math.max(...[...lines.values()].map(l => l.length)))
    const out: number[] = []
    let group: number[] = []
    let span = 0
    const flush = () => {
      if (!group.length) return
      const o = 1 - axis
      const lo = Math.min(...group.map(id => cells[id][o]))
      const hi = Math.max(...group.map(id => cells[id][o]))
      const across = hi - lo + 1 > span
      group.sort((a, b) =>
        across
          ? cells[a][o] - cells[b][o] || cells[a][axis] - cells[b][axis]
          : cells[a][axis] - cells[b][axis] || cells[a][o] - cells[b][o]
      )
      out.push(...group)
      group = []
      span = 0
    }
    for (const v of keys) {
      const line = lines.get(v)!
      group.push(...line)
      span++
      if (line.length <= limit) flush()
    }
    flush()
    return out
  }
  // Greedy on the frontier itself: next cell is the active one whose
  // processing adds the fewest new active cells
  const near: number[][] = cells.map(() => [])
  for (const [r, c] of cells)
    for (const shape of shapes) {
      const js = shape.cells.map(([dr, dc]) => index.get([r + dr, c + dc] + ""))
      if (js.some(j => j === undefined)) continue
      for (const a of js as number[]) for (const b of js as number[]) if (a !== b) near[a].push(b)
    }
  const nearSet = near.map(l => [...new Set(l)])
  const tight = (base: number[]): number[] => {
    const pri = new Int32Array(cells.length)
    base.forEach((id, k) => (pri[id] = k))
    const state = new Uint8Array(cells.length) // 0 untouched, 1 active, 2 done
    const active = new Set<number>([base[0]])
    state[base[0]] = 1
    const out: number[] = []
    while (out.length < cells.length) {
      let pick = -1
      let pickDelta = Infinity
      if (!active.size) {
        const id = base.find(j => state[j] === 0)!
        active.add(id)
        state[id] = 1
      }
      for (const id of active) {
        let delta = 0
        for (const j of nearSet[id]) if (state[j] === 0) delta++
        if (delta < pickDelta || (delta === pickDelta && pri[id] < pri[pick])) {
          pickDelta = delta
          pick = id
        }
      }
      active.delete(pick)
      state[pick] = 2
      out.push(pick)
      for (const j of nearSet[pick])
        if (state[j] === 0) {
          state[j] = 1
          active.add(j)
        }
    }
    return out
  }
  // Rooms: split the region at 1-wide passages, visit rooms and passage
  // cells depth-first, sweeping each room across its smaller dimension
  const unit = new Int32Array(cells.length).fill(-1)
  const units: number[][] = []
  const isPassage = (id: number) => {
    const [r, c] = cells[id]
    const has = (dr: number, dc: number) => index.has([r + dr, c + dc] + "")
    const nbCount = neighbours(id).length
    return nbCount === 2 && ((has(-1, 0) && has(1, 0)) || (has(0, -1) && has(0, 1)))
  }
  for (const id of ids) {
    if (unit[id] >= 0) continue
    const u = units.length
    const members = [id]
    unit[id] = u
    if (!isPassage(id))
      for (let i = 0; i < members.length; i++)
        for (const j of neighbours(members[i]))
          if (unit[j] < 0 && !isPassage(j)) {
            unit[j] = u
            members.push(j)
          }
    const rs = members.map(m => cells[m][0])
    const cs = members.map(m => cells[m][1])
    const tall = Math.max(...rs) - Math.min(...rs) > Math.max(...cs) - Math.min(...cs)
    members.sort((a, b) =>
      tall
        ? cells[a][0] - cells[b][0] || cells[a][1] - cells[b][1]
        : cells[a][1] - cells[b][1] || cells[a][0] - cells[b][0]
    )
    units.push(members)
  }
  const rooms: number[] = []
  const visited = new Uint8Array(units.length)
  const stack = [unit[rowMajor[0]]]
  while (stack.length) {
    const u = stack.pop()!
    if (visited[u]) continue
    visited[u] = 1
    rooms.push(...units[u])
    const next: number[] = []
    for (const m of units[u]) for (const j of neighbours(m)) if (!visited[unit[j]]) next.push(unit[j])
    stack.push(...next.reverse())
  }
  const res = [rowMajor, colMajor, greedy(rowMajor), greedy(colMajor), tight(rowMajor), tight(colMajor), rooms]
  for (const ratio of [0, 0.25, 0.5]) res.push(slabs(0, ratio), slabs(1, ratio))
  return res
}

// Race the three most promising orders (by frontier estimate) with resumable
// searches, giving more time to the better-ranked ones; the first to finish wins
function solveRegion(cells: Cell[]): Res {
  const searches = candidateOrders(cells)
    .map(order => ({ order, cost: orderCost(cells, order) }))
    .sort((a, b) => a.cost - b.cost)
    .filter((o, i, arr) => i === 0 || o.order.join() !== arr[i - 1].order.join())
    .slice(0, 3)
    .map(o => searchWithOrder(cells, o.order))
  for (;;)
    for (let i = 0; i < searches.length; i++) {
      const res = searches[i](i ? 4000 : 16000)
      if (res) return res
    }
}

function searchWithOrder(cells: Cell[], order: number[]): (budget: number) => Res | null {
  const n = cells.length
  const rankAt = rankGrid(cells, order)

  // placements[k] = blocks covering the cell at rank k, using only later cells
  const placements: { type: number; others: number[] }[][] = []
  for (let k = 0; k < n; k++) {
    const [r, c] = cells[order[k]]
    const list: { type: number; others: number[] }[] = []
    for (const shape of shapes) {
      for (const [ar, ac] of shape.cells) {
        const others: number[] = []
        let ok = true
        for (const [sr, sc] of shape.cells) {
          if (sr === ar && sc === ac) continue
          const q = rankAt(r + sr - ar, c + sc - ac)
          if (q === undefined || q <= k) {
            ok = false
            break
          }
          others.push(q)
        }
        if (ok) list.push({ type: shape.type, others: others.sort((a, b) => a - b) })
      }
    }
    placements.push(list)
  }

  // Every block position of the region (as ranks), indexed by each of its cells
  const around: number[][][] = Array.from({ length: n }, () => [])
  // Admissible per-cell cost: cheapest block that can cover the cell, per cell
  const cellCost = new Array<number>(n).fill(Infinity)
  for (const [r, c] of cells)
    for (const shape of shapes) {
      const ks = shape.cells.map(([dr, dc]) => rankAt(r + dr, c + dc))
      if (ks.some(k => k === undefined)) continue
      for (const k of ks as number[]) {
        around[k].push(ks as number[])
        cellCost[k] = Math.min(cellCost[k], cents[shape.type] / 4)
      }
    }
  if (cellCost.some(v => v === Infinity)) return () => ({ cost: Infinity, ways: 0, vec: [] })
  // Blocks lying further in the order are the likeliest to be still free
  for (const list of around) list.sort((x, y) => Math.min(...y) - Math.min(...x))
  const adj = order.map(id => {
    const [r, c] = cells[id]
    const out: number[] = []
    for (const [dr, dc] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const k = rankAt(r + dr, c + dc)
      if (k !== undefined) out.push(k)
    }
    return out
  })
  const mark = new Uint8Array(n)
  // A cell is dead when no block can still cover it
  const coverable = (q: number, pos: number): boolean => {
    for (const ks of around[q]) {
      const [a, b, c, d] = ks
      if (Math.min(a, b, c, d) < pos) return false
      if (!mark[a] && !mark[b] && !mark[c] && !mark[d]) return true
    }
    return false
  }

  // States live in an open-addressing hash table keyed by the position and
  // the bit mask of covered later cells (offsets are bounded by the reach)
  let maxReach = 1
  placements.forEach((list, k) => list.forEach(pl => pl.others.forEach(q => (maxReach = Math.max(maxReach, q - k)))))
  const stride = (maxReach >> 5) + 2
  let tableSize = 1 << 12
  let keys = new Int32Array(tableSize * stride)
  let slots = new Int32Array(tableSize).fill(-1)
  const pool: State[] = []
  const probe = new Int32Array(stride)
  const slotOf = (src: Int32Array, at: number): number => {
    let h = 0x811c9dc5
    for (let i = 0; i < stride; i++) h = Math.imul(h ^ src[at + i], 0x01000193) ^ (h >>> 15)
    let slot = (h >>> 0) & (tableSize - 1)
    for (;;) {
      const id = slots[slot]
      if (id < 0) return slot
      let same = true
      for (let i = 0; i < stride && same; i++) same = keys[slot * stride + i] === src[at + i]
      if (same) return slot
      slot = (slot + 1) & (tableSize - 1)
    }
  }
  const insert = (slot: number, st: State) => {
    slots[slot] = pool.length
    keys.set(probe, slot * stride)
    pool.push(st)
    if (pool.length * 2 <= tableSize) return
    const oldKeys = keys
    const oldSlots = slots
    tableSize *= 2
    keys = new Int32Array(tableSize * stride)
    slots = new Int32Array(tableSize).fill(-1)
    for (let i = 0; i < oldSlots.length; i++)
      if (oldSlots[i] >= 0) {
        const ns = slotOf(oldKeys, i * stride)
        slots[ns] = oldSlots[i]
        keys.set(oldKeys.subarray(i * stride, (i + 1) * stride), ns * stride)
      }
  }
  const heap = makeHeap()
  const h0 = cellCost.reduce((a, b) => a + b, 0)
  pool.push({ pos: 0, filled: [], placed: 0, g: 0, h: h0, ways: 1, parent: null, type: 0, closed: false })
  heap.push(h0, 0, 0)
  // Expand at most `budget` states, then yield (null) unless finished
  return budget => {
    while (heap.size()) {
      if (budget-- <= 0) return null
      const st = pool[heap.pop()]
      if (st.closed) continue
      st.closed = true
      if (st.pos === n) {
        // Block counts of one optimal tiling, read back along the parents
        const vec = [0, 0, 0, 0, 0, 0, 0]
        for (let cur: State = st; cur.parent; cur = cur.parent) vec[cur.type]++
        return { cost: st.g, ways: st.ways, vec }
      }
      for (const q of st.filled) mark[q] = 1
      mark[st.pos] = 1
      for (const pl of placements[st.pos]) {
        const [o1, o2, o3] = pl.others
        if (mark[o1] || mark[o2] || mark[o3]) continue
        mark[o1] = mark[o2] = mark[o3] = 1
        let pos = st.pos + 1
        while (pos < n && mark[pos]) pos++
        let dead = false
        for (let j = 0; j < 4 && !dead; j++)
          for (const q of adj[j === 0 ? st.pos : pl.others[j - 1]])
            if (q >= pos && !mark[q] && !coverable(q, pos)) {
              dead = true
              break
            }
        mark[o1] = mark[o2] = mark[o3] = 0
        if (dead) continue
        // Merge the two sorted lists of covered later cells
        const filled: number[] = []
        const old = st.filled
        let i = 0
        let j = 0
        while (i < old.length || j < 3) {
          const q = j >= 3 || (i < old.length && old[i] < pl.others[j]) ? old[i++] : pl.others[j++]
          if (q > pos) filled.push(q)
        }
        probe.fill(0)
        probe[0] = pos
        for (const q of filled) probe[1 + ((q - pos) >> 5)] |= 1 << ((q - pos) & 31)
        const slot = slotOf(probe, 0)
        const g = st.g + cents[pl.type]
        let nx = slots[slot] >= 0 ? pool[slots[slot]] : undefined
        if (!nx || g < nx.g) {
          let id = slots[slot]
          if (!nx) {
            const h = st.h - cellCost[st.pos] - cellCost[o1] - cellCost[o2] - cellCost[o3]
            nx = { pos, filled, placed: st.placed + 1, g, h, ways: st.ways, parent: st, type: pl.type, closed: false }
            id = pool.length
            insert(slot, nx)
          } else {
            nx.g = g
            nx.ways = st.ways
            nx.parent = st
            nx.type = pl.type
          }
          heap.push(g + nx.h, nx.placed, id)
        } else if (g === nx.g) nx.ways += st.ways
      }
      for (const q of st.filled) mark[q] = 0
      mark[st.pos] = 0
    }
    return { cost: Infinity, ways: 0, vec: [] }
  }
}

// Flood-fill the free cells into regions; identical regions are solved once
const seenCell = floorRows.map(row => [...row].map(() => false))
const cache = new Map<string, Res>()
let totalCost = 0
let totalWays = 1
const totalVec = [0, 0, 0, 0, 0, 0, 0]
let feasible = true
for (let sr = 0; sr < floorH; sr++) {
  for (let sc = 0; sc < floorW; sc++) {
    if (floorRows[sr][sc] !== "." || seenCell[sr][sc]) continue
    const cells: Cell[] = [[sr, sc]]
    seenCell[sr][sc] = true
    for (let i = 0; i < cells.length; i++) {
      const [r, c] = cells[i]
      for (const [dr, dc] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const rr = r + dr
        const cc = c + dc
        if (rr < 0 || cc < 0 || rr >= floorH || cc >= floorW) continue
        if (floorRows[rr][cc] !== "." || seenCell[rr][cc]) continue
        seenCell[rr][cc] = true
        cells.push([rr, cc])
      }
    }
    const minR = Math.min(...cells.map(x => x[0]))
    const minC = Math.min(...cells.map(x => x[1]))
    const local = cells.map(([r, c]) => [r - minR, c - minC] as Cell).sort((a, b) => a[0] - b[0] || a[1] - b[1])
    const sig = local.join(";")
    let res = cache.get(sig)
    if (!res) {
      res = local.length % 4 === 0 ? solveRegion(local) : { cost: Infinity, ways: 0, vec: [] }
      cache.set(sig, res)
    }
    if (res.ways === 0) feasible = false
    else {
      totalCost += res.cost
      totalWays *= res.ways
      res.vec.forEach((v, i) => (totalVec[i] += v))
    }
  }
}

if (!feasible) totalWays = 0
console.log((totalCost / 100).toFixed(2))
console.log(totalVec.join(" "))
console.log(totalWays)
