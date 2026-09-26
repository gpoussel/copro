// 🎮 CodinGame Puzzle - sokoban
// https://www.codingame.com/training/hard/sokoban

// Whole solution is computed on the first turn with a BFS over push states:
// a state is the sorted box positions plus the normalized (minimal reachable)
// pusher cell. Boxes are never pushed onto "dead" cells (cells from which a box
// can never be pulled back to a target). Then moves are replayed turn by turn.

const [W, H, boxCount] = readline().split(" ").map(Number)
const N = W * H
const wall: boolean[] = new Array(N).fill(true)
const target: boolean[] = new Array(N).fill(false)
for (let y = 0; y < H; y++) {
  const line = readline()
  for (let x = 0; x < W; x++) {
    const c = line[x] ?? "#"
    wall[y * W + x] = c === "#"
    target[y * W + x] = c === "*"
  }
}

const DIRS = ["U", "D", "R", "L"]
const DX = [0, 0, 1, -1]
const DY = [-1, 1, 0, 0]
// neighbour of cell c in direction d, or -1 when off the map
const step = (c: number, d: number): number => {
  const x = (c % W) + DX[d]
  const y = Math.floor(c / W) + DY[d]
  return x < 0 || y < 0 || x >= W || y >= H ? -1 : y * W + x
}
const free = (c: number): boolean => c >= 0 && !wall[c]

// Live cells: reachable from a target by pulling a box (box at c, pulled to c-d, puller at c-2d)
const live: boolean[] = new Array(N).fill(false)
{
  const queue: number[] = []
  for (let c = 0; c < N; c++) {
    if (target[c] && !wall[c]) {
      live[c] = true
      queue.push(c)
    }
  }
  while (queue.length) {
    const c = queue.pop()!
    for (let d = 0; d < 4; d++) {
      const n1 = step(c, d)
      if (!free(n1) || live[n1]) continue
      const n2 = step(n1, d)
      if (!free(n2)) continue
      live[n1] = true
      queue.push(n1)
    }
  }
}

const readState = (): [number, number[]] => {
  const [px, py] = readline().split(" ").map(Number)
  const boxes: number[] = []
  for (let i = 0; i < boxCount; i++) {
    const [bx, by] = readline().split(" ").map(Number)
    boxes.push(by * W + bx)
  }
  return [py * W + px, boxes]
}

const occupied = new Uint8Array(N)
const seen = new Int32Array(N)
let stamp = 0
const bfsQueue = new Int32Array(N)
const reach = new Uint8Array(N)

// Flood-fill the pusher area given current `occupied` boxes; returns min reachable cell.
// Cells with seen[c] === stamp are reachable afterwards.
const flood = (start: number): number => {
  stamp++
  let head = 0
  let tail = 0
  bfsQueue[tail++] = start
  seen[start] = stamp
  let min = start
  while (head < tail) {
    const c = bfsQueue[head++]
    if (c < min) min = c
    for (let d = 0; d < 4; d++) {
      const n = step(c, d)
      if (free(n) && !occupied[n] && seen[n] !== stamp) {
        seen[n] = stamp
        bfsQueue[tail++] = n
      }
    }
  }
  return min
}

const encode = (pusher: number, boxes: number[]): number => {
  let key = 0
  for (let i = boxes.length - 1; i >= 0; i--) key = key * 128 + boxes[i]
  return key * 128 + pusher
}
const decodeBoxes = (key: number): number[] => {
  const boxes: number[] = []
  let k = Math.floor(key / 128)
  for (let i = 0; i < boxCount; i++) {
    boxes.push(k % 128)
    k = Math.floor(k / 128)
  }
  return boxes
}

// Shortest walk for the pusher from `from` to `to`, avoiding the boxes
const walk = (from: number, to: number, boxes: number[]): string => {
  occupied.fill(0)
  for (const b of boxes) occupied[b] = 1
  const prev = new Int32Array(N).fill(-2)
  const prevDir = new Int32Array(N)
  prev[from] = -1
  const queue = [from]
  for (let qi = 0; qi < queue.length; qi++) {
    const c = queue[qi]
    if (c === to) break
    for (let d = 0; d < 4; d++) {
      const n = step(c, d)
      if (free(n) && !occupied[n] && prev[n] === -2) {
        prev[n] = c
        prevDir[n] = d
        queue.push(n)
      }
    }
  }
  let path = ""
  for (let c = to; c !== from; c = prev[c]) path = DIRS[prevDir[c]] + path
  return path
}

const solve = (pusher: number, startBoxes: number[]): string => {
  const keys: number[] = []
  const parent: number[] = []
  const pushFrom: number[] = []
  const pushDir: number[] = []
  const visited = new Set<number>()

  const sorted = [...startBoxes].sort((a, b) => a - b)
  occupied.fill(0)
  for (const b of sorted) occupied[b] = 1
  const startKey = encode(flood(pusher), sorted)
  keys.push(startKey)
  parent.push(-1)
  pushFrom.push(-1)
  pushDir.push(-1)
  visited.add(startKey)

  let goal = -1
  if (sorted.every(b => target[b])) goal = 0
  for (let qi = 0; qi < keys.length && goal < 0; qi++) {
    const key = keys[qi]
    const boxes = decodeBoxes(key)
    occupied.fill(0)
    for (const b of boxes) occupied[b] = 1
    flood(key % 128)
    for (let c = 0; c < N; c++) reach[c] = seen[c] === stamp ? 1 : 0
    for (let bi = 0; bi < boxes.length && goal < 0; bi++) {
      const b = boxes[bi]
      for (let d = 0; d < 4; d++) {
        const dest = step(b, d)
        if (!free(dest) || occupied[dest] || !live[dest]) continue
        const behind = step(b, d ^ 1)
        if (behind < 0 || !reach[behind]) continue
        // apply the push, normalize the pusher position, then undo
        const next = boxes.slice()
        next[bi] = dest
        next.sort((a, c) => a - c)
        occupied[b] = 0
        occupied[dest] = 1
        const nk = encode(flood(b), next)
        occupied[dest] = 0
        occupied[b] = 1
        if (visited.has(nk)) continue
        visited.add(nk)
        keys.push(nk)
        parent.push(qi)
        pushFrom.push(b)
        pushDir.push(d)
        if (next.every(c => target[c])) {
          goal = keys.length - 1
          break
        }
      }
    }
  }

  // reconstruct the list of pushes, then expand into walks
  const pushes: [number, number][] = []
  for (let s = goal; s > 0; s = parent[s]) pushes.push([pushFrom[s], pushDir[s]])
  pushes.reverse()
  let moves = ""
  let pos = pusher
  const boxes = startBoxes.slice()
  for (const [b, d] of pushes) {
    const behind = step(b, d ^ 1)
    moves += walk(pos, behind, boxes) + DIRS[d]
    boxes[boxes.indexOf(b)] = step(b, d)
    pos = b
  }
  return moves
}

const plan = solve(...readState())
for (let turn = 0; ; turn++) {
  if (turn > 0) readState()
  console.log(plan[turn] ?? "U")
}
