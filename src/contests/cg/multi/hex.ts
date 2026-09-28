// 🎮 CodinGame Multiplayer - hex
// https://www.codingame.com/multiplayer/bot-programming/hex
//
// 11x11 Hex: red joins top and bottom, blue left and right; blue may swap on
// turn 2. MCTS (UCT) with random-fill playouts: the empty cells are filled at
// random in one go and the winner is read with one flood fill (a full Hex
// board always has exactly one winner).

const FIRST_TURN_MS = 800
const TURN_MS = 80
const UCT_C = 0.5
const MAX_NODES = 2_000_000
const RED = 1
const BLUE = 2

let N = 11
let cells = 0
// Neighbours of (r, c): (r-1, c), (r-1, c+1), (r, c-1), (r, c+1), (r+1, c-1), (r+1, c).
let neighbours: Int16Array[] = []

function setup(n: number) {
  N = n
  cells = N * N
  neighbours = []
  const d = [
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
  ]
  for (let i = 0; i < cells; i++) {
    const r = Math.floor(i / N)
    const c = i % N
    const list: number[] = []
    for (const [dr, dc] of d) {
      const rr = r + dr
      const cc = c + dc
      if (rr >= 0 && rr < N && cc >= 0 && cc < N) list.push(rr * N + cc)
    }
    neighbours.push(Int16Array.from(list))
  }
}

let seed = 0x3c6ef372
const random = (n: number) => {
  seed ^= seed << 13
  seed ^= seed >>> 17
  seed ^= seed << 5
  return ((seed >>> 0) % n) | 0
}

// Does red join top to bottom on a full board?
const stack = new Int16Array(256)
const seen = new Uint8Array(256)
function redWins(b: Uint8Array): boolean {
  seen.fill(0)
  let top = 0
  for (let c = 0; c < N; c++) {
    if (b[c] === RED) {
      stack[top++] = c
      seen[c] = 1
    }
  }
  while (top > 0) {
    const i = stack[--top]
    if (i >= cells - N) return true
    const nb = neighbours[i]
    for (let k = 0; k < nb.length; k++) {
      const j = nb[k]
      if (!seen[j] && b[j] === RED) {
        seen[j] = 1
        stack[top++] = j
      }
    }
  }
  return false
}

const nodeMove = new Uint8Array(MAX_NODES)
const nodeFirstChild = new Int32Array(MAX_NODES)
const nodeChildCount = new Uint8Array(MAX_NODES)
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

const simBoard = new Uint8Array(256)
const empties = new Uint8Array(256)
const path = new Int32Array(256)

// toMove: RED or BLUE. Returns the cell to play.
function search(board: Uint8Array, toMove: number, deadline: number): number {
  nodeCount = 0
  const rootNode = newNode(0)
  let iterations = 0
  while (nodeCount < MAX_NODES - 256) {
    if ((iterations & 15) === 0 && Date.now() >= deadline) break
    iterations++
    simBoard.set(board.subarray(0, cells))
    let player = toMove
    let node = rootNode
    let depth = 0
    path[depth++] = node
    // Selection (the tree only stops at a full board, which never happens
    // before the playout would fill it anyway).
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
      simBoard[nodeMove[node]] = player
      player = 3 - player
      path[depth++] = node
    }
    // Expansion.
    let n = 0
    for (let i = 0; i < cells; i++) if (simBoard[i] === 0) empties[n++] = i
    if (n > 0 && nodeFirstChild[node] < 0) {
      nodeFirstChild[node] = nodeCount
      nodeChildCount[node] = n
      for (let k = 0; k < n; k++) newNode(empties[k])
      const k = random(n)
      node = nodeFirstChild[node] + k
      simBoard[nodeMove[node]] = player
      player = 3 - player
      path[depth++] = node
      empties[k] = empties[--n]
    }
    // Random fill: shuffle the remaining empties, alternate colours.
    for (let k = n - 1; k >= 0; k--) {
      const j = random(k + 1)
      const cell = empties[j]
      empties[j] = empties[k]
      simBoard[cell] = player
      player = 3 - player
    }
    const winner = redWins(simBoard) ? RED : BLUE
    for (let d = depth - 1; d >= 1; d--) {
      // The node at depth d was played by toMove when d is odd.
      const mover = d % 2 === 1 ? toMove : 3 - toMove
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

const [sizeStr, colorStr] = readline().trim().split(" ")
setup(parseInt(sizeStr))
const me = colorStr === "red" ? RED : BLUE
const board = new Uint8Array(256)
let firstTurn = true
// "d4": column letter, row number, a1 top-left.
const cellName = (i: number) => String.fromCharCode(97 + (i % N)) + String(Math.floor(i / N) + 1)

while (true) {
  const lastMove = readline().trim()
  const deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  let stones = 0
  for (let r = 0; r < N; r++) {
    const tokens = readline().trim().split(/\s+/)
    for (let c = 0; c < N; c++) {
      const t = tokens[c]
      board[r * N + c] = t === "r" ? RED : t === "b" ? BLUE : 0
      if (board[r * N + c]) stones++
    }
  }
  // Blue's first turn with a single central red stone: take it.
  if (me === BLUE && stones === 1 && lastMove !== "swap-pieces") {
    const i = board.indexOf(RED)
    const r = Math.floor(i / N)
    const c = i % N
    if (r >= 2 && r <= N - 3 && c >= 2 && c <= N - 3) {
      console.log("swap-pieces")
      continue
    }
  }
  const cell = search(board, me, deadline)
  console.log(cellName(cell))
}
