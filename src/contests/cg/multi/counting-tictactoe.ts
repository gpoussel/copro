// 🎮 CodinGame Multiplayer - counting-tictactoe
// https://www.codingame.com/multiplayer/bot-programming/counting-tictactoe
// Referee: https://github.com/RezaSi/counting-tic-tac-toe
//
// 10x10; when the board is full, the player with more 3-in-a-row windows
// wins; two matches per game with colours swapped. Occupied cells = cells
// missing from the valid-move list (ours are the ones we played); a new match
// starts when the valid-move count goes back up. MCTS with random-fill
// playouts, reward = 0.5 + 0.5·tanh(window difference / 4).

const TURN_MS = 80
const UCT_C = 0.5
const MAX_NODES = 2_000_000
const N = 10

// Every 3-cell window (rows, columns, both diagonals).
const windows: number[][] = []
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ]) {
      const r2 = r + 2 * dr
      const c2 = c + 2 * dc
      if (r2 < 0 || r2 >= N || c2 < 0 || c2 >= N) continue
      windows.push([r * N + c, (r + dr) * N + c + dc, r2 * N + c2])
    }
  }
}
function score(b: Uint8Array): number {
  let s = 0
  for (const [a, x, y] of windows) {
    const v = b[a]
    if (v && v === b[x] && v === b[y]) s += v === 1 ? 1 : -1
  }
  return s
}

let seed = 0x9e3779b1
const random = (n: number) => {
  seed ^= seed << 13
  seed ^= seed >>> 17
  seed ^= seed << 5
  return ((seed >>> 0) % n) | 0
}

const nodeMove = new Uint8Array(MAX_NODES)
const nodeFirstChild = new Int32Array(MAX_NODES)
const nodeChildCount = new Uint8Array(MAX_NODES)
const nodeVisits = new Float64Array(MAX_NODES)
const nodeScore = new Float64Array(MAX_NODES)
let nodeCount = 0
const newNode = (m: number) => {
  const i = nodeCount++
  nodeMove[i] = m
  nodeFirstChild[i] = -1
  nodeChildCount[i] = 0
  nodeVisits[i] = 0
  nodeScore[i] = 0
  return i
}

const sim = new Uint8Array(N * N)
const empties = new Uint8Array(N * N)
const path = new Int32Array(128)

// board: 1 us, 2 them, 0 empty; we move now.
function search(board: Uint8Array, deadline: number): number {
  nodeCount = 0
  const root = newNode(0)
  let iterations = 0
  while (nodeCount < MAX_NODES - 128) {
    if ((iterations & 15) === 0 && Date.now() >= deadline) break
    iterations++
    sim.set(board)
    let p = 1
    let node = root
    let depth = 0
    path[depth++] = node
    while (nodeFirstChild[node] >= 0 && nodeChildCount[node] > 0) {
      const first = nodeFirstChild[node]
      const end = first + nodeChildCount[node]
      const logN = Math.log(nodeVisits[node])
      let best = first
      let bestValue = -Infinity
      for (let ch = first; ch < end; ch++) {
        const v = nodeVisits[ch]
        if (v === 0) {
          best = ch
          break
        }
        const value = nodeScore[ch] / v + UCT_C * Math.sqrt(logN / v)
        if (value > bestValue) {
          bestValue = value
          best = ch
        }
      }
      node = best
      sim[nodeMove[node]] = p
      p = 3 - p
      path[depth++] = node
    }
    let n = 0
    for (let i = 0; i < N * N; i++) if (!sim[i]) empties[n++] = i
    if (n > 0 && nodeFirstChild[node] < 0) {
      nodeFirstChild[node] = nodeCount
      nodeChildCount[node] = n
      for (let k = 0; k < n; k++) newNode(empties[k])
      const k = random(n)
      node = nodeFirstChild[node] + k
      sim[nodeMove[node]] = p
      p = 3 - p
      path[depth++] = node
      empties[k] = empties[--n]
    }
    for (let k = n - 1; k >= 0; k--) {
      const j = random(k + 1)
      const cell = empties[j]
      empties[j] = empties[k]
      sim[cell] = p
      p = 3 - p
    }
    const reward = 0.5 + 0.5 * Math.tanh(score(sim) / 4) // for us
    for (let d = depth - 1; d >= 1; d--) {
      nodeVisits[path[d]]++
      nodeScore[path[d]] += d % 2 === 1 ? reward : 1 - reward
    }
    nodeVisits[root]++
  }
  const first = nodeFirstChild[root]
  let best = first
  for (let ch = first; ch < first + nodeChildCount[root]; ch++) if (nodeVisits[ch] > nodeVisits[best]) best = ch
  console.error(`it=${iterations}`)
  return nodeMove[best]
}

const board = new Uint8Array(N * N)
const mine = new Set<number>()
let previousCount = 1000
while (true) {
  readline() // opponent move (the valid list tells us everything)
  const count = parseInt(readline())
  const valid = new Set<number>()
  for (let i = 0; i < count; i++) {
    const [r, c] = readline().split(" ").map(Number)
    valid.add(r * N + c)
  }
  const deadline = Date.now() + TURN_MS
  if (count > previousCount) mine.clear() // a new match started
  previousCount = count
  for (let i = 0; i < N * N; i++) board[i] = valid.has(i) ? 0 : mine.has(i) ? 1 : 2
  const move = count === 1 ? [...valid][0] : search(board, deadline)
  mine.add(move)
  console.log(`${Math.floor(move / N)} ${move % N}`)
}
