// 🎮 CodinGame Multiplayer - soak-overflow
// https://www.codingame.com/multiplayer/bot-programming/soak-overflow
//
// Summer 2025 water fight. The wood leagues are tutorials with a fixed goal
// each (3 successes out of 5 vs the boss to be promoted).
// Wood 4 (LEAGUE = 1): move one agent to (6,1) and the other to (6,3).
// Wood 3 (LEAGUE = 2): every agent shoots the wettest enemy each turn.
// Wood 2 (LEAGUE = 3): move next to the best cover (against the enemies),
// then shoot the enemy in range with the least cover (MOVE;SHOOT).

const LEAGUE: number = 3
const myId = parseInt(readline())
const agentDataCount = parseInt(readline())
const owner = new Map<number, number>()
const optimal = new Map<number, number>()
for (let i = 0; i < agentDataCount; i++) {
  const [id, player, , range] = readline().split(" ").map(Number)
  owner.set(id, player)
  optimal.set(id, range)
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
// Protection (0, 0.5, 0.75) of an agent at (x, y) against a shot from (sx, sy):
// an orthogonally adjacent cover whose side faces the shooter.
function cover(x: number, y: number, sx: number, sy: number): number {
  let best = 0
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const t = tileAt(x + dx, y + dy)
    if (t <= 0) continue
    const cx = x + dx
    const cy = y + dy
    const facing = (dx !== 0 && Math.sign(sx - cx) === dx) || (dy !== 0 && Math.sign(sy - cy) === dy)
    // Ignored when the shooter touches the same cover.
    const shooterAdjacent = Math.abs(sx - cx) + Math.abs(sy - cy) === 1
    if (facing && !shooterAdjacent) best = Math.max(best, t === 2 ? 0.75 : 0.5)
  }
  return best
}

while (true) {
  const n = parseInt(readline())
  const mine: { id: number; x: number; y: number }[] = []
  const foes: { id: number; x: number; y: number; wet: number }[] = []
  for (let i = 0; i < n; i++) {
    const [id, x, y, , , wet] = readline().split(" ").map(Number)
    if (owner.get(id) === myId) mine.push({ id, x, y })
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
  if (LEAGUE === 3) {
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
      const target = inRange.sort(
        (f, g) => cover(f.x, f.y, bestCell[0], bestCell[1]) - cover(g.x, g.y, bestCell[0], bestCell[1]) || d(f) - d(g),
      )[0]
      out.push(`${a.id};MOVE ${bestCell[0]} ${bestCell[1]}` + (target ? `;SHOOT ${target.id}` : ";HUNKER_DOWN"))
    }
  }
  console.log(out.join("\n"))
}
