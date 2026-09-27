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
  console.log(out.join("\n"))
}
