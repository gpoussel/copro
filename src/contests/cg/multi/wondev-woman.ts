// 🎮 CodinGame Multiplayer - wondev-woman
// https://www.codingame.com/multiplayer/bot-programming/wondev-woman
// Referee: https://github.com/CodinGame/WondevWoman
//
// Santorini-like: move (up at most 1 level, down any) then build +1 on an
// adjacent cell (4 = removed); or push an adjacent enemy (same direction or
// one of the two nearest) and build where it stood. From Bronze: 2 units
// each, a point per climb onto level 3, enemies seen only when adjacent.
// Bot: 1-ply over the legal actions with a state evaluation: points (×100),
// unit heights, mobility, and territory (cells one of our units reaches
// first, king moves); enemy terms only for visible enemies.

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
const STEPS = Object.values(DIR)

function evaluate(grid: number[][], mine: [number, number][], theirs: [number, number][]): number {
  const h = (x: number, y: number) => (x < 0 || y < 0 || x >= size || y >= size ? -1 : grid[y][x])
  const all = [...mine, ...theirs.filter(t => t[0] >= 0)]
  const occupied = (x: number, y: number) => all.some(([ux, uy]) => ux === x && uy === y)
  const mobility = (ux: number, uy: number) => {
    let m = 0
    let up = 0
    for (const [dx, dy] of STEPS) {
      const v = h(ux + dx, uy + dy)
      if (v < 0 || v > 3 || v > h(ux, uy) + 1 || occupied(ux + dx, uy + dy)) continue
      m++
      if (v === h(ux, uy) + 1) up++
    }
    return m + up
  }
  // Territory: BFS (king moves, climbing rule) from each side.
  const reach = (starts: [number, number][]) => {
    const d = new Int32Array(size * size).fill(99)
    const q: number[] = []
    for (const [x, y] of starts) {
      d[y * size + x] = 0
      q.push(y * size + x)
    }
    for (let i = 0; i < q.length; i++) {
      const c = q[i]
      const cx = c % size
      const cy = Math.floor(c / size)
      for (const [dx, dy] of STEPS) {
        const nx = cx + dx
        const ny = cy + dy
        const v = h(nx, ny)
        if (v < 0 || v > 3 || v > h(cx, cy) + 1) continue
        if (d[ny * size + nx] <= d[c] + 1) continue
        d[ny * size + nx] = d[c] + 1
        q.push(ny * size + nx)
      }
    }
    return d
  }
  let score = 0
  for (const [x, y] of mine) score += h(x, y) * 12 + mobility(x, y) * 3 - (mobility(x, y) === 0 ? 60 : 0)
  const visible = theirs.filter(t => t[0] >= 0)
  for (const [x, y] of visible) score -= h(x, y) * 12 + mobility(x, y) * 3 - (mobility(x, y) === 0 ? 60 : 0)
  if (visible.length) {
    const dm = reach(mine)
    const dt = reach(visible)
    for (let c = 0; c < size * size; c++) {
      if (dm[c] < dt[c]) score += 2
      else if (dt[c] < dm[c]) score -= 2
    }
  }
  return score
}

while (true) {
  const grid: number[][] = []
  for (let y = 0; y < size; y++) grid.push([...readline()].map(ch => (ch === "." ? -1 : ch === "4" ? 4 : +ch)))
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
  let best = actions[0]
  let bestScore = -Infinity
  for (const a of actions) {
    const idx = +a[1]
    const [ux, uy] = mine[idx]
    const [d1x, d1y] = DIR[a[2]]
    const [d2x, d2y] = DIR[a[3]]
    const g = grid.map(r => r.slice())
    const m = mine.map(p => p.slice() as [number, number])
    const t = theirs.map(p => p.slice() as [number, number])
    let points = 0
    if (a[0] === "MOVE&BUILD") {
      const nx = ux + d1x
      const ny = uy + d1y
      if (g[ny][nx] === 3) points++
      m[idx] = [nx, ny]
      g[ny + d2y][nx + d2x]++
    } else {
      // PUSH&BUILD: the enemy at dir1 is pushed along dir2, its cell rises.
      const ex = ux + d1x
      const ey = uy + d1y
      const k = t.findIndex(p => p[0] === ex && p[1] === ey)
      if (k >= 0) t[k] = [ex + d2x, ey + d2y]
      g[ey][ex]++
    }
    const score = points * 100 + evaluate(g, m, t)
    if (score > bestScore) {
      bestScore = score
      best = a
    }
  }
  console.log(best.join(" "))
}
