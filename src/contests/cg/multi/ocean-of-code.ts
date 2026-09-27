// 🎮 CodinGame Multiplayer - ocean-of-code
// https://www.codingame.com/multiplayer/bot-programming/ocean-of-code
// Referee: https://github.com/CodinGameCommunity/ocean-of-code
//
// MOVE (never onto our own path; SURFACE resets it for 1 HP), TORPEDO (3
// charges, range 4 around islands, 2 damage + 1 around), SONAR (4), SILENCE
// (6, 0-4 cells in one direction, unseen), MINE (3) + TRIGGER.
// Enemy tracking: the set of cells the enemy may be on, filtered by its heard
// orders (SILENCE expands it), by our sonar answers, and by the damage our
// torpedoes/mines did. Fire (torpedo or mine) at the cell with the best
// expected damage that does not hurt us; drop mines along the way; SILENCE
// away after the enemy fired close to us; move where the most unvisited
// water stays reachable, drifting towards the enemy when it is located.

const [W, H, myId] = readline().split(" ").map(Number)
void myId
const map: string[] = []
for (let y = 0; y < H; y++) map.push(readline())
const water = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && map[y][x] === "."
const DIRS: Record<string, [number, number]> = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] }
const sectorOf = (x: number, y: number) => Math.floor(y / 5) * 3 + Math.floor(x / 5) + 1
const cheb = (a: number, b: number) =>
  Math.max(Math.abs((a % W) - (b % W)), Math.abs(Math.floor(a / W) - Math.floor(b / W)))

// BFS distances through water from (x, y), up to `limit`.
function waterDist(x: number, y: number, limit: number): Map<number, number> {
  const d = new Map([[y * W + x, 0]])
  const q = [y * W + x]
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    const dc = d.get(c)!
    if (dc >= limit) continue
    for (const [dx, dy] of Object.values(DIRS)) {
      const nx = (c % W) + dx
      const ny = Math.floor(c / W) + dy
      if (!water(nx, ny) || d.has(ny * W + nx)) continue
      d.set(ny * W + nx, dc + 1)
      q.push(ny * W + nx)
    }
  }
  return d
}

// Start in the largest open area, near the centre.
let start = [7, 7]
{
  let best = -1
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!water(x, y)) continue
      const v = waterDist(x, y, 6).size - Math.abs(x - 7) - Math.abs(y - 7)
      if (v > best) {
        best = v
        start = [x, y]
      }
    }
}
console.log(`${start[0]} ${start[1]}`)

const allWater = () => {
  const s = new Set<number>()
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (water(x, y)) s.add(y * W + x)
  return s
}
let candidates = allWater()
// Enemy hypotheses with their own path (a submarine cannot cross its path
// until it surfaces): far tighter than positions alone after SILENCE.
type Cand = { pos: number; vis: Uint32Array }
const freshPaths = (): Cand[] =>
  [...allWater()].map(pos => {
    const vis = new Uint32Array(8)
    vis[pos >> 5] |= 1 << (pos & 31)
    return { pos, vis }
  })
