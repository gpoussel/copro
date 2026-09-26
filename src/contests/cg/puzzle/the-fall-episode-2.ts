// 🎮 CodinGame Puzzle - the-fall-episode-2
// https://www.codingame.com/training/hard/the-fall-episode-2

// Each turn, a DFS finds a path for Indy to the exit where the rooms along the
// path get their required rotations in time (one rotation per turn, done
// before Indy enters the room). Spare turns are used to destroy rocks that
// would hit Indy, by rotating a room on their trajectory.

// Entry sides: 0 = TOP, 1 = LEFT, 2 = RIGHT
// Moves: 0 = down, 1 = to the left, 2 = to the right, -1 = blocked
const EXITS: number[][] = [
  [-1, -1, -1],
  [0, 0, 0],
  [-1, 2, 1],
  [0, -1, -1],
  [1, -1, 0],
  [2, 0, -1],
  [-1, 2, 1],
  [0, -1, 0],
  [-1, 0, 0],
  [0, 0, -1],
  [1, -1, -1],
  [2, -1, -1],
  [-1, -1, 0],
  [-1, 0, -1],
]
const ROT_RIGHT = [0, 1, 3, 2, 5, 4, 7, 8, 9, 6, 11, 12, 13, 10]
const ROT_LEFT: number[] = []
ROT_RIGHT.forEach((to, from) => (ROT_LEFT[to] = from))
const SIDES = ["TOP", "LEFT", "RIGHT"]

const [gridW, gridH] = readline().split(" ").map(Number)
const tiles: number[] = []
const locked: boolean[] = []
for (let y = 0; y < gridH; y++) {
  const row = readline().trim().split(/\s+/).map(Number)
  for (let x = 0; x < gridW; x++) {
    tiles.push(Math.abs(row[x]))
    locked.push(row[x] < 0)
  }
}
const exitX = Number(readline())
const exitCell = (gridH - 1) * gridW + exitX

// Next (cell, entry) after leaving `cell` with move `mv`, or null if out of grid
function step(cell: number, mv: number): [number, number] | null {
  const x = cell % gridW
  const y = (cell - x) / gridW
  if (mv === 0) return y + 1 < gridH ? [cell + gridW, 0] : null
  if (mv === 1) return x > 0 ? [cell - 1, 2] : null
  if (mv === 2) return x + 1 < gridW ? [cell + 1, 1] : null
  return null
}

// Orientation options of a room: [type, rotations needed, first command]
function options(cell: number): [number, number, string][] {
  const t = tiles[cell]
  if (locked[cell]) return [[t, 0, ""]]
  const r = ROT_RIGHT[t]
  const l = ROT_LEFT[t]
  const res: [number, number, string][] = [[t, 0, ""]]
  if (r !== t) res.push([r, 1, "RIGHT"])
  if (l !== t && l !== r) res.push([l, 1, "LEFT"])
  const rr = ROT_RIGHT[r]
  if (rr !== t && rr !== r && rr !== l) res.push([rr, 2, "RIGHT"])
  return res
}

interface PathStep {
  cell: number
  type: number
  rot: number
  cmd: string
}

// DFS from Indy's room; memo of the best surplus that already failed
function findPath(start: number, entry: number, blocked: Set<number>): PathStep[] | null {
  const failed = new Map<number, number>()
  const path: PathStep[] = [{ cell: start, type: tiles[start], rot: 0, cmd: "" }]
  const dfs = (cell: number, ent: number, type: number, surplus: number): boolean => {
    const nxt = step(cell, EXITS[type][ent])
    if (!nxt) return false
    const [nc, ne] = nxt
    if (nc === exitCell) {
      path.push({ cell: nc, type: tiles[nc], rot: 0, cmd: "" })
      return true
    }
    const key = nc * 3 + ne
    const f = failed.get(key)
    if (f !== undefined && f >= surplus) return false
    for (const [t, r, cmd] of options(nc)) {
      if (r > 0 && blocked.has(nc)) continue
      const s = surplus + 1 - r
      if (s < 0 || EXITS[t][ne] < 0) continue
      path.push({ cell: nc, type: t, rot: r, cmd })
      if (dfs(nc, ne, t, s)) return true
      path.pop()
    }
    failed.set(key, Math.max(f ?? -1, surplus))
    return false
  }
  return dfs(start, entry, tiles[start], 0) ? path : null
}

