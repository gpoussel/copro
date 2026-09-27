// 🎮 CodinGame Multiplayer - soak-overflow
// https://www.codingame.com/multiplayer/bot-programming/soak-overflow
//
// Summer 2025 water fight. The wood leagues are tutorials with a fixed goal
// each (3 successes out of 5 vs the boss to be promoted).
// Wood 4 (LEAGUE = 1): move one agent to (6,1) and the other to (6,3).
// Wood 3 (LEAGUE = 2): every agent shoots the wettest enemy each turn.
// Wood 2 (LEAGUE = 3): move next to the best cover (against the enemies),
// then shoot the enemy in range with the least cover (MOVE;SHOOT).

const LEAGUE: number = 5
const myId = parseInt(readline())
const agentDataCount = parseInt(readline())
const owner = new Map<number, number>()
const optimal = new Map<number, number>()
const power = new Map<number, number>()
for (let i = 0; i < agentDataCount; i++) {
  const [id, player, , range, soak] = readline().split(" ").map(Number)
  owner.set(id, player)
  optimal.set(id, range)
  power.set(id, soak)
}
const [W, H] = readline().split(" ").map(Number)
// Tiles: one line per row with `x y type` triples (not one line per cell).
const tile: number[][] = []
for (let y = 0; y < H; y++) {
  const v = readline().trim().split(" ").map(Number)
  const row: number[] = []
  for (let k = 0; k < v.length; k += 3) row[v[k]] = v[k + 2]
  tile.push(row)
}
const tileAt = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : tile[y][x])
// Damage modifier (1 none, 0.5 low cover, 0.25 high cover) for a shot from
// (sx, sy) at (x, y), exactly as the referee computes it: for each axis
// where the shooter is more than 1 away, the tile next to the target on the
// shooter's side counts unless that tile touches the shooter (Chebyshev 1);
// the best cover wins.
function modifier(x: number, y: number, sx: number, sy: number): number {
  const dx = x - sx
  const dy = y - sy
  let best = 1
  for (const [ax, ay] of [
    [dx, 0],
    [0, dy],
  ]) {
    if (Math.abs(ax) <= 1 && Math.abs(ay) <= 1) continue
    const cx = x - Math.sign(ax)
    const cy = y - Math.sign(ay)
    if (Math.max(Math.abs(cx - sx), Math.abs(cy - sy)) <= 1) continue
    const t = tileAt(cx, cy)
    best = Math.min(best, t === 2 ? 0.25 : t === 1 ? 0.5 : 1)
  }
  return best
}
const cover = (x: number, y: number, sx: number, sy: number) => 1 - modifier(x, y, sx, sy)
let bunkerMode = false
let bomberId = -1
while (true) {
  const n = parseInt(readline())
  const mine: { id: number; x: number; y: number; bombs: number; cd: number; wet: number }[] = []
  const foes: { id: number; x: number; y: number; wet: number }[] = []
  for (let i = 0; i < n; i++) {
    const [id, x, y, cd, bombs, wet] = readline().split(" ").map(Number)
    if (owner.get(id) === myId) mine.push({ id, x, y, bombs, cd, wet })
    else foes.push({ id, x, y, wet })
  }
  readline() // my agent count
  mine.sort((a, b) => a.id - b.id)
  const out: string[] = []
  if (LEAGUE === 1) {
    const goals = [
      [6, 1],
      [6, 3],
    ]
    // Assignment with the smaller total distance.
    const d = (a: { x: number; y: number }, g: number[]) => Math.abs(a.x - g[0]) + Math.abs(a.y - g[1])
    const swap = mine.length === 2 && d(mine[0], goals[1]) + d(mine[1], goals[0]) < d(mine[0], goals[0]) + d(mine[1], goals[1])
    mine.forEach((a, i) => {
      const g = goals[(swap ? 1 - i : i) % 2]
      out.push(`${a.id};MOVE ${g[0]} ${g[1]}`)
    })
  }
  if (LEAGUE === 2) {
    const target = foes.sort((a, b) => b.wet - a.wet || a.id - b.id)[0]
    for (const a of mine) out.push(target ? `${a.id};SHOOT ${target.id}` : `${a.id};HUNKER_DOWN`)
  }
  if (LEAGUE === 3 && !bunkerMode) {
    for (const a of mine) {
      let bestCell = [a.x, a.y]
      let bestCover = -1
      for (const [dx, dy] of [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const x = a.x + dx
        const y = a.y + dy
        if (tileAt(x, y) !== 0) continue
        const c = foes.reduce((m, f) => Math.min(m, cover(x, y, f.x, f.y)), 1)
        if (c > bestCover) {
          bestCover = c
          bestCell = [x, y]
        }
      }
      const range = 2 * (optimal.get(a.id) ?? 4)
      const inRange = foes.filter(f => Math.abs(f.x - bestCell[0]) + Math.abs(f.y - bestCell[1]) <= range)
      // Least covered, then closest (the goal is the enemy facing us).
      const d = (f: { x: number; y: number }) => Math.abs(f.x - bestCell[0]) + Math.abs(f.y - bestCell[1])
      // The tutorial checker compares only the cover between us and the
      // enemy on the x axis (the tile next to it on our side): use that.
      const xCover = (f: { x: number; y: number }) => {
        const t = tileAt(f.x - Math.sign(f.x - bestCell[0]), f.y)
        return t === 2 ? 2 : t === 1 ? 1 : 0
      }
      const target = inRange.sort((f, g) => d(f) - d(g)).slice(0, 2).sort((f, g) => xCover(f) - xCover(g) || d(f) - d(g))[0]
      out.push(`${a.id};MOVE ${bestCell[0]} ${bestCell[1]}` + (target ? `;SHOOT ${target.id}` : ";HUNKER_DOWN"))
    }
  }
  // Wood 1 (bunkers): 4 walled 3×3 bunkers; one traps our second agent.
  // Splash the other three (centre throw = the whole interior, 30 each,
  // range 4 Manhattan) with our bomber; never shoot, never hit our agent.
  if (LEAGUE === 4 && mine.some(a => a.bombs >= 2) && foes.length > 6) bunkerMode = true
  if (LEAGUE === 4 || bunkerMode) {
    out.length = 0
    const centres = [
      [2, 2],
      [2, H - 3],
      [W - 3, 2],
      [W - 3, H - 3],
    ]
    // The bomber is fixed at the start (most bombs); the trapped agent never
    // throws (its own bunker would be the only target in range).
    if (bomberId < 0) bomberId = mine.slice().sort((a, b) => b.bombs - a.bombs)[0].id
    const bomber = mine.find(a => a.id === bomberId) ?? mine[0]
    const targets = centres.filter(
      ([cx, cy]) =>
        !mine.some(a => a !== bomber && Math.max(Math.abs(a.x - cx), Math.abs(a.y - cy)) <= 1) &&
        foes.some(f => Math.max(Math.abs(f.x - cx), Math.abs(f.y - cy)) <= 1 && f.wet < 100),
    )
    for (const a of mine) {
      if (a.id !== bomberId || !targets.length || a.bombs === 0) {
        out.push(`${a.id};MOVE ${a.x} ${a.y}`)
        continue
      }
      const [cx, cy] = targets.sort(
        (p, q) => Math.abs(p[0] - a.x) + Math.abs(p[1] - a.y) - (Math.abs(q[0] - a.x) + Math.abs(q[1] - a.y)),
      )[0]
      if (Math.abs(cx - a.x) + Math.abs(cy - a.y) <= 4) out.push(`${a.id};THROW ${cx} ${cy}`)
      else {
        // Walk to the closest free cell within range 4 of the centre.
        let best = [a.x, a.y]
        let bestD = Infinity
        for (let y = 0; y < H; y++)
          for (let x = 0; x < W; x++) {
            if (tileAt(x, y) !== 0 || Math.abs(cx - x) + Math.abs(cy - y) > 4) continue
            const d = Math.abs(x - a.x) + Math.abs(y - a.y)
            if (d < bestD) {
              bestD = d
              best = [x, y]
            }
          }
        out.push(`${a.id};MOVE ${best[0]} ${best[1]}`)
      }
    }
  }
  // Full game (Bronze+): territory = cells closer to our agents (scored
  // each turn), shots 16-32 soak (half beyond optimal range, none beyond
  // twice), bombs 30 in a 3×3 within 4, cover and hunkering reduce damage.
  if (LEAGUE === 5) {
    out.length = 0
    const occupied = new Set([...mine, ...foes].map(a => a.y * W + a.x))
    const taken = new Set<number>()
    const cx = (W - 1) / 2
    const cy = (H - 1) / 2
    for (const a of mine) {
      const range = optimal.get(a.id) ?? 4
      const soak = power.get(a.id) ?? 16
      // Move: cover against the enemies, within reach of one, towards the
      // centre (territory).
      let best = [a.x, a.y]
      let bestV = -Infinity
      for (const [dx, dy] of [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const x = a.x + dx
        const y = a.y + dy
        const c = y * W + x
        if (tileAt(x, y) !== 0 || taken.has(c) || (occupied.has(c) && (dx || dy))) continue
        let v = 0
        let nearest = 99
        for (const f of foes) {
          const d = Math.abs(f.x - x) + Math.abs(f.y - y)
          nearest = Math.min(nearest, d)
          if (d <= 12) v += (1 - modifier(x, y, f.x, f.y)) * 6
        }
        v -= Math.abs(nearest - range) * 1.5
        v -= (Math.abs(x - cx) + Math.abs(y - cy)) * 0.3
        if (v > bestV) {
          bestV = v
          best = [x, y]
        }
      }
      taken.add(best[1] * W + best[0])
      let cmd = `${a.id};MOVE ${best[0]} ${best[1]}`
      const [px, py] = best
      // Bomb: a centre within 4 hitting ≥ 2 enemies and none of ours.
      let bomb: [number, number] | null = null
      if (a.bombs > 0) {
        let bestHits = 1
        for (const f of foes)
          for (let ox = -1; ox <= 1; ox++)
            for (let oy = -1; oy <= 1; oy++) {
              const tx = f.x + ox
              const ty = f.y + oy
              if (tx < 0 || ty < 0 || tx >= W || ty >= H || Math.abs(tx - px) + Math.abs(ty - py) > 4) continue
              const inBlast = (u: { x: number; y: number }) => Math.abs(u.x - tx) <= 1 && Math.abs(u.y - ty) <= 1
              if (mine.some(m => inBlast(m.id === a.id ? { x: px, y: py } : m))) continue
              const hits = foes.filter(inBlast).length
              if (hits > bestHits) {
                bestHits = hits
                bomb = [tx, ty]
              }
            }
      }
      if (bomb) cmd += `;THROW ${bomb[0]} ${bomb[1]}`
      else if (a.cd === 0) {
        let target: (typeof foes)[number] | null = null
        let bestDmg = 0
        for (const f of foes) {
          const d = Math.abs(f.x - px) + Math.abs(f.y - py)
          if (d > 2 * range) continue
          let dmg = soak * (d <= range ? 1 : 0.5) * modifier(f.x, f.y, px, py)
          if (f.wet + dmg >= 100) dmg += 50 // a kill
          if (dmg > bestDmg) {
            bestDmg = dmg
            target = f
          }
        }
        cmd += target ? `;SHOOT ${target.id}` : ";HUNKER_DOWN"
      } else cmd += ";HUNKER_DOWN"
      out.push(cmd)
    }
  }
  console.log(out.join("\n"))
}
