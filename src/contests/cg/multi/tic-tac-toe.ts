// 🎮 CodinGame Multiplayer - tic-tac-toe
// https://www.codingame.com/multiplayer/bot-programming/tic-tac-toe
//
// Ultimate Tic-Tac-Toe: MCTS (UCT) over a bitboard engine.
// Board b (0..8) and cell c (0..8) are row-major 3x3 indexes; move = b * 9 + c.

const FIRST_TURN_MS = 900
const TURN_MS = 80
const UCT_C = 0.5
const MAX_NODES = 5_000_000

// --- 3x3 helpers ------------------------------------------------------------

const LINES = [0o007, 0o070, 0o700, 0o111, 0o222, 0o444, 0o421, 0o124]
const WIN = new Uint8Array(512)
const POPCOUNT = new Uint8Array(512)
// WIN_CELLS[m]: the cells that would complete a line for mask m.
const WIN_CELLS = new Uint16Array(512)
for (let m = 0; m < 512; m++) {
  WIN[m] = LINES.some(l => (m & l) === l) ? 1 : 0
  POPCOUNT[m] = m === 0 ? 0 : POPCOUNT[m >> 1] + (m & 1)
}
for (let m = 0; m < 512; m++) {
  for (let c = 0; c < 9; c++) if (!((m >> c) & 1) && WIN[m | (1 << c)]) WIN_CELLS[m] |= 1 << c
}
const toMove = (row: number, col: number) => (((row / 3) | 0) * 3 + ((col / 3) | 0)) * 9 + (row % 3) * 3 + (col % 3)
const toRowCol = (move: number) => {
  const b = (move / 9) | 0
  const c = move % 9
  return [((b / 3) | 0) * 3 + ((c / 3) | 0), (b % 3) * 3 + (c % 3)]
}

// --- Game state -------------------------------------------------------------

// Result codes: -1 ongoing, 0/1 winner, 2 draw.
class State {
  cells = new Uint16Array(18) // cells[player * 9 + board]: 9-bit mask
  won = [0, 0] // boards won, per player
  closed = 0 // boards won by anyone or full
  next = -1 // forced board, -1 = any open board
  turn = 0 // player to move
  result = -1

  copyFrom(s: State) {
    this.cells.set(s.cells)
    this.won[0] = s.won[0]
    this.won[1] = s.won[1]
    this.closed = s.closed
    this.next = s.next
    this.turn = s.turn
    this.result = s.result
  }

  play(move: number) {
    const b = (move / 9) | 0
    const c = move - b * 9
    const p = this.turn
    const i = p * 9 + b
    const mask = (this.cells[i] |= 1 << c)
    if (WIN[mask]) {
      this.won[p] |= 1 << b
      this.closed |= 1 << b
      if (WIN[this.won[p]]) this.result = p
    } else if ((this.cells[b] | this.cells[9 + b]) === 511) {
      this.closed |= 1 << b
    }
    if (this.result < 0 && this.closed === 511) {
      const a = POPCOUNT[this.won[0]]
      const d = POPCOUNT[this.won[1]]
      this.result = a > d ? 0 : d > a ? 1 : 2
    }
    this.next = (this.closed >> c) & 1 ? -1 : c
    this.turn = p ^ 1
  }

  // A move that wins the game on the spot, or -1.
  decisive(): number {
    const p = this.turn
    let boards = WIN_CELLS[this.won[p]] & ~this.closed & 511
    if (this.next >= 0) boards &= 1 << this.next
    while (boards) {
      const bit = boards & -boards
      boards ^= bit
      const b = 31 - Math.clz32(bit)
      const cells = WIN_CELLS[this.cells[p * 9 + b]] & ~this.cells[(p ^ 1) * 9 + b]
      if (cells) return b * 9 + 31 - Math.clz32(cells & -cells)
    }
    return -1
  }

