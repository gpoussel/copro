// 🎮 CodinGame Puzzle - the-bridge-episode-2
// https://www.codingame.com/training/hard/the-bridge-episode-2

// The game is deterministic, so on the first turn we search the whole plan with a DFS
// over (x, speed, lanes of surviving bikes). We first try to keep every bike alive and
// lower the target down to V; failed states are memoized with the earliest turn at which
// they failed (reaching the same state later can only be worse).

const M = parseInt(readline())
const V = parseInt(readline())
const lanes: string[] = []
for (let i = 0; i < 4; i++) lanes.push(readline())
const length = lanes[0].length

const hole = (y: number, x: number): boolean => x < length && lanes[y][x] === "0"
// Is there a hole on lane y in the range [from, to]?
const holeIn = (y: number, from: number, to: number): boolean => {
  for (let x = from; x <= Math.min(to, length - 1); x++) if (lanes[y][x] === "0") return true
  return false
}

type Action = "SPEED" | "SLOW" | "JUMP" | "WAIT" | "UP" | "DOWN"
const ACTIONS: Action[] = ["SPEED", "WAIT", "JUMP", "UP", "DOWN", "SLOW"]
const MAX_TURNS = 50

// Apply an action: returns new speed, new x and surviving lanes, or null if not applicable
const apply = (x: number, s: number, ys: number[], a: Action): [number, number, number[]] | null => {
  let ns = s
  if (a === "SPEED") ns++
  if (a === "SLOW") ns--
  if (ns <= 0) return null
  let dy = 0
  if (a === "UP") dy = -1
  if (a === "DOWN") dy = 1
  if (dy !== 0 && ys.some(y => y + dy < 0 || y + dy > 3)) return null
  const nx = x + ns
  const survivors: number[] = []
  for (const y of ys) {
    let dead: boolean
    if (a === "JUMP") dead = hole(y, nx)
    else if (dy !== 0) dead = holeIn(y, x + 1, nx - 1) || holeIn(y + dy, x + 1, nx)
    else dead = holeIn(y, x + 1, nx)
    if (!dead) survivors.push(y + dy)
  }
  return [ns, nx, survivors]
}

const failedAt = new Map<string, number>()
const path: Action[] = []

const dfs = (x: number, s: number, ys: number[], turn: number, target: number): boolean => {
  if (x >= length) return true
  if (turn >= MAX_TURNS) return false
  const key = `${x},${s},${ys.join("")}`
  const f = failedAt.get(key)
  if (f !== undefined && f <= turn) return false
  for (const a of ACTIONS) {
    const r = apply(x, s, ys, a)
    if (r === null || r[2].length < target) continue
    path.push(a)
    if (dfs(r[1], r[0], r[2], turn + 1, target)) return true
    path.pop()
  }
  failedAt.set(key, turn)
  return false
}

let plan: Action[] | null = null
let step = 0
while (true) {
  const S = parseInt(readline())
  let x = 0
  const ys: number[] = []
  for (let i = 0; i < M; i++) {
    const [bx, by, active] = readline().split(" ").map(Number)
    if (active === 1) {
      x = bx
      ys.push(by)
    }
  }
  if (plan === null) {
    ys.sort((a, b) => a - b)
    for (let target = ys.length; target >= V; target--) {
      failedAt.clear()
      path.length = 0
      if (dfs(x, S, ys, 0, target)) break
    }
    plan = [...path]
  }
  console.log(step < plan.length ? plan[step++] : "WAIT")
}
