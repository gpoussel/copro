// 🎮 CodinGame Puzzle - space-maze
// https://www.codingame.com/training/expert/space-maze

// Breadth-first search on the first turn, replaying the referee rules: the car steps one
// cell onto ground or a platform; a platform slides until the next cell is ground or another
// platform (or leaves the map into orbit), carrying the car with it. Orbit moves are never
// required, so they are skipped: this keeps the state space small.
// Walking is free inside the car's connected region (ground + platforms), so a search state
// is the platform layout plus the region's smallest cell, and each edge is one platform move
// (carrying the car, or with the car parked in a chosen part of its region). Platforms of the
// same type are interchangeable, so positions inside a type group are kept sorted.
// The macro plan is then expanded with walking steps and printed one move per turn.
const [mazeW, mazeH]: number[] = readline().split(" ").map(Number)
const ground: Uint8Array = new Uint8Array(mazeW * mazeH)
let target: number = -1
for (let y = 0; y < mazeH; y++) {
  const row: string = readline()
  for (let x = 0; x < mazeW; x++) {
    const c: string = row[x]
    ground[y * mazeW + x] = c !== "#" ? 1 : 0
    if (c >= "0" && c <= "9") target = y * mazeW + x
  }
}
const CELLS: number = mazeW * mazeH
const ORBIT: number = CELLS
const DIR_NAMES: string[] = ["U", "R", "D", "L"]

// nb[cell * 4 + d]: neighbour cell index in direction d, or -1 outside the map
const nb: Int16Array = new Int16Array(CELLS * 4)
for (let c = 0; c < CELLS; c++) {
  const x: number = c % mazeW
  const y: number = Math.floor(c / mazeW)
  nb[c * 4] = y > 0 ? c - mazeW : -1
  nb[c * 4 + 1] = x + 1 < mazeW ? c + 1 : -1
  nb[c * 4 + 2] = y + 1 < mazeH ? c + mazeW : -1
  nb[c * 4 + 3] = x > 0 ? c - 1 : -1
}

const entityCount: number = parseInt(readline())
let carId: number = 0
let carStart: number = 0
const platIds: number[] = []
const platType: string[] = []
const platStart: number[] = []
for (let i = 0; i < entityCount; i++) {
  const [id, x, y, dirs] = readline().split(" ")
  const cell: number = Number(y) * mazeW + Number(x)
  if (dirs === "CAR") {
    carId = Number(id)
    carStart = cell
  } else {
    platIds.push(Number(id))
    platType.push(dirs)
    platStart.push(cell)
  }
}
const nPlat: number = platIds.length
const STRIDE: number = nPlat + 1

// Search slots: platforms sorted by type so each type forms a contiguous group
const slotOrder: number[] = platIds.map((_: number, i: number) => i)
slotOrder.sort((a: number, b: number) => (platType[a] < platType[b] ? -1 : platType[a] > platType[b] ? 1 : a - b))
const slotDirs: number[][] = slotOrder.map((i: number) => [...platType[i]].map((c: string) => DIR_NAMES.indexOf(c)))
const groupStart: number[] = []
for (let k = 0; k < nPlat; k++) {
  const same: boolean = k > 0 && platType[slotOrder[k]] === platType[slotOrder[k - 1]]
  groupStart.push(same ? groupStart[k - 1] : k)
}
// Restore sorted order inside the group of slot k after its position changed
const fixGroup = (p: Uint8Array, k: number): void => {
  while (k > groupStart[k] && p[k - 1] > p[k]) {
    const t: number = p[k - 1]
    p[k - 1] = p[k]
    p[k] = t
    k--
  }
  while (k + 1 < nPlat && groupStart[k + 1] === groupStart[k] && p[k + 1] < p[k]) {
    const t: number = p[k + 1]
    p[k + 1] = p[k]
    p[k] = t
    k++
  }
}

// Platform occupancy of the layout being examined
const occupied: Uint8Array = new Uint8Array(CELLS + 1)
const walkable = (c: number): boolean => ground[c] === 1 || occupied[c] === 1

