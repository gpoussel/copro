// 🎮 CodinGame Puzzle - can-you-save-the-forest---episode-2
// https://www.codingame.com/training/hard/can-you-save-the-forest---episode-2

// Each turn the joint action of the trucks is chosen by coordinate descent:
// every truck in turn tries all its legal actions (others fixed) and keeps the
// one minimising the burnt forest of a simulated rollout, where the future
// turns are played by a fast greedy policy (fight the hottest adjacent fire,
// otherwise drive towards a fire paired with the truck by travel distance).

// Cell encoding: -1 water, 0 empty, 1 forest, 2 burnt, 11..13 fire level 1..3
const SIZE = 10
const WATER = -1
const EMPTY = 0
const FOREST = 1
const BURNT = 2
const FIRE = 10
const MOVES: [string, number, number][] = [
  ["N", 0, -1],
  ["S", 0, 1],
  ["E", 1, 0],
  ["W", -1, 0],
]
const FIGHTS: [string, number, number][] = [...MOVES, ["NE", 1, -1], ["SE", 1, 1], ["NW", -1, -1], ["SW", -1, 1]]
const HORIZON = 40

// Action: -1 wait, 0..3 move, 4..11 fight (index into FIGHTS + 4)
type Action = number

const [truckCount] = readline().split(" ").map(Number)

function cellAt(x: number, y: number): number {
  return x < 0 || y < 0 || x >= SIZE || y >= SIZE ? -1 : y * SIZE + x
}

function hasFire(grid: Int8Array): boolean {
  for (let i = 0; i < grid.length; i++) if (grid[i] > FIRE) return true
  return false
}

// Plays one turn in place (grid and trucks are updated)
function play(grid: Int8Array, trucks: number[], actions: Action[]): void {
  for (let t = 0; t < trucks.length; t++) {
    const a = actions[t]
    if (a < 0 || a >= 4) continue
    const [, dx, dy] = MOVES[a]
    const c = cellAt((trucks[t] % SIZE) + dx, Math.floor(trucks[t] / SIZE) + dy)
    if (c < 0 || grid[c] === WATER || grid[c] > FIRE || trucks.includes(c)) continue
    trucks[t] = c
  }
  for (let t = 0; t < trucks.length; t++) {
    const a = actions[t]
    if (a < 4) continue
    const [, dx, dy] = FIGHTS[a - 4]
    const c = cellAt((trucks[t] % SIZE) + dx, Math.floor(trucks[t] / SIZE) + dy)
    if (c >= 0 && grid[c] > FIRE) grid[c] = FOREST
  }
  const burning: number[] = []
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === FIRE + 3) {
      grid[i] = BURNT
      burning.push(i)
    } else if (grid[i] > FIRE) grid[i]++
  }
  for (const cell of burning) {
    const x = cell % SIZE
    const y = Math.floor(cell / SIZE)
    for (const [, dx, dy] of MOVES) {
      const c = cellAt(x + dx, y + dy)
      if (c >= 0 && grid[c] === FOREST && !trucks.includes(c)) grid[c] = FIRE + 1
    }
  }
}

// Forest neighbours of a cell (fire spread potential)
function forestAround(grid: Int8Array, cell: number): number {
  let n = 0
  for (const [, dx, dy] of MOVES) {
    const c = cellAt((cell % SIZE) + dx, Math.floor(cell / SIZE) + dy)
    if (c >= 0 && grid[c] === FOREST) n++
  }
  return n
}

// Legal actions of one truck
function legalActions(grid: Int8Array, trucks: number[], t: number): Action[] {
  const res: Action[] = [-1]
  const x = trucks[t] % SIZE
  const y = Math.floor(trucks[t] / SIZE)
  MOVES.forEach(([, dx, dy], i) => {
    const c = cellAt(x + dx, y + dy)
    if (c >= 0 && grid[c] !== WATER && grid[c] <= FIRE && !trucks.includes(c)) res.push(i)
  })
  FIGHTS.forEach(([, dx, dy], i) => {
    const c = cellAt(x + dx, y + dy)
    if (c >= 0 && grid[c] > FIRE) res.push(i + 4)
  })
  return res
}

// BFS distances over drivable tiles from the given sources
function bfs(grid: Int8Array, sources: number[], out: Int16Array): void {
  out.fill(-1)
  let head = 0
  let tail = 0
  for (const s of sources) {
    if (out[s] < 0) {
      out[s] = 0
      queue[tail++] = s
    }
  }
  while (head < tail) {
    const cur = queue[head++]
    const x = cur % SIZE
    const y = Math.floor(cur / SIZE)
    for (const [, dx, dy] of MOVES) {
      const c = cellAt(x + dx, y + dy)
      if (c >= 0 && out[c] < 0 && grid[c] !== WATER && grid[c] <= FIRE) {
        out[c] = out[cur] + 1
        queue[tail++] = c
      }
    }
  }
}

// Drivable tiles from which a fire can be fought
function fightSpots(grid: Int8Array, fire: number): number[] {
  const res: number[] = []
  for (const [, dx, dy] of FIGHTS) {
    const c = cellAt((fire % SIZE) + dx, Math.floor(fire / SIZE) + dy)
    if (c >= 0 && grid[c] !== WATER && grid[c] <= FIRE) res.push(c)
  }
  return res
}

