// 🎮 CodinGame Multiplayer - wondev-woman
// https://www.codingame.com/multiplayer/bot-programming/wondev-woman
// Referee: https://github.com/CodinGame/WondevWoman
//
// Santorini-like: move (up at most 1 level, down any) then build +1 on an
// adjacent cell (4 = removed). Wood: standing on level 3 wins; later leagues
// score each climb to 3, give 2 units and PUSH&BUILD. Bot: 1-ply over the
// legal MOVE&BUILD actions: climb to 3 if possible; else land high, keep
// climbable neighbours, never build a level-3 cell the (visible) opponent
// can step on next turn, prefer building on cells we can climb.

const size = parseInt(readline())
const units = parseInt(readline())
const DIR: Record<string, [number, number]> = {
  N: [0, -1],
  NE: [1, -1],
  E: [1, 0],
  SE: [1, 1],
  S: [0, 1],
  SW: [-1, 1],
  W: [-1, 0],
  NW: [-1, -1],
}

while (true) {
  const grid: number[][] = []
  for (let y = 0; y < size; y++) grid.push([...readline()].map(ch => (ch === "." ? -1 : +ch)))
  const mine: [number, number][] = []
  for (let i = 0; i < units; i++) mine.push(readline().split(" ").map(Number) as [number, number])
  const theirs: [number, number][] = []
  for (let i = 0; i < units; i++) theirs.push(readline().split(" ").map(Number) as [number, number])
  const count = parseInt(readline())
  const actions: string[][] = []
  for (let i = 0; i < count; i++) actions.push(readline().trim().split(" "))
  if (!actions.length) {
    console.log("ACCEPT-DEFEAT")
    continue
  }
  const h = (x: number, y: number) => (x < 0 || y < 0 || x >= size || y >= size ? -1 : grid[y][x])
  const occupied = (x: number, y: number) => [...mine, ...theirs].some(([ux, uy]) => ux === x && uy === y)
  let best = actions[0]
  let bestScore = -Infinity
  for (const a of actions) {
    if (a[0] !== "MOVE&BUILD") continue
    const [ux, uy] = mine[+a[1]]
    const [mx, my] = DIR[a[2]]
    const nx = ux + mx
    const ny = uy + my
    const [bx, by] = DIR[a[3]]
    const tx = nx + bx
    const ty = ny + by
    const land = h(nx, ny)
    if (land === 3) {
      best = a
      bestScore = Infinity
      break
    }
    const built = h(tx, ty) + 1
    grid[ty][tx] = built
    let score = land * 30
    // Climbable neighbours after the build.
    for (const [dx, dy] of Object.values(DIR)) {
      const v = h(nx + dx, ny + dy)
      if (v < 0 || v > 3 || occupied(nx + dx, ny + dy)) continue
      if (v <= land + 1) score += 3 + (v === land + 1 ? 4 : 0) + (v === 3 && land >= 2 ? 40 : 0)
    }
    // Opponent: can it climb to 3 next turn?
    for (const [ox, oy] of theirs) {
      if (ox < 0) continue
      const oh = h(ox, oy)
      for (const [dx, dy] of Object.values(DIR)) {
        const v = h(ox + dx, oy + dy)
        if (v === 3 && oh >= 2 && !(ox + dx === nx && oy + dy === ny)) score -= 200
        if (v >= 0 && v <= 3 && v <= oh + 1) score -= 1
      }
    }
    grid[ty][tx] = built - 1
    if (built === 4) score -= 2
    if (score > bestScore) {
      bestScore = score
      best = a
    }
  }
  console.log(best.join(" "))
}
