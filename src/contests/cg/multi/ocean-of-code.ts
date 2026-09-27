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
const restrict = (keep: (c: number) => boolean) => {
  const next = new Set([...candidates].filter(keep))
  candidates = next.size ? next : allWater()
}

while (true) {
  const [x, y, myLife, oppLife, torpedoCd, sonarCd, silenceCd, mineCd] = readline().split(" ").map(Number)
  const sonarResult = readline().trim()
  const orders = readline().trim()
  const me = y * W + x
  visited.add(me)
  void myLife
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
  for (const o of heard) {
    if (o[0] === "MOVE") {
      const [dx, dy] = DIRS[o[1]]
      const next = new Set<number>()
      for (const c of candidates) {
        const nx = (c % W) + dx
        const ny = Math.floor(c / W) + dy
        if (water(nx, ny)) next.add(ny * W + nx)
      }
      candidates = next
    } else if (o[0] === "SURFACE") {
      const s = parseInt(o[1])
      candidates = new Set([...candidates].filter(c => sectorOf(c % W, Math.floor(c / W)) === s))
    } else if (o[0] === "TORPEDO") {
      const tx = parseInt(o[1])
      const ty = parseInt(o[2])
      const reach = waterDist(tx, ty, 4)
      candidates = new Set([...candidates].filter(c => reach.has(c)))
      if (Math.max(Math.abs(tx - x), Math.abs(ty - y)) <= 3) threatened = true
    } else if (o[0] === "TRIGGER") {
      const tx = parseInt(o[1])
      const ty = parseInt(o[2])
      if (Math.max(Math.abs(tx - x), Math.abs(ty - y)) <= 3) threatened = true
    } else if (o[0] === "SILENCE") {
      const next = new Set<number>()
      for (const c of candidates) {
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
      candidates = next
    }
  }
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
    if (bestCell >= 0 && bestValue >= 0.5) {
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
    if (best >= 0 && bestValue >= 0.6) {
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
  if (bestDir) {
    const [dx, dy] = DIRS[bestDir]
    // Silence away (one step, as a normal move would) after being targeted.
    if (pendingSilence && silenceCd === 0) {
      actions.push(`SILENCE ${bestDir} 1`)
      pendingSilence = false
    } else actions.push(`MOVE ${bestDir} ${charge}`)
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
  console.log(actions.join("|"))
}
