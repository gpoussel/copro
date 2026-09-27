// 🎮 CodinGame Multiplayer - crystal-rush
// https://www.codingame.com/multiplayer/bot-programming/crystal-rush
//
// 30×15 grid, HQ = column 0, 5 robots each; ore is hidden until a radar
// (radius 4, Manhattan) covers it. One robot fetches and buries radars on a
// fixed lattice while known ore is scarce; the others dig the nearest known
// ore cell with capacity left (ore amount minus robots already sent), else
// dig blind in fresh cells near the HQ. Holes we did not dig ourselves may
// hide an enemy trap: known ore there is skipped.

const [W, H] = readline().split(" ").map(Number)
// Ore clusters are centred at x = 3 + 25·u^0.55 (skewed away from the HQ),
// y in 2..12 (referee: Game.generateMap).
const RADAR_SPOTS: [number, number][] = [
  [7, 7],
  [11, 3],
  [11, 11],
  [15, 7],
  [19, 3],
  [19, 11],
  [23, 7],
  [27, 3],
  [27, 11],
  [4, 2],
  [4, 12],
  [15, 0],
  [15, 14],
  [23, 0],
  [23, 14],
]
const ourHoles = new Set<number>() // cells we dug (safe from enemy traps)
const pendingDig = new Map<number, number>() // robot id -> cell it dug last turn
const suspicious = new Set<number>() // holes that appeared without us
let prevHoles = new Set<number>()
let prevEnemies = new Map<number, number>() // enemy robot id -> cell

while (true) {
  readline() // scores
  const ore = new Int32Array(W * H).fill(-1)
  const holes = new Set<number>()
  for (let y = 0; y < H; y++) {
    const p = readline().trim().split(" ")
    for (let x = 0; x < W; x++) {
      if (p[2 * x] !== "?") ore[y * W + x] = parseInt(p[2 * x])
      if (p[2 * x + 1] === "1") holes.add(y * W + x)
    }
  }
  const [count, radarCd] = readline().split(" ").map(Number)
  const robots: { id: number; x: number; y: number; item: number }[] = []
  const radars = new Set<number>()
  const traps = new Set<number>()
  const enemies = new Map<number, number>()
  for (let i = 0; i < count; i++) {
    const [id, type, x, y, item] = readline().split(" ").map(Number)
    if (type === 0) robots.push({ id, x, y, item })
    else if (type === 1 && x >= 0) enemies.set(id, y * W + x)
    else if (type === 2) radars.add(y * W + x)
    else if (type === 3) traps.add(y * W + x)
  }
  robots.sort((a, b) => a.id - b.id)
  // Holes: ours when one of our robots dug there, suspicious otherwise.
  for (const c of pendingDig.values()) if (holes.has(c) && !prevHoles.has(c)) ourHoles.add(c)
  for (const c of holes) if (!prevHoles.has(c) && !ourHoles.has(c)) suspicious.add(c)
  // An enemy robot that stood still outside the HQ dug next to it: any hole
  // around it may now hold a trap.
  for (const [id, c] of enemies) {
    if (prevEnemies.get(id) !== c || c % W === 0) continue
    for (const d of [c, c - 1, c + 1, c - W, c + W]) if (holes.has(d)) suspicious.add(d)
  }
  prevEnemies = enemies
  prevHoles = holes
  pendingDig.clear()

  const safe = (c: number) => !traps.has(c) && !suspicious.has(c)
  const capacity = new Map<number, number>()
  for (let c = 0; c < W * H; c++) if (ore[c] > 0 && safe(c)) capacity.set(c, ore[c])
  let knownOre = 0
  for (const v of capacity.values()) knownOre += v
  const alive = robots.filter(r => r.x >= 0)
  const nextSpot = RADAR_SPOTS.find(([x, y]) => !radars.has(y * W + x) && safe(y * W + x))

  let fetcher = -1
  if (nextSpot && !robots.some(o => o.item === 2) && (knownOre < 4 * alive.length || radars.size < 5)) {
    let bestX = Infinity
    for (const r of alive)
      if (r.item !== 4 && r.x < bestX && radarCd <= Math.ceil(r.x / 4)) {
        bestX = r.x
        fetcher = r.id
      }
  }
  const reserved = new Set<number>()
  const spotsTaken = new Set<number>()
  const out: string[] = []
  for (const r of robots) {
    if (r.x < 0) {
      out.push("WAIT")
      continue
    }
    if (r.item === 4) {
      out.push(`MOVE 0 ${r.y}`)
      continue
    }
    // Radar duty.
    if (r.item === 2) {
      const spot = RADAR_SPOTS.find(
        ([x, y]) => !radars.has(y * W + x) && safe(y * W + x) && !spotsTaken.has(y * W + x),
      )
      if (spot) {
        spotsTaken.add(spot[1] * W + spot[0])
        out.push(`DIG ${spot[0]} ${spot[1]}`)
        if (Math.abs(r.x - spot[0]) + Math.abs(r.y - spot[1]) <= 1) pendingDig.set(r.id, spot[1] * W + spot[0])
        continue
      }
    }
    // Radar fetcher: the free robot closest to the HQ goes to request one
    // while ore is scarce or few radars are down (timed to the cooldown).
    if (r.id === fetcher) {
      if (r.x === 0 && radarCd === 0) {
        out.push("REQUEST RADAR")
      } else out.push(`MOVE 0 ${r.y}`)
      continue
    }
    // Mine the nearest known ore with capacity left.
    let best = -1
    let bestD = Infinity
    for (const [c, left] of capacity) {
      if (left <= 0) continue
      const d = Math.abs((c % W) - r.x) + Math.abs(Math.floor(c / W) - r.y) + (c % W)
      if (d < bestD) {
        bestD = d
        best = c
      }
    }
    if (best < 0) {
      // Blind dig: the nearest fresh cell away from the HQ column.
      for (let c = 0; c < W * H; c++) {
        const x = c % W
        const y = Math.floor(c / W)
        if (x < 6 || y < 1 || y > 13 || holes.has(c) || ore[c] === 0 || !safe(c)) continue
        if (reserved.has(c)) continue
        const d = Math.abs(x - r.x) + Math.abs(y - r.y)
        if (d < bestD) {
          bestD = d
          best = c
        }
      }
    }
    if (best < 0) {
      out.push("WAIT")
      continue
    }
    capacity.set(best, (capacity.get(best) ?? 1) - 1)
    const bx = best % W
    const by = Math.floor(best / W)
    if (Math.abs(bx - r.x) + Math.abs(by - r.y) <= 1) pendingDig.set(r.id, best)
    reserved.add(best) // blind targets: the next robot picks another cell
    out.push(`DIG ${bx} ${by}`)
  }
  console.log(out.join("\n"))
}
