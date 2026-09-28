// 🎮 CodinGame Multiplayer - clobber
// https://www.codingame.com/multiplayer/bot-programming/clobber
//
// A move takes an orthogonally adjacent enemy piece; the player with no move
// left loses. The board is given every turn (top row first, chess notation).
// MCTS (UCT, c = 0.5) with uniform random playouts.

const FIRST_TURN_MS = 800
const TURN_MS = 120
const UCT_C = 0.5
const MAX_NODES = 3_000_000

let N = 8
// cells[r * N + c], r = 0 top row; 1 / 2 = player 0 / 1 (0 = us), 0 empty.
class Board {
  cells = new Uint8Array(64)
  turn = 0

  copyFrom(b: Board) {
    this.cells.set(b.cells)
    this.turn = b.turn
  }

  // Moves packed as from * 64 + to.
  moves(out: Int16Array): number {
    const me = this.turn + 1
    const opp = 3 - me
    const c = this.cells
    let n = 0
    for (let i = 0; i < N * N; i++) {
      if (c[i] !== me) continue
      const r = (i / N) | 0
      const col = i - r * N
      if (r > 0 && c[i - N] === opp) out[n++] = i * 64 + i - N
      if (r < N - 1 && c[i + N] === opp) out[n++] = i * 64 + i + N
      if (col > 0 && c[i - 1] === opp) out[n++] = i * 64 + i - 1
      if (col < N - 1 && c[i + 1] === opp) out[n++] = i * 64 + i + 1
    }
    return n
  }

  play(m: number) {
    this.cells[m & 63] = this.cells[m >> 6]
    this.cells[m >> 6] = 0
    this.turn ^= 1
  }
}

let seed = 0x1234567
const random = (n: number) => {
  seed ^= seed << 13
  seed ^= seed >>> 17
  seed ^= seed << 5
  return ((seed >>> 0) % n) | 0
}

// Returns the winner (the last player able to move).
const playoutMoves = new Int16Array(256)
function playout(b: Board): number {
  while (true) {
    const n = b.moves(playoutMoves)
    if (n === 0) return b.turn ^ 1
    b.play(playoutMoves[random(n)])
  }
}

const nodeMove = new Int16Array(MAX_NODES)
const nodeFirstChild = new Int32Array(MAX_NODES)
const nodeChildCount = new Uint16Array(MAX_NODES)
const nodeVisits = new Float64Array(MAX_NODES)
const nodeScore = new Float64Array(MAX_NODES)
let nodeCount = 0
const newNode = (move: number) => {
  const i = nodeCount++
  nodeMove[i] = move
  nodeFirstChild[i] = -1
  nodeChildCount[i] = 0
  nodeVisits[i] = 0
  nodeScore[i] = 0
  return i
}

const sim = new Board()
const expandMoves = new Int16Array(256)
const path = new Int32Array(128)

function search(root: Board, deadline: number): number {
  nodeCount = 0
  const rootNode = newNode(0)
  let iterations = 0
  while (nodeCount < MAX_NODES - 256) {
    if ((iterations & 15) === 0 && Date.now() >= deadline) break
    iterations++
    sim.copyFrom(root)
    let node = rootNode
    let depth = 0
    path[depth++] = node
    let terminal = false
    while (nodeFirstChild[node] >= 0) {
      if (nodeChildCount[node] === 0) {
        terminal = true
        break
      }
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
      sim.play(nodeMove[node])
      path[depth++] = node
    }
    if (!terminal) {
      const n = sim.moves(expandMoves)
      nodeFirstChild[node] = nodeCount
      nodeChildCount[node] = n
      for (let k = 0; k < n; k++) newNode(expandMoves[k])
      if (n > 0) {
        node = nodeFirstChild[node] + random(n)
        sim.play(nodeMove[node])
        path[depth++] = node
      }
    }
    const winner = playout(sim)
    for (let d = depth - 1; d >= 1; d--) {
      const mover = root.turn ^ ((d - 1) & 1)
      nodeVisits[path[d]]++
      if (winner === mover) nodeScore[path[d]]++
    }
    nodeVisits[rootNode]++
  }
  const first = nodeFirstChild[rootNode]
  let best = first
  for (let ch = first; ch < first + nodeChildCount[rootNode]; ch++) {
    if (nodeVisits[ch] > nodeVisits[best]) best = ch
  }
  console.error(`it=${iterations} win=${(nodeScore[best] / nodeVisits[best]).toFixed(3)}`)
  return nodeMove[best]
}

// --- Game loop ----------------------------------------------------------------

N = parseInt(readline())
const myColor = readline().trim()
const board = new Board()
let firstTurn = true
const legal = new Int16Array(256)
// "e2": file letter, rank counted from the bottom.
const sqName = (i: number) => String.fromCharCode(97 + (i % N)) + String(N - Math.floor(i / N))

while (true) {
  const rows: string[] = []
  for (let r = 0; r < N; r++) rows.push(readline())
  const deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  readline() // last action
  const count = parseInt(readline())
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const ch = rows[r][c]
      board.cells[r * N + c] = ch === "." ? 0 : ch === myColor ? 1 : 2
    }
  }
  board.turn = 0
  const n = board.moves(legal)
  if (n !== count) console.error(`desync: ${n} vs ${count}`)
  if (n === 0) {
    console.log("random")
    continue
  }
  const m = n === 1 ? legal[0] : search(board, deadline)
  console.log(sqName(m >> 6) + sqName(m & 63))
}
