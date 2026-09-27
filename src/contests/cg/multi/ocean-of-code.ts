// 🎮 CodinGame Multiplayer - ocean-of-code
// https://www.codingame.com/multiplayer/bot-programming/ocean-of-code
// Referee: https://github.com/CodinGameCommunity/ocean-of-code
//
// Wood league: MOVE (never onto our own path; SURFACE resets it for 1 HP),
// TORPEDO (3 charges, range 4 around islands, 2 damage + 1 around).
// Enemy tracking: the set of cells the enemy may be on, filtered by its heard
// orders. Fire when charged at the cell with the best expected damage that
// does not hurt us; move where the most unvisited water stays reachable.

const [W, H, myId] = readline().split(" ").map(Number)
void myId
const map: string[] = []
for (let y = 0; y < H; y++) map.push(readline())
const water = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && map[y][x] === "."
const DIRS: Record<string, [number, number]> = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] }
const sectorOf = (x: number, y: number) => Math.floor(y / 5) * 3 + Math.floor(x / 5) + 1

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

let candidates = new Set<number>()
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (water(x, y)) candidates.add(y * W + x)
const visited = new Set<number>()

while (true) {
  const [x, y, , , torpedoCd] = readline().split(" ").map(Number)
  readline() // sonar result
  const orders = readline().trim()
  visited.add(y * W + x)
  // Update the enemy candidates from its orders.
  if (orders !== "NA") {
    for (const raw of orders.split("|")) {
      const o = raw.trim().split(" ")
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
        const reach = waterDist(parseInt(o[1]), parseInt(o[2]), 4)
        candidates = new Set([...candidates].filter(c => reach.has(c)))
      }
    }
  }
  const actions: string[] = []
  // Torpedo first (from the current position).
  if (torpedoCd === 0 && candidates.size > 0 && candidates.size <= 20) {
    const inRange = waterDist(x, y, 4)
    let bestCell = -1
    let bestValue = 0
    for (const [cell] of inRange) {
      const cx = cell % W
      const cy = Math.floor(cell / W)
      if (Math.max(Math.abs(cx - x), Math.abs(cy - y)) <= 1) continue // would hit us
      let value = 0
      for (const c of candidates) {
        const d = Math.max(Math.abs((c % W) - cx), Math.abs(Math.floor(c / W) - cy))
        value += d === 0 ? 2 : d === 1 ? 1 : 0
      }
      if (value > bestValue) {
        bestValue = value
        bestCell = cell
      }
    }
    if (bestCell >= 0 && bestValue / candidates.size >= 0.5)
      actions.push(`TORPEDO ${bestCell % W} ${Math.floor(bestCell / W)}`)
  }
  // Move where the most unvisited water remains reachable.
  let bestDir = ""
  let bestSpace = -1
  for (const [name, [dx, dy]] of Object.entries(DIRS)) {
    const nx = x + dx
    const ny = y + dy
    if (!water(nx, ny) || visited.has(ny * W + nx)) continue
    const seen = new Set([ny * W + nx])
    const q = [ny * W + nx]
    for (let h = 0; h < q.length && seen.size < 120; h++) {
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
    if (seen.size > bestSpace) {
      bestSpace = seen.size
      bestDir = name
    }
  }
  if (bestDir) actions.push(`MOVE ${bestDir} TORPEDO`)
  else {
    actions.push("SURFACE")
    visited.clear()
    visited.add(y * W + x)
  }
  console.log(actions.join("|"))
}
