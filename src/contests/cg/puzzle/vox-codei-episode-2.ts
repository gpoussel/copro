// 🎮 CodinGame Puzzle - vox-codei-episode-2
// https://www.codingame.com/training/expert/vox-codei-episode-2

// 1. Identification: every surveillance node seen on the first frame either
//    stays still or moves in one of the 4 directions, bouncing back on walls
//    and on the grid border. Each hypothesis gives a full trajectory; we keep
//    the ones matching every observed frame and search for an assignment whose
//    positions exactly cover each frame. We WAIT until that assignment is
//    unique.
// 2. Planning: a bomb dropped on turn s explodes on turn s + 3 and destroys
//    the nodes standing in its cross (range 3, stopped by passive nodes) at
//    that time. A DFS picks the alive node that is hardest to reach and tries
//    every (time, cell) that kills it, best kill counts first; failed
//    (alive set, bombs) states are memoized. Each complete plan is replayed
//    exactly (occupied cells, one bomb per turn, chain reactions) before use.
//    The search is time-boxed; on failure we WAIT and plan again next turn.

const [gridW, gridH] = readline().split(" ").map(Number)
const cellCount = gridW * gridH
const DIRS: number[][] = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

let isWall: boolean[] = []
const blastOf: number[][] = []
const frames: Set<number>[] = []
let startCells: number[] = []
let trajectories: number[][] = []
let horizon = 0
let plan: Map<number, number> | null = null
let turn = 0

const computeBlasts = (): void => {
  for (let c = 0; c < cellCount; c++) {
    const x = c % gridW
    const y = Math.floor(c / gridW)
    const cells = [c]
    for (const [dx, dy] of DIRS.slice(1)) {
      for (let k = 1; k <= 3; k++) {
        const nx = x + dx * k
        const ny = y + dy * k
        if (nx < 0 || ny < 0 || nx >= gridW || ny >= gridH || isWall[ny * gridW + nx]) break
        cells.push(ny * gridW + nx)
      }
    }
    blastOf.push(cells)
  }
}

const blocked = (x: number, y: number): boolean => x < 0 || y < 0 || x >= gridW || y >= gridH || isWall[y * gridW + x]

// Positions of a node starting on cell `start` with direction `dir`, times 0..len-1
const trajectory = (start: number, dir: number, len: number): number[] => {
  let x = start % gridW
  let y = Math.floor(start / gridW)
  let [dx, dy] = DIRS[dir]
  const res = [start]
  for (let t = 1; t < len; t++) {
    if (dx || dy) {
      if (blocked(x + dx, y + dy)) {
        dx = -dx
        dy = -dy
      }
      if (!blocked(x + dx, y + dy)) {
        x += dx
        y += dy
      }
    }
    res.push(y * gridW + x)
  }
  return res
}

// Returns the unique trajectory assignment explaining all frames, or null
const identify = (): number[][] | null => {
  const options: number[][][] = startCells.map(start => {
    const seen = new Set<string>()
    const res: number[][] = []
    for (let d = 0; d < 5; d++) {
      const tr = trajectory(start, d, horizon)
      const key = tr.join(",")
      if (seen.has(key)) continue
      seen.add(key)
      if (frames.every((f, t) => f.has(tr[t]))) res.push(tr)
    }
    return res
  })
  const order = [...options.keys()].sort((a, b) => options[a].length - options[b].length)
  const chosen: number[][] = new Array<number[]>(startCells.length)
  const found: number[][][] = []
  const counts: Map<number, number>[] = frames.map(() => new Map<number, number>())
  const dfs = (i: number): void => {
    if (found.length > 1) return
    if (i === order.length) {
      if (counts.every((m, t) => m.size === frames[t].size)) found.push([...chosen])
      return
    }
    const n = order[i]
    for (const tr of options[n]) {
      chosen[n] = tr
      counts.forEach((m, t) => m.set(tr[t], (m.get(tr[t]) ?? 0) + 1))
      dfs(i + 1)
      counts.forEach((m, t) => {
        const v = (m.get(tr[t]) as number) - 1
        if (v) m.set(tr[t], v)
        else m.delete(tr[t])
      })
    }
  }
  dfs(0)
  if (found.length === 1 || (found.length > 1 && frames.length >= 8)) return found[0]
  return null
}

