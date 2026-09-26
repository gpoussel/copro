// 🎮 CodinGame Puzzle - dont-panic-episode-2
// https://www.codingame.com/training/hard/don't-panic-episode-2

// Every clone follows the exact same trajectory, 3 turns behind the previous one.
// So we plan the whole route once with a layered BFS (Dijkstra with unit-ish costs)
// over states (floor, pos, dir, elevatorsBuilt, clonesSpent):
//  - move one step: 1 turn
//  - existing elevator: forced climb, 1 turn
//  - BLOCK (turn around): the next clone reaches the same spot 3 turns later, going the other way
//  - ELEVATOR: the next clone reaches the same spot 3 turns later then climbs (+1)
// Then, in the game loop, we fire the planned action whenever the leading clone
// reaches the matching (floor, pos, dir).

const [nbFloors, width, nbRounds, exitFloor, exitPos, nbTotalClones, nbAdditionalElevators, nbElevators] = readline()
  .split(" ")
  .map(Number)

const elevator: boolean[][] = Array.from({ length: nbFloors }, () => new Array<boolean>(width).fill(false))
for (let i = 0; i < nbElevators; i++) {
  const [f, p] = readline().split(" ").map(Number)
  elevator[f][p] = true
}

const E = nbAdditionalElevators + 1
const C = nbTotalClones
const encode = (f: number, p: number, d: number, e: number, c: number): number =>
  ((((f * width + p) * 2 + d) * E + e) * C + c) >>> 0
const total = nbFloors * width * 2 * E * C
const dist = new Int32Array(total).fill(-1)
const parent = new Int32Array(total).fill(-1)
// 0 = move/climb, 1 = BLOCK, 2 = ELEVATOR
const how = new Int8Array(total)

// Directions: 0 = LEFT, 1 = RIGHT
const step = (d: number): number => (d === 1 ? 1 : -1)
const decode = (s: number): [number, number, number, number, number] => {
  const c = s % C
  s = (s - c) / C
  const e = s % E
  s = (s - e) / E
  const d = s % 2
  s = (s - d) / 2
  const p = s % width
  const f = (s - p) / width
  return [f, p, d, e, c]
}

const plan = new Map<string, string>()

const solve = (startPos: number): void => {
  // buckets[t] = states reached at time t
  const buckets: number[][] = Array.from({ length: nbRounds + 10 }, () => [])
  const start = encode(0, startPos, 1, 0, 0)
  dist[start] = 0
  buckets[0].push(start)
  const relax = (from: number, to: number, t: number, kind: number): void => {
    if (t >= buckets.length) return
    if (dist[to] !== -1 && dist[to] <= t) return
    dist[to] = t
    parent[to] = from
    how[to] = kind
    buckets[t].push(to)
  }
  let goal = -1
  for (let t = 0; t < buckets.length && goal < 0; t++) {
    for (const s of buckets[t]) {
      if (dist[s] !== t) continue
      const [f, p, d, e, c] = decode(s)
      if (f === exitFloor && p === exitPos) {
        goal = s
        break
      }
      if (elevator[f][p]) {
        if (f + 1 < nbFloors) relax(s, encode(f + 1, p, d, e, c), t + 1, 0)
        continue
      }
      const np = p + step(d)
      if (np >= 0 && np < width) relax(s, encode(f, np, d, e, c), t + 1, 0)
      if (c + 1 < C) {
        relax(s, encode(f, p, 1 - d, e, c + 1), t + 3, 1)
        if (e + 1 < E && f < exitFloor) relax(s, encode(f + 1, p, d, e + 1, c + 1), t + 4, 2)
      }
    }
  }
  // Rebuild the path and record actions keyed by the leader's state
  for (let s = goal; s >= 0 && parent[s] >= 0; s = parent[s]) {
    if (how[s] === 0) continue
    const [f, p, d] = decode(parent[s])
    plan.set(`${f} ${p} ${d === 1 ? "RIGHT" : "LEFT"}`, how[s] === 1 ? "BLOCK" : "ELEVATOR")
  }
}

let planned = false
while (true) {
  const [fs, ps, dir] = readline().split(" ")
  const f = Number(fs)
  const p = Number(ps)
  if (dir === "NONE") {
    console.log("WAIT")
    continue
  }
  if (!planned) {
    planned = true
    solve(p)
  }
  const key = `${f} ${p} ${dir}`
  const action = plan.get(key)
  if (action !== undefined) {
    plan.delete(key)
    console.log(action)
  } else {
    console.log("WAIT")
  }
}