// Flood fill of the walkable region from a cell; returns its size, cells in floodCells,
// membership stamped in mark[], smallest cell in floodMin
const mark: Int32Array = new Int32Array(CELLS)
let stamp: number = 0
const floodCells: Int16Array = new Int16Array(CELLS)
let floodMin: number = 0
const flood = (from: number): number => {
  stamp++
  let n: number = 1
  floodCells[0] = from
  mark[from] = stamp
  floodMin = from
  for (let k = 0; k < n; k++) {
    const c: number = floodCells[k]
    for (let d = 0; d < 4; d++) {
      const x: number = nb[c * 4 + d]
      if (x < 0 || mark[x] === stamp || !walkable(x)) continue
      mark[x] = stamp
      floodCells[n++] = x
      if (x < floodMin) floodMin = x
    }
  }
  return n
}

// Slide a platform from cell `from` in direction d: new cell, ORBIT when lost, -1 if stuck
const slide = (from: number, d: number): number => {
  let cur: number = from
  while (true) {
    const x: number = nb[cur * 4 + d]
    if (x < 0) return ORBIT
    if (walkable(x)) break
    cur = x
  }
  return cur === from ? -1 : cur
}

// State storage: STRIDE bytes per state [regionMin, slot positions...] + open-addressing hash
let cap: number = 1 << 16
let store: Uint8Array = new Uint8Array(cap * STRIDE)
let parentOf: Int32Array = new Int32Array(cap)
let info: Uint8Array = new Uint8Array(cap * 3) // stand cell, moved-from cell, direction
let count: number = 0
let hashBits: number = 18
let table: Int32Array = new Int32Array(1 << hashBits).fill(-1)

const hashAt = (buf: Uint8Array, off: number): number => {
  let h: number = 2166136261
  for (let k = 0; k < STRIDE; k++) h = Math.imul(h ^ buf[off + k], 16777619)
  return (h ^ (h >>> 15)) >>> 0
}
const sameAt = (off: number, cand: Uint8Array): boolean => {
  for (let k = 0; k < STRIDE; k++) if (store[off + k] !== cand[k]) return false
  return true
}
const rehash = (): void => {
  hashBits++
  table = new Int32Array(1 << hashBits).fill(-1)
  const m: number = (1 << hashBits) - 1
  for (let s = 0; s < count; s++) {
    let h: number = hashAt(store, s * STRIDE) & m
    while (table[h] >= 0) h = (h + 1) & m
    table[h] = s
  }
}

// Insert a candidate state; returns its id, or -1 when already known
const insert = (cand: Uint8Array, par: number, stand: number, from: number, dir: number): number => {
  const m: number = (1 << hashBits) - 1
  let h: number = hashAt(cand, 0) & m
  while (table[h] >= 0) {
    if (sameAt(table[h] * STRIDE, cand)) return -1
    h = (h + 1) & m
  }
  if (count === cap) {
    cap *= 2
    const ns: Uint8Array = new Uint8Array(cap * STRIDE)
    ns.set(store)
    store = ns
    const np: Int32Array = new Int32Array(cap)
    np.set(parentOf)
    parentOf = np
    const ni: Uint8Array = new Uint8Array(cap * 3)
    ni.set(info)
    info = ni
  }
  const id: number = count++
  table[h] = id
  store.set(cand, id * STRIDE)
  parentOf[id] = par
  info[id * 3] = stand
  info[id * 3 + 1] = from
  info[id * 3 + 2] = dir
  if (count * 2 > 1 << hashBits) rehash()
  return id
}

const cand: Uint8Array = new Uint8Array(STRIDE)
const p: Uint8Array = new Uint8Array(nPlat)
for (let k = 0; k < nPlat; k++) cand[k + 1] = platStart[slotOrder[k]]
for (let k = 0; k < nPlat; k++) fixGroup(cand.subarray(1), k)
for (let k = 0; k < nPlat; k++) occupied[cand[k + 1]] = 1
flood(carStart)
cand[0] = floodMin
let goal: number = -1
insert(cand, -1, 0, 0, 0)
if (mark[target] === stamp) goal = 0

const region: Int16Array = new Int16Array(CELLS)
const inRegion: Int32Array = new Int32Array(CELLS)
let regionStamp: number = 0
const seenComp: Int32Array = new Int32Array(CELLS)
let compStamp: number = 0

