// 🎮 CodinGame Multiplayer - hypersonic
// https://www.codingame.com/multiplayer/bot-programming/hypersonic
//
// Bomberman on 13×11: bombs explode after 8 turns (range counts the bomb
// cell), chain reactions, boxes (`0`, `1` = range item, `2` = bomb item)
// stop blasts, walls `X`. From Bronze bombs hurt everyone (2-4 players).
// Bot: explosion timeline of every bomb on the map (with chains); a plan is
// only played if an escape path survives every blast (BFS over cell × time);
// target = the safe cell maximising (boxes a bomb there would hit, not
// already doomed, + items) / (distance + 2); BOMB when standing on it and
// the escape exists; moves are given one cell at a time.

const [W, H, myId] = readline().split(" ").map(Number)
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
const HORIZON = 10

type Bomb = { x: number; y: number; timer: number; range: number }

while (true) {
  const grid: string[] = []
  for (let y = 0; y < H; y++) grid.push(readline())
  const n = parseInt(readline())
  let me = { x: 0, y: 0, bombs: 0, range: 3 }
  const bombs: Bomb[] = []
  const items = new Set<number>()
  for (let i = 0; i < n; i++) {
    const [type, owner, x, y, p1, p2] = readline().split(" ").map(Number)
    if (type === 0 && owner === myId) me = { x, y, bombs: p1, range: p2 }
    else if (type === 1) bombs.push({ x, y, timer: p1, range: p2 })
    else if (type === 2) items.add(y * W + x)
  }
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H
  const isBox = (x: number, y: number) => grid[y][x] >= "0" && grid[y][x] <= "9"
  const solid = (x: number, y: number) => grid[y][x] !== "."

  // Cells hit by a bomb (boxes, walls and other bombs stop the blast).
  const blastCells = (b: Bomb, all: Bomb[]): number[] => {
    const out = [b.y * W + b.x]
    for (const [dx, dy] of DIRS)
      for (let k = 1; k < b.range; k++) {
        const x = b.x + dx * k
        const y = b.y + dy * k
        if (!inside(x, y) || grid[y][x] === "X") break
        out.push(y * W + x)
        if (solid(x, y) || all.some(o => o.x === x && o.y === y)) break
      }
    return out
  }
  // Explosion time of every bomb (chains), and danger[t] = cells blasted at t.
  const timeline = (all: Bomb[]) => {
    const when = all.map(b => b.timer)
    let changed = true
    while (changed) {
      changed = false
      all.forEach((b, i) => {
        for (const c of blastCells(b, all))
          all.forEach((o, j) => {
            if (j !== i && o.y * W + o.x === c && when[j] > when[i]) {
              when[j] = when[i]
              changed = true
            }
          })
      })
    }
    const danger: Set<number>[] = Array.from({ length: HORIZON + 1 }, () => new Set())
    all.forEach((b, i) => {
      if (when[i] <= HORIZON) for (const c of blastCells(b, all)) danger[when[i]].add(c)
    })
    return { danger, when }
  }
  // Can we survive from `start` (reached after this turn, t = 1)?
  const survives = (start: number, all: Bomb[]): boolean => {
    const { danger, when } = timeline(all)
    const bombAt = (c: number, t: number) => all.some((b, i) => b.y * W + b.x === c && when[i] >= t)
    // A bomb showing timer k explodes before our k-th move from now, so the
    // cell held after move t faces the blasts of time t + 1.
    let frontier = new Set([start])
    for (let t = 1; t < HORIZON; t++) {
      const next = new Set<number>()
      for (const c of frontier) {
        if (danger[t + 1].has(c)) continue
        next.add(c)
      }
      if (!next.size) return false
      if (t === HORIZON - 1) return true
      const moved = new Set<number>()
      for (const c of next) {
        moved.add(c)
        for (const [dx, dy] of DIRS) {
          const x = (c % W) + dx
          const y = Math.floor(c / W) + dy
          if (!inside(x, y) || solid(x, y) || bombAt(y * W + x, t + 1)) continue
          moved.add(y * W + x)
        }
      }
      frontier = moved
    }
    return true
  }

  const here = me.y * W + me.x
  const { danger: now } = timeline(bombs)
  const doomed = new Set<number>()
  for (let t = 0; t <= HORIZON; t++) for (const c of now[t]) if (isBox(c % W, Math.floor(c / W))) doomed.add(c)
  const bombValue = (c: number) => {
    let v = 0
    for (const h of blastCells({ x: c % W, y: Math.floor(c / W), timer: 8, range: me.range }, bombs))
      if (isBox(h % W, Math.floor(h / W)) && !doomed.has(h)) v++
    return v
  }
  // BFS from our cell over free cells.
  const dist = new Int32Array(W * H).fill(-1)
  const first = new Int32Array(W * H).fill(-1)
  dist[here] = 0
  const q = [here]
  for (let h = 0; h < q.length; h++) {
    const c = q[h]
    for (const [dx, dy] of DIRS) {
      const x = (c % W) + dx
      const y = Math.floor(c / W) + dy
      const m = y * W + x
      if (!inside(x, y) || solid(x, y) || dist[m] >= 0 || bombs.some(b => b.x === x && b.y === y)) continue
      dist[m] = dist[c] + 1
      first[m] = first[c] < 0 ? m : first[c]
      q.push(m)
    }
  }
  const steps = [here, ...DIRS.map(([dx, dy]) => (me.y + dy) * W + me.x + dx)].filter(c => q.includes(c))
  const safeStep = new Map<number, boolean>()
  for (const s of steps) safeStep.set(s, survives(s, bombs))
  const stepOf = (c: number) => (c === here ? here : first[c])

  let best = -1
  let bestScore = -Infinity
  for (const c of q) {
    if (!safeStep.get(stepOf(c))) continue
    const score = (bombValue(c) + (items.has(c) ? 1.5 : 0)) / (dist[c] + 2)
    if (score > bestScore) {
      bestScore = score
      best = c
    }
  }
  let out = ""
  if (best === here && me.bombs > 0 && bombValue(here) > 0) {
    const withBomb = [...bombs, { x: me.x, y: me.y, timer: 8, range: me.range }]
    const escape = steps.find(s => survives(s, withBomb))
    if (escape !== undefined) out = `BOMB ${escape % W} ${Math.floor(escape / W)}`
  }
  if (!out) {
    let step = best >= 0 && best !== here ? stepOf(best) : here
    if (!safeStep.get(step)) step = steps.find(s => safeStep.get(s)) ?? here
    // Standing on the best cell without a bomb: wait there if it is safe.
    out = `MOVE ${step % W} ${Math.floor(step / W)}`
  }
  console.log(out)
}