// Trajectory of a rock (cells per time step) over the given tile layout
function rockTrail(cell: number, entry: number, layout: number[], maxLen: number): number[] {
  const trail = [cell]
  let c = cell
  let e = entry
  while (trail.length <= maxLen) {
    const nxt = step(c, EXITS[layout[c]][e])
    if (!nxt) break
    ;[c, e] = nxt
    trail.push(c)
  }
  return trail
}

function hitIndex(trail: number[], indy: number[]): number {
  for (let i = 1; i < Math.min(trail.length, indy.length); i++) {
    if (trail[i] === indy[i]) return i
    if (trail[i] === indy[i - 1] && trail[i - 1] === indy[i]) return i
  }
  return -1
}

while (true) {
  const [xs, ys, ps] = readline().split(" ")
  const indyCell = Number(ys) * gridW + Number(xs)
  const indyEntry = SIDES.indexOf(ps)
  const rockCount = Number(readline())
  const rocks: [number, number][] = []
  for (let i = 0; i < rockCount; i++) {
    const [rx, ry, rp] = readline().split(" ")
    rocks.push([Number(ry) * gridW + Number(rx), SIDES.indexOf(rp)])
  }
  const rockCells = new Set(rocks.map(r => r[0]))

  const path = findPath(indyCell, indyEntry, rockCells)
  if (!path) {
    console.log("WAIT")
    continue
  }
  const onPath = new Set(path.map(p => p.cell))
  // Slack: can we spend this turn elsewhere without breaking the schedule?
  let cum = 0
  let slack = true
  for (let k = 1; k < path.length; k++) {
    cum += path[k].rot
    if (cum > k - 1) slack = false
  }
  const pending = path.find((p, k) => k > 0 && p.rot > 0)

  // Look for rocks that would collide with Indy, and a way to stop them
  let rockCmd = ""
  const layout = tiles.slice()
  for (const p of path) layout[p.cell] = p.type
  const indyTrail = path.map(p => p.cell)
  let bestHit = Infinity
  for (const [rc, re] of rocks) {
    const trail = rockTrail(rc, re, layout, indyTrail.length + 1)
    const hit = hitIndex(trail, indyTrail)
    if (hit < 0 || hit >= bestHit) continue
    for (let j = 1; j <= hit && j < trail.length; j++) {
      const c = trail[j]
      if (locked[c] || onPath.has(c) || rockCells.has(c) || c === exitCell) continue
      let found = ""
      for (const [nt, name] of [
        [ROT_RIGHT[tiles[c]], "RIGHT"],
        [ROT_LEFT[tiles[c]], "LEFT"],
      ] as [number, string][]) {
        const alt = layout.slice()
        alt[c] = nt
        const t2 = rockTrail(rc, re, alt, indyTrail.length + 1)
        if (hitIndex(t2, indyTrail) < 0) {
          found = name
          break
        }
      }
      if (found) {
        bestHit = hit
        rockCmd = `${c % gridW} ${Math.floor(c / gridW)} ${found}`
        break
      }
    }
  }

  const doRotate = (p: PathStep): void => {
    tiles[p.cell] = p.cmd === "RIGHT" ? ROT_RIGHT[tiles[p.cell]] : ROT_LEFT[tiles[p.cell]]
    console.log(`${p.cell % gridW} ${Math.floor(p.cell / gridW)} ${p.cmd}`)
  }
  if (rockCmd && (slack || !pending)) {
    const [cx, cy, dir] = rockCmd.split(" ")
    const c = Number(cy) * gridW + Number(cx)
    tiles[c] = dir === "RIGHT" ? ROT_RIGHT[tiles[c]] : ROT_LEFT[tiles[c]]
    console.log(rockCmd)
  } else if (pending) {
    doRotate(pending)
  } else {
    console.log("WAIT")
  }
}