let paths = freshPaths()
const has = (v: Uint32Array, c: number) => (v[c >> 5] >>> (c & 31)) & 1
const MAX_PATHS = 4000
function applyPathOrders(list: Cand[], orders: string[][]): Cand[] {
  for (const o of orders) {
    if (o[0] === "MOVE") {
      const [dx, dy] = DIRS[o[1]]
      const next: Cand[] = []
      for (const c of list) {
        const nx = (c.pos % W) + dx
        const ny = Math.floor(c.pos / W) + dy
        const n = ny * W + nx
        if (!water(nx, ny) || has(c.vis, n)) continue
        c.vis[n >> 5] |= 1 << (n & 31)
        c.pos = n
        next.push(c)
      }
      list = next
    } else if (o[0] === "SURFACE") {
      const s = parseInt(o[1])
      list = list.filter(c => sectorOf(c.pos % W, Math.floor(c.pos / W)) === s)
      for (const c of list) {
        c.vis.fill(0)
        c.vis[c.pos >> 5] |= 1 << (c.pos & 31)
      }
    } else if (o[0] === "TORPEDO") {
      const reach = waterDist(parseInt(o[1]), parseInt(o[2]), 4)
      list = list.filter(c => reach.has(c.pos))
    } else if (o[0] === "SILENCE") {
      const next: Cand[] = []
      const seen = new Set<string>()
      const push = (c: Cand) => {
        let h = c.pos
        for (let i = 0; i < 8; i++) h = (Math.imul(h, 31) + c.vis[i]) | 0
        const key = `${c.pos}:${h}`
        if (seen.has(key)) return
        seen.add(key)
        next.push(c)
      }
      for (const c of list) {
        push(c)
        for (const [dx, dy] of Object.values(DIRS)) {
          let cx = c.pos % W
          let cy = Math.floor(c.pos / W)
          const vis = c.vis.slice()
          for (let k = 1; k <= 4; k++) {
            cx += dx
            cy += dy
            const n = cy * W + cx
            if (!water(cx, cy) || has(vis, n)) break
            vis[n >> 5] |= 1 << (n & 31)
            push({ pos: n, vis: vis.slice() })
          }
        }
      }
      list = next
      // Too many hypotheses: keep a random sample.
      if (list.length > MAX_PATHS) {
        for (let i = list.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[list[i], list[j]] = [list[j], list[i]]
        }
        list.length = MAX_PATHS
      }
    }
  }
  return list
}
const syncCandidates = () => {
  if (!paths.length) paths = freshPaths()
  candidates = new Set(paths.map(c => c.pos))
}
const visited = new Set<number>()
const myMines = new Set<number>()
let lastOppLife = 6
let lastSonar = 0 // sector we probed last turn
let blasts: number[] = [] // cells we hit last turn (torpedo / trigger)
let pendingSilence = false

// Damage a blast at `b` deals to a submarine at `c`.
const damage = (b: number, c: number) => {
  const d = cheb(b, c)
  return d === 0 ? 2 : d === 1 ? 1 : 0
}
// Positions a submarine may be on after its public orders.
function applyOrders(cands: Set<number>, orders: string[][]): Set<number> {
  for (const o of orders) {
    if (o[0] === "MOVE") {
      const [dx, dy] = DIRS[o[1]]
      const next = new Set<number>()
      for (const c of cands) {
        const nx = (c % W) + dx
        const ny = Math.floor(c / W) + dy
        if (water(nx, ny)) next.add(ny * W + nx)
      }
      cands = next
    } else if (o[0] === "SURFACE") {
      const s = parseInt(o[1])
      cands = new Set([...cands].filter(c => sectorOf(c % W, Math.floor(c / W)) === s))
    } else if (o[0] === "TORPEDO") {
      const reach = waterDist(parseInt(o[1]), parseInt(o[2]), 4)
      cands = new Set([...cands].filter(c => reach.has(c)))
    } else if (o[0] === "SILENCE") {
      const next = new Set<number>()
      for (const c of cands) {
        next.add(c)
        for (const [dx, dy] of Object.values(DIRS)) {
          let cx = c % W
          let cy = Math.floor(c / W)
          for (let k = 1; k <= 4; k++) {
            cx += dx
            cy += dy
            if (!water(cx, cy)) break
            next.add(cy * W + cx)
          }
        }
      }
      cands = next
    }
  }
  return cands.size ? cands : allWater()
}
// What the enemy can know about us, from our own public orders.
let myCands = allWater()
let lastMyLife = 6
let surfacedLastTurn = false

const restrict = (keep: (c: number) => boolean) => {
  const next = paths.filter(c => keep(c.pos))
  if (next.length) paths = next
  syncCandidates()
}