for (let head = 0; head < count && goal < 0; head++) {
  const off: number = head * STRIDE
  for (let k = 0; k < nPlat; k++) p[k] = store[off + 1 + k]
  occupied.fill(0)
  for (let k = 0; k < nPlat; k++) occupied[p[k]] = 1
  occupied[ORBIT] = 0
  const rn: number = flood(store[off])
  region.set(floodCells.subarray(0, rn))
  regionStamp++
  for (let k = 0; k < rn; k++) inRegion[region[k]] = regionStamp
  const regionMin: number = floodMin

  for (let i = 0; i < nPlat && goal < 0; i++) {
    const from: number = p[i]
    if (from === ORBIT) continue
    const carryable: boolean = inRegion[from] === regionStamp
    for (const d of slotDirs[i]) {
      const to: number = slide(from, d)
      if (to < 0 || to === ORBIT) continue
      // apply the move on the occupancy grid
      occupied[from] = 0
      if (to !== ORBIT) occupied[to] = 1
      cand.set(p, 1)
      cand[i + 1] = to
      fixGroup(cand.subarray(1), i)
      let touches: boolean = false
      if (to !== ORBIT) {
        for (let e = 0; e < 4; e++) {
          const x: number = nb[to * 4 + e]
          if (x >= 0 && inRegion[x] === regionStamp) touches = true
        }
      }
      if (carryable && to !== ORBIT) {
        // the car rides the platform
        flood(to)
        cand[0] = floodMin
        const id: number = insert(cand, head, from, from, d)
        if (id >= 0 && mark[target] === stamp) goal = id
      }
      if (!carryable && !touches) {
        // region untouched: the car stays where it is
        cand[0] = regionMin
        insert(cand, head, region[0], from, d)
      } else {
        // the car waits somewhere in its region: one successor per resulting component
        compStamp++
        for (let k = 0; k < rn && goal < 0; k++) {
          const c: number = region[k]
          if (c === from || seenComp[c] === compStamp) continue
          const n: number = flood(c)
          for (let q = 0; q < n; q++) seenComp[floodCells[q]] = compStamp
          cand[0] = floodMin
          const id: number = insert(cand, head, c, from, d)
          if (id >= 0 && mark[target] === stamp) goal = id
        }
      }
      occupied[from] = 1
      if (to !== ORBIT) occupied[to] = 0
      if (goal >= 0) break
    }
  }
}

// Rebuild the turn-by-turn plan: walk to the required cell, then move the platform
const chain: number[] = []
for (let k = goal; k > 0; k = parentOf[k]) chain.push(k)
chain.reverse()
const plan: string[] = []
const layout: number[] = platStart.slice()
let carAt: number = carStart
const setOccupied = (): void => {
  occupied.fill(0)
  for (const c of layout) if (c !== ORBIT) occupied[c] = 1
}
const walkTo = (dest: number): void => {
  setOccupied()
  const prev: Int32Array = new Int32Array(CELLS).fill(-2)
  const queue: number[] = [carAt]
  prev[carAt] = -1
  for (let k = 0; k < queue.length && prev[dest] === -2; k++) {
    for (let d = 0; d < 4; d++) {
      const x: number = nb[queue[k] * 4 + d]
      if (x < 0 || prev[x] !== -2 || !walkable(x)) continue
      prev[x] = queue[k]
      queue.push(x)
    }
  }
  const steps: string[] = []
  for (let c = dest; prev[c] >= 0; c = prev[c]) {
    const src: number = prev[c]
    let d: number = 0
    while (nb[src * 4 + d] !== c) d++
    steps.push(`${carId} ${DIR_NAMES[d]}`)
  }
  plan.push(...steps.reverse())
  carAt = dest
}
for (const k of chain) {
  walkTo(info[k * 3])
  const idx: number = layout.indexOf(info[k * 3 + 1])
  const d: number = info[k * 3 + 2]
  plan.push(`${platIds[idx]} ${DIR_NAMES[d]}`)
  setOccupied()
  const to: number = slide(layout[idx], d)
  if (carAt === layout[idx]) carAt = to
  layout[idx] = to
}
walkTo(target)

for (let turn = 0; ; turn++) {
  if (turn > 0) {
    const n: number = parseInt(readline())
    for (let i = 0; i < n; i++) readline()
  }
  console.log(plan[turn] ?? `${carId} U`)
}