  // A uniformly random legal move, without listing them all.
  randomMove(): number {
    if (this.next >= 0) {
      const b = this.next
      return b * 9 + randomBit(~(this.cells[b] | this.cells[9 + b]) & 511)
    }
    let total = 0
    for (let b = 0; b < 9; b++) {
      if (!((this.closed >> b) & 1)) total += POPCOUNT[~(this.cells[b] | this.cells[9 + b]) & 511]
    }
    let k = random(total)
    for (let b = 0; ; b++) {
      if ((this.closed >> b) & 1) continue
      const empty = ~(this.cells[b] | this.cells[9 + b]) & 511
      const n = POPCOUNT[empty]
      if (k < n) return b * 9 + nthBit(empty, k)
      k -= n
    }
  }

  // Writes the legal moves into out, returns their count.
  moves(out: Uint8Array): number {
    let n = 0
    if (this.next >= 0) {
      const b = this.next
      let empty = ~(this.cells[b] | this.cells[9 + b]) & 511
      while (empty) {
        const bit = empty & -empty
        out[n++] = b * 9 + 31 - Math.clz32(bit)
        empty ^= bit
      }
      return n
    }
    for (let b = 0; b < 9; b++) {
      if ((this.closed >> b) & 1) continue
      let empty = ~(this.cells[b] | this.cells[9 + b]) & 511
      while (empty) {
        const bit = empty & -empty
        out[n++] = b * 9 + 31 - Math.clz32(bit)
        empty ^= bit
      }
    }
    return n
  }
}

// --- Random playouts ----------------------------------------------------------

let seed = 0x9e3779b9
const random = (n: number) => {
  seed ^= seed << 13
  seed ^= seed >>> 17
  seed ^= seed << 5
  return ((seed >>> 0) % n) | 0
}

// Index of the k-th set bit of mask (k < popcount).
function nthBit(mask: number, k: number): number {
  while (k--) mask &= mask - 1
  return 31 - Math.clz32(mask & -mask)
}
const randomBit = (mask: number) => nthBit(mask, random(POPCOUNT[mask]))

function playout(s: State): number {
  while (s.result < 0) {
    const win = s.decisive()
    if (win >= 0) {
      s.play(win)
      break
    }
    s.play(s.randomMove())
  }
  return s.result
}

// --- MCTS -------------------------------------------------------------------

const nodeMove = new Uint8Array(MAX_NODES)
const nodeFirstChild = new Int32Array(MAX_NODES) // -1 = not expanded
const nodeChildCount = new Uint8Array(MAX_NODES)
const nodeVisits = new Float64Array(MAX_NODES)
const nodeScore = new Float64Array(MAX_NODES) // for the player who made nodeMove
// MCTS-Solver: +1 the move is a proven win for its mover, -1 a proven loss.
const nodeProven = new Int8Array(MAX_NODES)
let nodeCount = 0

const newNode = (move: number) => {
  const i = nodeCount++
  nodeMove[i] = move
  nodeFirstChild[i] = -1
  nodeChildCount[i] = 0
  nodeVisits[i] = 0
  nodeScore[i] = 0
  nodeProven[i] = 0
  return i
}

// The tree survives between turns: after each move (ours or the opponent's)
// the root moves down to the matching child, so the search keeps what it
// learnt about the new position. The pool restarts when it gets too full.
let treeRoot = -1

function advanceTree(move: number) {
  if (treeRoot < 0 || nodeFirstChild[treeRoot] < 0) {
    treeRoot = -1
    return
  }
  const first = nodeFirstChild[treeRoot]
  const end = first + nodeChildCount[treeRoot]
  let next = -1
  for (let ch = first; ch < end; ch++) {
    if (nodeMove[ch] === move) next = ch
  }
  treeRoot = next
}

const sim = new State()
const expandMoves = new Uint8Array(81)
const path = new Int32Array(82)