while (true) {
  const [x, y, myLife, oppLife, torpedoCd, sonarCd, silenceCd, mineCd] = readline().split(" ").map(Number)
  const sonarResult = readline().trim()
  const orders = readline().trim()
  const me = y * W + x
  visited.add(me)
  const heard = orders === "NA" ? [] : orders.split("|").map(o => o.trim().split(" "))
  // Our blasts were resolved before the enemy acted: filter on the damage
  // when nothing else could have changed its life.
  if (blasts.length && !heard.some(o => ["SURFACE", "TORPEDO", "TRIGGER"].includes(o[0]))) {
    const lost = lastOppLife - oppLife
    restrict(c => blasts.reduce((s, b) => s + damage(b, c), 0) === lost)
  }
  blasts = []
  if (lastSonar && (sonarResult === "Y" || sonarResult === "N"))
    restrict(c => (sectorOf(c % W, Math.floor(c / W)) === lastSonar) === (sonarResult === "Y"))
  lastSonar = 0
  let threatened = false
  paths = applyPathOrders(paths, heard)
  syncCandidates()
  // The enemy's blasts: threat detection, and what our life loss tells it.
  const enemyBlasts: number[] = []
  for (const o of heard)
    if (o[0] === "TORPEDO" || o[0] === "TRIGGER") {
      const tx = parseInt(o[1])
      const ty = parseInt(o[2])
      enemyBlasts.push(ty * W + tx)
      if (Math.max(Math.abs(tx - x), Math.abs(ty - y)) <= 3) threatened = true
    }
  if (enemyBlasts.length) {
    const lost = lastMyLife - myLife - (surfacedLastTurn ? 1 : 0)
    const next = new Set([...myCands].filter(c => enemyBlasts.reduce((t, b) => t + damage(b, c), 0) === lost))
    if (next.size) myCands = next
  }
  lastMyLife = myLife
  if (!candidates.size) candidates = allWater()
  if (threatened) pendingSilence = true

  const actions: string[] = []
  let pos = me
  // Expected damage of a blast at cell b (0 if it would hurt us at `from`).
  const value = (b: number, from: number) => {
    if (cheb(b, from) <= 1) return 0
    let v = 0
    for (const c of candidates) v += damage(b, c)
    return v / candidates.size
  }
  const fireTorpedo = () => {
    if (torpedoCd !== 0 || candidates.size > 30) return
    let bestCell = -1
    let bestValue = 0
    for (const [cell] of waterDist(pos % W, Math.floor(pos / W), 4)) {
      const v = value(cell, pos)
      if (v > bestValue) {
        bestValue = v
        bestCell = cell
      }
    }
    // Firing reveals us: demand a good shot unless we are already known.
    if (bestCell >= 0 && bestValue >= (myCands.size <= 15 ? 0.5 : 0.9)) {
      actions.push(`TORPEDO ${bestCell % W} ${Math.floor(bestCell / W)}`)
      blasts.push(bestCell)
      torpedoFired = true
    }
  }
  const triggerMine = () => {
    if (candidates.size > 40) return
    let best = -1
    let bestValue = 0
    for (const m of myMines) {
      const v = value(m, pos)
      if (v > bestValue) {
        bestValue = v
        best = m
      }
    }
    if (best >= 0 && bestValue >= (myCands.size <= 15 ? 0.6 : 0.8)) {
      actions.push(`TRIGGER ${best % W} ${Math.floor(best / W)}`)
      myMines.delete(best)
      blasts.push(best)
      mineTriggered = true
    }
  }
  let torpedoFired = false
  let mineTriggered = false
  fireTorpedo()
  triggerMine()

  // Move where the most unvisited water remains reachable, towards the
  // enemy when it is located and our torpedo is (almost) ready.
  const located = candidates.size <= 30
  let cx = 0
  let cy = 0
  for (const c of candidates) {
    cx += c % W
    cy += Math.floor(c / W)
  }
  cx /= candidates.size
  cy /= candidates.size
  let bestDir = ""
  let bestScore = -Infinity
  for (const [name, [dx, dy]] of Object.entries(DIRS)) {
    const nx = x + dx
    const ny = y + dy
    if (!water(nx, ny) || visited.has(ny * W + nx)) continue
    const seen = new Set([ny * W + nx])
    const q = [ny * W + nx]
    for (let h = 0; h < q.length && seen.size < 80; h++) {
      const c = q[h]
      for (const [ex, ey] of Object.values(DIRS)) {
        const px = (c % W) + ex
        const py = Math.floor(c / W) + ey
        const k = py * W + px
        if (!water(px, py) || visited.has(k) || seen.has(k)) continue
        seen.add(k)
        q.push(k)
      }
    }
    let score = Math.min(seen.size, 40) * 10
    if (located) {
      const d = Math.abs(nx - cx) + Math.abs(ny - cy)
      score -= torpedoCd <= 1 ? Math.abs(d - 3) * 3 : 0
    }
    if (score > bestScore) {
      bestScore = score
      bestDir = name
    }
  }
  const charge = torpedoCd > 0 ? "TORPEDO" : silenceCd > 0 ? "SILENCE" : mineCd > 0 ? "MINE" : sonarCd > 0 ? "SONAR" : "TORPEDO"
  // Silence when the enemy may know where we are (few candidates left in
  // its view of us, or it just fired close): the dash (1-4 cells) ending
  // where the most unvisited water stays reachable.
  let silenced = false
  if (silenceCd === 0 && (pendingSilence || myCands.size <= 15)) {
    let best: [string, number, number[]] | null = null
    let bestSpace = -1
    for (const [name, [dx, dy]] of Object.entries(DIRS)) {
      const path: number[] = []
      for (let k = 1; k <= 4; k++) {
        const nx = x + dx * k
        const ny = y + dy * k
        if (!water(nx, ny) || visited.has(ny * W + nx)) break
        path.push(ny * W + nx)
        const seen = new Set([...visited, ...path])
        const q = [ny * W + nx]
        let space = 0
        for (let h = 0; h < q.length && space < 60; h++)
          for (const [ex, ey] of Object.values(DIRS)) {
            const px = (q[h] % W) + ex
            const py = Math.floor(q[h] / W) + ey
            if (!water(px, py) || seen.has(py * W + px)) continue
            seen.add(py * W + px)
            q.push(py * W + px)
            space++
          }
        const score = Math.min(space, 40) * 10 + k
        if (score > bestSpace) {
          bestSpace = score
          best = [name, k, path.slice()]
        }
      }
    }
    if (best) {
      actions.push(`SILENCE ${best[0]} ${best[1]}`)
      for (const c of best[2]) visited.add(c)
      pos = best[2][best[2].length - 1]
      silenced = true
      pendingSilence = false
    }
  }
  if (silenced) {
    // (moved by the silence)
  } else if (bestDir) {
    const [dx, dy] = DIRS[bestDir]
    actions.push(`MOVE ${bestDir} ${charge}`)
    pos = (y + dy) * W + (x + dx)
    visited.add(pos)
  } else {
    actions.push("SURFACE")
    visited.clear()
    visited.add(me)
  }
  // A second chance to fire from the new cell.
  if (!torpedoFired) fireTorpedo()
  if (!mineTriggered && !torpedoFired) triggerMine()
  // Drop a mine next to us (not on a cell we already mined).
  if (mineCd === 0 && !mineTriggered) {
    const px = pos % W
    const py = Math.floor(pos / W)
    for (const [name, [dx, dy]] of Object.entries(DIRS)) {
      const m = (py + dy) * W + (px + dx)
      if (!water(px + dx, py + dy) || myMines.has(m)) continue
      actions.push(`MINE ${name}`)
      myMines.add(m)
      break
    }
  }
  // Sonar the likeliest sector when the enemy is not located.
  if (sonarCd === 0 && candidates.size > 30) {
    const count = new Map<number, number>()
    for (const c of candidates) {
      const s = sectorOf(c % W, Math.floor(c / W))
      count.set(s, (count.get(s) ?? 0) + 1)
    }
    let best = 0
    let bestN = 0
    for (const [s, n] of count) if (n > bestN && n < candidates.size) [best, bestN] = [s, n]
    if (best) {
      actions.push(`SONAR ${best}`)
      lastSonar = best
    }
  }
  lastOppLife = oppLife
  surfacedLastTurn = actions.includes("SURFACE")
  const publicOrders = actions.map(a => {
    const p = a.split(" ")
    if (p[0] === "SURFACE") return ["SURFACE", String(sectorOf(x, y))]
    if (p[0] === "SILENCE") return ["SILENCE"]
    return p
  })
  myCands = applyOrders(myCands, publicOrders)
  console.log(actions.join("|"))
}
