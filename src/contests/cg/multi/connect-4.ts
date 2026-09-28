// 🎮 CodinGame Multiplayer - connect-4
// https://www.codingame.com/multiplayer/bot-programming/connect-4
//
// 7 rows x 9 columns, 4 in a row wins; the second player may STEAL the first
// chip on its first turn. MCTS (UCT, c = 0.5) with playouts that take an
// immediate win when one exists. The board is re-read every turn.

const ROWS = 7
const COLS = 9
const FIRST_TURN_MS = 800
const TURN_MS = 80
const UCT_C = 0.5
const MAX_NODES = 3_000_000

// --- Board ------------------------------------------------------------------

const DIRS = [1, 0, 0, 1, 1, 1, 1, -1] // (dcol, drow) pairs

// cells[col * ROWS + row], row 0 = bottom; 0 empty, 1 / 2 = player 0 / 1.
class Board {
  cells = new Uint8Array(ROWS * COLS)
  heights = new Uint8Array(COLS)
  turn = 0
  filled = 0
  result = -1 // -1 ongoing, 0 / 1 winner, 2 draw

  copyFrom(b: Board) {
    this.cells.set(b.cells)
    this.heights.set(b.heights)
    this.turn = b.turn
    this.filled = b.filled
    this.result = b.result
  }

  // Would dropping in col make four for player p?
  wins(col: number, p: number): boolean {
    const row = this.heights[col]
    const v = p + 1
    const c = this.cells
    for (let d = 0; d < 8; d += 2) {
      const dc = DIRS[d]
      const dr = DIRS[d + 1]
      let n = 1
      for (let k = 1; k < 4; k++) {
        const cc = col + dc * k
        const rr = row + dr * k
        if (cc < 0 || cc >= COLS || rr < 0 || rr >= ROWS || c[cc * ROWS + rr] !== v) break
        n++
      }
      for (let k = 1; k < 4; k++) {
        const cc = col - dc * k
        const rr = row - dr * k
        if (cc < 0 || cc >= COLS || rr < 0 || rr >= ROWS || c[cc * ROWS + rr] !== v) break
        n++
      }
      if (n >= 4) return true
    }
    return false
  }

  play(col: number) {
    const p = this.turn
    if (this.wins(col, p)) this.result = p
    this.cells[col * ROWS + this.heights[col]++] = p + 1
    this.filled++
    if (this.result < 0 && this.filled === ROWS * COLS) this.result = 2
    this.turn = p ^ 1
  }

  moves(out: Uint8Array): number {
    let n = 0
    for (let c = 0; c < COLS; c++) if (this.heights[c] < ROWS) out[n++] = c
    return n
  }
}

// --- MCTS -------------------------------------------------------------------

let seed = 0x2545f491
const random = (n: number) => {
  seed ^= seed << 13
  seed ^= seed >>> 17
  seed ^= seed << 5
  return ((seed >>> 0) % n) | 0
}

const playoutMoves = new Uint8Array(COLS)
function playout(b: Board): number {
  while (b.result < 0) {
    const n = b.moves(playoutMoves)
    let move = -1
    for (let k = 0; k < n; k++) {
      if (b.wins(playoutMoves[k], b.turn)) {
        move = playoutMoves[k]
        break
      }
    }
    b.play(move >= 0 ? move : playoutMoves[random(n)])
  }
  return b.result
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

const sim = new Board()
const expandMoves = new Uint8Array(COLS)
const path = new Int32Array(ROWS * COLS + 2)

function search(root: Board, deadline: number): number {
  // An immediate win needs no search.
  const n0 = root.moves(expandMoves)
  for (let k = 0; k < n0; k++) if (root.wins(expandMoves[k], root.turn)) return expandMoves[k]

  nodeCount = 0
  const rootNode = newNode(0)
  let iterations = 0
  while (nodeCount < MAX_NODES - COLS) {
    if ((iterations & 15) === 0 && Date.now() >= deadline) break
    iterations++
    sim.copyFrom(root)
    let node = rootNode
    let depth = 0
    path[depth++] = node
    while (nodeFirstChild[node] >= 0 && sim.result < 0) {
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
    if (sim.result < 0) {
      const n = sim.moves(expandMoves)
      nodeFirstChild[node] = nodeCount
      nodeChildCount[node] = n
      for (let k = 0; k < n; k++) newNode(expandMoves[k])
      node = nodeFirstChild[node] + random(n)
      sim.play(nodeMove[node])
      path[depth++] = node
    }
    const result = playout(sim)
    for (let d = depth - 1; d >= 1; d--) {
      const mover = root.turn ^ ((d - 1) & 1)
      nodeVisits[path[d]]++
      nodeScore[path[d]] += result === 2 ? 0.5 : result === mover ? 1 : 0
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

const [myId] = readline().split(" ").map(Number)
const board = new Board()
let firstTurn = true

while (true) {
  readline() // turn index
  const deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  const rows: string[] = []
  for (let r = 0; r < ROWS; r++) rows.push(readline())
  const validCount = parseInt(readline())
  const valid: number[] = []
  for (let i = 0; i < validCount; i++) valid.push(parseInt(readline()))
  readline() // opponent's previous action: the board already shows it

  board.cells.fill(0)
  board.heights.fill(0)
  board.filled = 0
  board.result = -1
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const ch = rows[ROWS - 1 - r][c]
      if (ch === ".") break
      board.cells[c * ROWS + r] = ch === "0" ? 1 : 2
      board.heights[c]++
      board.filled++
    }
  }
  board.turn = myId

  // STEAL the first chip when it sits in a central column.
  if (valid.includes(-2)) {
    const col = board.heights.findIndex(h => h > 0)
    if (col >= 2 && col <= 6) {
      console.log("STEAL")
      continue
    }
  }

  let move = search(board, deadline)
  if (!valid.includes(move)) move = valid.find(v => v >= 0) ?? valid[0]
  console.log(`${move}`)
}