function search(root: State, deadline: number): number {
  if (treeRoot < 0 || nodeCount > MAX_NODES * 0.6) {
    nodeCount = 0
    treeRoot = newNode(0)
  }
  const rootNode = treeRoot
  let iterations = 0
  while (nodeCount < MAX_NODES - 81) {
    if ((iterations & 15) === 0 && Date.now() >= deadline) break
    iterations++
    sim.copyFrom(root)
    let node = rootNode
    let depth = 0
    path[depth++] = node

    // Selection. A proven child decides: take a win, never pick a loss.
    while (nodeFirstChild[node] >= 0 && sim.result < 0 && nodeProven[node] === 0) {
      const first = nodeFirstChild[node]
      const end = first + nodeChildCount[node]
      const logN = Math.log(nodeVisits[node])
      let best = -1
      let bestValue = -Infinity
      for (let ch = first; ch < end; ch++) {
        const proven = nodeProven[ch]
        if (proven === 1) {
          best = ch
          break
        }
        if (proven === -1) continue
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
      if (best < 0) best = first // every move loses: the node is proven anyway
      node = best
      sim.play(nodeMove[node])
      path[depth++] = node
    }

    // Expansion.
    if (sim.result < 0 && nodeProven[node] === 0) {
      const n = sim.moves(expandMoves)
      nodeFirstChild[node] = nodeCount
      nodeChildCount[node] = n
      for (let k = 0; k < n; k++) newNode(expandMoves[k])
      node = nodeFirstChild[node] + random(n)
      sim.play(nodeMove[node])
      path[depth++] = node
    }

    // Simulation: a terminal or proven leaf has an exact result.
    const leafMover = root.turn ^ ((depth - 2) & 1)
    let result: number
    if (sim.result >= 0) {
      result = sim.result
      if (depth > 1 && result !== 2) nodeProven[node] = result === leafMover ? 1 : -1
    } else if (nodeProven[node] !== 0) {
      result = nodeProven[node] === 1 ? leafMover : leafMover ^ 1
    } else {
      result = playout(sim)
    }

    // Backpropagation, with the proofs: a winning move makes its parent a
    // loss for the parent's mover; all-losing children make it a win.
    for (let d = depth - 1; d >= 1; d--) {
      const n = path[d]
      const mover = root.turn ^ ((d - 1) & 1)
      nodeVisits[n]++
      nodeScore[n] += result === 2 ? 0.5 : result === mover ? 1 : 0
      if (d === 1) continue
      const parent = path[d - 1]
      if (nodeProven[parent] !== 0) continue
      if (nodeProven[n] === 1) {
        nodeProven[parent] = -1
      } else if (nodeProven[n] === -1) {
        const first = nodeFirstChild[parent]
        let allLost = true
        for (let ch = first; ch < first + nodeChildCount[parent]; ch++) {
          if (nodeProven[ch] !== -1) {
            allLost = false
            break
          }
        }
        if (allLost) nodeProven[parent] = 1
      }
    }
    nodeVisits[rootNode]++
  }

  // Play a proven win if any, else the most visited move not proven lost.
  const first = nodeFirstChild[rootNode]
  const end = first + nodeChildCount[rootNode]
  let best = first
  for (let ch = first; ch < end; ch++) {
    const better =
      nodeProven[ch] !== nodeProven[best] ? nodeProven[ch] > nodeProven[best] : nodeVisits[ch] > nodeVisits[best]
    if (better) best = ch
  }
  console.error(
    `it=${iterations} visits=${nodeVisits[rootNode]} nodes=${nodeCount} win=${(nodeScore[best] / nodeVisits[best]).toFixed(3)} proven=${nodeProven[best]}`
  )
  return nodeMove[best]
}

// --- Game loop ----------------------------------------------------------------

const state = new State()
const legal = new Uint8Array(81)
let firstTurn = true

while (true) {
  const [oppRow, oppCol] = readline().split(" ").map(Number)
  const deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  if (oppRow >= 0) {
    const opp = toMove(oppRow, oppCol)
    state.play(opp)
    advanceTree(opp)
  }

  const validCount = parseInt(readline())
  const valid = new Set<number>()
  for (let i = 0; i < validCount; i++) {
    const [r, c] = readline().split(" ").map(Number)
    valid.add(toMove(r, c))
  }
  if (state.moves(legal) !== validCount) {
    console.error(`desync: engine ${state.moves(legal)} moves, referee ${validCount}`)
  }

  let move = search(state, deadline)
  if (!valid.has(move)) move = valid.values().next().value!
  state.play(move)
  advanceTree(move)
  const [row, col] = toRowCol(move)
  console.log(`${row} ${col}`)
}