// Exact replay of a plan (placement time -> cell) from time t0 to lastTime
const replay = (bombs: Map<number, number>, t0: number, lastTime: number): boolean => {
  const nodeCount = trajectories.length
  const alive = new Array<boolean>(nodeCount).fill(true)
  let left = nodeCount
  const pending = new Map<number, number>() // cell -> explosion time
  for (let t = t0; t <= lastTime; t++) {
    const exploding = [...pending].filter(([, e]) => e === t).map(([c]) => c)
    const hit = new Set<number>()
    while (exploding.length) {
      const c = exploding.pop() as number
      pending.delete(c)
      for (const b of blastOf[c]) {
        hit.add(b)
        if (pending.has(b)) {
          pending.delete(b)
          exploding.push(b)
        }
      }
    }
    for (let n = 0; n < nodeCount; n++) {
      if (alive[n] && hit.has(trajectories[n][t])) {
        alive[n] = false
        left--
      }
    }
    if (!left) return true
    const c = bombs.get(t)
    if (c === undefined) continue
    if (pending.has(c)) return false
    for (let n = 0; n < nodeCount; n++) if (alive[n] && trajectories[n][t] === c) return false
    pending.set(c, t + 3)
  }
  return false
}

const makePlan = (t0: number, bombs: number, lastTime: number): Map<number, number> | null => {
  const nodeCount = trajectories.length
  // occupancy by any node (conservative: a bomb cell must be free at drop time)
  const occupied = (c: number, t: number): boolean => trajectories.some(tr => tr[t] === c)
  const alive = new Array<boolean>(nodeCount).fill(true)
  const planned = new Map<number, number>()
  const failed = new Set<string>()
  // static difficulty: number of (time, cell) pairs able to kill each node
  const reach = trajectories.map(tr => {
    let k = 0
    for (let e = t0 + 3; e <= lastTime; e++) k += blastOf[tr[e]].length
    return k
  })
  const byDifficulty = [...Array(nodeCount).keys()].sort((a, b) => reach[a] - reach[b])
  const deadline = Date.now() + 70
  let steps = 0

  const dfs = (bombsLeft: number, aliveCount: number): boolean => {
    if (!aliveCount) return replay(planned, t0, lastTime)
    if (!bombsLeft || (++steps % 256 === 0 && Date.now() > deadline)) return false
    const key = alive.map(a => (a ? 1 : 0)).join("") + bombsLeft
    if (failed.has(key)) return false
    const target = byDifficulty.find(n => alive[n]) as number
    const cands: { s: number; c: number; kills: number[] }[] = []
    const perKey = new Map<string, number>()
    for (let e = t0 + 3; e <= lastTime; e++) {
      const s = e - 3
      if (planned.has(s)) continue
      for (const c of blastOf[trajectories[target][e]]) {
        if (occupied(c, s)) continue
        const cells = new Set(blastOf[c])
        const kills: number[] = []
        for (let n = 0; n < nodeCount; n++) if (alive[n] && cells.has(trajectories[n][e])) kills.push(n)
        const k = kills.join(",")
        const seen = perKey.get(k) ?? 0
        if (seen >= 2) continue
        perKey.set(k, seen + 1)
        cands.push({ s, c, kills })
      }
    }
    cands.sort((a, b) => b.kills.length - a.kills.length)
    for (const { s, c, kills } of cands) {
      planned.set(s, c)
      for (const n of kills) alive[n] = false
      const ok = dfs(bombsLeft - 1, aliveCount - kills.length)
      for (const n of kills) alive[n] = true
      if (ok) return true
      planned.delete(s)
    }
    failed.add(key)
    return false
  }
  return dfs(bombs, nodeCount) ? new Map(planned) : null
}

while (true) {
  const [rounds, bombs] = readline().split(" ").map(Number)
  const rows: string[] = []
  for (let i = 0; i < gridH; i++) rows.push(readline())
  if (turn === 0) {
    isWall = rows
      .join("")
      .split("")
      .map(ch => ch === "#")
    computeBlasts()
    horizon = rounds + 5
    startCells = []
    rows
      .join("")
      .split("")
      .forEach((ch, c) => {
        if (ch === "@") startCells.push(c)
      })
  }
  const frame = new Set<number>()
  rows
    .join("")
    .split("")
    .forEach((ch, c) => {
      if (ch === "@") frame.add(c)
    })
  frames.push(frame)
  if (!plan && turn > 0) {
    const found = identify()
    if (found) {
      trajectories = found
      plan = makePlan(turn, bombs, turn + rounds - 1)
    }
  }
  const cell = plan ? plan.get(turn) : undefined
  console.log(cell === undefined ? "WAIT" : `${cell % gridW} ${Math.floor(cell / gridW)}`)
  turn++
}