// Fast default policy: fight the hottest adjacent fire, otherwise trucks and
// fires are paired greedily by travel distance and trucks drive to their fire
const queue = new Int16Array(SIZE * SIZE)
const truckDist: Int16Array[] = []
const targetDist = new Int16Array(SIZE * SIZE)
function greedy(grid: Int8Array, trucks: number[]): Action[] {
  const actions: Action[] = trucks.map(() => -1)
  const fought = new Set<number>()
  const idle: number[] = []
  for (let t = 0; t < trucks.length; t++) {
    const x = trucks[t] % SIZE
    const y = Math.floor(trucks[t] / SIZE)
    let bestScore = -1
    FIGHTS.forEach(([, dx, dy], i) => {
      const c = cellAt(x + dx, y + dy)
      if (c < 0 || grid[c] <= FIRE || fought.has(c)) return
      const score = grid[c] * 10 + forestAround(grid, c)
      if (score > bestScore) {
        bestScore = score
        actions[t] = i + 4
      }
    })
    if (actions[t] >= 4) {
      const [, dx, dy] = FIGHTS[actions[t] - 4]
      fought.add(cellAt(x + dx, y + dy))
    } else idle.push(t)
  }
  if (idle.length === 0) return actions
  const fires: number[] = []
  for (let i = 0; i < grid.length; i++) if (grid[i] > FIRE && !fought.has(i)) fires.push(i)
  if (fires.length === 0) return actions
  const pairs: [number, number, number][] = []
  for (const t of idle) {
    if (!truckDist[t]) truckDist[t] = new Int16Array(SIZE * SIZE)
    bfs(grid, [trucks[t]], truckDist[t])
    for (const f of fires) {
      let d = Infinity
      for (const s of fightSpots(grid, f)) if (truckDist[t][s] >= 0) d = Math.min(d, truckDist[t][s])
      if (d < Infinity) pairs.push([d * 4 - grid[f] + FIRE, t, f])
    }
  }
  pairs.sort((p, q) => p[0] - q[0])
  const target = new Map<number, number>()
  const taken = new Set<number>()
  for (const [, t, f] of pairs) {
    if (target.has(t) || taken.has(f)) continue
    target.set(t, f)
    taken.add(f)
  }
  for (const [, t, f] of pairs) if (!target.has(t)) target.set(t, f)
  const claimed = new Set<number>()
  for (const [t, f] of target) {
    bfs(grid, fightSpots(grid, f), targetDist)
    const here = targetDist[trucks[t]]
    if (here <= 0) continue
    const x = trucks[t] % SIZE
    const y = Math.floor(trucks[t] / SIZE)
    MOVES.forEach(([, dx, dy], i) => {
      const c = cellAt(x + dx, y + dy)
      if (
        actions[t] < 0 &&
        c >= 0 &&
        targetDist[c] >= 0 &&
        targetDist[c] < here &&
        !trucks.includes(c) &&
        !claimed.has(c)
      ) {
        actions[t] = i
        claimed.add(c)
      }
    })
  }
  return actions
}

function burntCount(grid: Int8Array): number {
  let n = 0
  for (let i = 0; i < grid.length; i++) if (grid[i] === BURNT) n++
  return n
}

// Score of a joint action: burnt tiles after a greedy rollout (lower is better)
function evaluate(grid: Int8Array, trucks: number[], actions: Action[]): number {
  const g = grid.slice()
  const tr = trucks.slice()
  play(g, tr, actions)
  let turns = 0
  while (turns < HORIZON && hasFire(g)) {
    play(g, tr, greedy(g, tr))
    turns++
  }
  let fires = 0
  for (let i = 0; i < g.length; i++) if (g[i] > FIRE) fires++
  return burntCount(g) * 1000 + fires * 100 + turns
}

function encode(ch: string): number {
  if (ch === "~") return WATER
  if (ch === "^" || ch === "X") return FOREST
  if (ch === "*") return BURNT
  if (ch >= "1" && ch <= "3") return FIRE + Number(ch)
  return EMPTY
}

// Two trucks must never try to enter the same tile
function consistent(trucks: number[], actions: Action[]): boolean {
  const targets = new Set<number>()
  for (let t = 0; t < trucks.length; t++) {
    const a = actions[t]
    if (a < 0 || a >= 4) continue
    const c = cellAt((trucks[t] % SIZE) + MOVES[a][1], Math.floor(trucks[t] / SIZE) + MOVES[a][2])
    if (targets.has(c)) return false
    targets.add(c)
  }
  return true
}

function describe(a: Action): string {
  if (a < 0) return "WAIT"
  if (a < 4) return `MOVE ${MOVES[a][0]}`
  return `FIGHT ${FIGHTS[a - 4][0]}`
}

while (true) {
  const forest = new Int8Array(SIZE * SIZE)
  for (let y = 0; y < SIZE; y++) {
    const row = readline()
    for (let x = 0; x < SIZE; x++) forest[y * SIZE + x] = encode(row[x])
  }
  const trucks: number[] = []
  for (let t = 0; t < truckCount; t++) {
    const [x, y] = readline().split(" ").map(Number)
    trucks.push(y * SIZE + x)
  }
  const start = Date.now()
  const actions = greedy(forest, trucks)
  let bestScore = evaluate(forest, trucks, actions)
  let improved = true
  while (improved && Date.now() - start < 700) {
    improved = false
    for (let t = 0; t < truckCount; t++) {
      for (const a of legalActions(forest, trucks, t)) {
        if (a === actions[t]) continue
        const trial = actions.slice()
        trial[t] = a
        if (!consistent(trucks, trial)) continue
        const score = evaluate(forest, trucks, trial)
        if (score < bestScore) {
          bestScore = score
          actions[t] = a
          improved = true
        }
      }
    }
  }
  console.log(actions.map(describe).join("\n"))
}
