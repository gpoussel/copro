// 🎮 CodinGame Multiplayer - yavalath
// https://www.codingame.com/multiplayer/bot-programming/yavalath
//
// Hex board of side 5 (61 cells). Four in a row wins, three in a row (without
// four) loses. Input (x, y): y = row, x = index in the row. With the axial
// column a = x + max(0, y - 4), lines run along (1,0), (0,1) and (1,1).
// MCTS (UCT) whose playouts avoid suicidal moves when they can.

const FIRST_TURN_MS = 800
const TURN_MS = 80
const UCT_C = 0.5
const MAX_NODES = 2_000_000
const S = 9 // axial grid side

const valid = new Uint8Array(S * S)
const toX = new Int8Array(S * S)
const toY = new Int8Array(S * S)
const cellsList: number[] = []
const rowLen = (y: number) => 9 - Math.abs(4 - y)
for (let y = 0; y < 9; y++) {
  for (let x = 0; x < rowLen(y); x++) {
    const a = x + Math.max(0, y - 4)
    const i = y * S + a
    valid[i] = 1
    toX[i] = x
    toY[i] = y
    cellsList.push(i)
  }
}
const DIRS = [1, S, S + 1]

// Result of `p` playing on i: 1 win, -1 loss, 0 nothing.
function outcome(b: Uint8Array, i: number, p: number): number {
  let three = false
  for (const d of DIRS) {
    let n = 1
    for (let j = i + d; j >= 0 && j < S * S && valid[j] && b[j] === p && Math.abs((j % S) - ((j - d) % S)) <= 1; j += d)
      n++
    for (let j = i - d; j >= 0 && j < S * S && valid[j] && b[j] === p && Math.abs((j % S) - ((j + d) % S)) <= 1; j -= d)
      n++
    if (n >= 4) return 1
    if (n === 3) three = true
  }
  return three ? -1 : 0
}

let seed = 0x6a09e667
const random = (n: number) => {
  seed ^= seed << 13
  seed ^= seed >>> 17
  seed ^= seed << 5
  return ((seed >>> 0) % n) | 0
}

const empties = new Int16Array(64)
// Plays out from `b` (player `p` to move, `n` empty cells listed); returns the winner (0 draw).
function playout(b: Uint8Array, p: number, n: number): number {
  while (n > 0) {
    let k = random(n)
    let r = outcome(b, empties[k], p)
    for (let tries = 0; r < 0 && tries < 4; tries++) {
      k = random(n)
      r = outcome(b, empties[k], p)
    }
    b[empties[k]] = p
    empties[k] = empties[--n]
    if (r > 0) return p
    if (r < 0) return 3 - p
    p = 3 - p
  }
  return 0
}

const nodeMove = new Int16Array(MAX_NODES)
const nodeFirstChild = new Int32Array(MAX_NODES)
const nodeChildCount = new Uint8Array(MAX_NODES)
const nodeVisits = new Float64Array(MAX_NODES)
const nodeScore = new Float64Array(MAX_NODES)
const nodeResult = new Int8Array(MAX_NODES) // outcome of the move itself
let nodeCount = 0
const newNode = (move: number, result: number) => {
  const i = nodeCount++
  nodeMove[i] = move
  nodeResult[i] = result
  nodeFirstChild[i] = -1
  nodeChildCount[i] = 0
  nodeVisits[i] = 0
  nodeScore[i] = 0
  return i
}

const sim = new Uint8Array(S * S)
const path = new Int32Array(128)

function search(board: Uint8Array, me: number, deadline: number): number {
  nodeCount = 0
  const rootNode = newNode(0, 0)
  let iterations = 0
  while (nodeCount < MAX_NODES - 64) {
    if ((iterations & 15) === 0 && Date.now() >= deadline) break
    iterations++
    sim.set(board)
    let p = me
    let node = rootNode
    let depth = 0
    path[depth++] = node
    let winner = -1
    while (nodeFirstChild[node] >= 0) {
      const first = nodeFirstChild[node]
      const end = first + nodeChildCount[node]
      if (first === end) {
        winner = 0
        break
      }
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
      path[depth++] = node
      if (nodeResult[node] !== 0) {
        winner = nodeResult[node] > 0 ? p : 3 - p
        break
      }
      p = 3 - p
    }
    if (winner < 0) {
      let n = 0
      for (const i of cellsList) if (sim[i] === 0) empties[n++] = i
      nodeFirstChild[node] = nodeCount
      nodeChildCount[node] = n
      for (let k = 0; k < n; k++) newNode(empties[k], outcome(sim, empties[k], p))
      if (n === 0) winner = 0
      else {
        const k = random(n)
        node = nodeFirstChild[node] + k
        sim[nodeMove[node]] = p
        path[depth++] = node
        if (nodeResult[node] !== 0) winner = nodeResult[node] > 0 ? p : 3 - p
        else {
          empties[k] = empties[--n]
          winner = playout(sim, 3 - p, n)
        }
      }
    }
    for (let d = depth - 1; d >= 1; d--) {
      const mover = d % 2 === 1 ? me : 3 - me
      nodeVisits[path[d]]++
      nodeScore[path[d]] += winner === 0 ? 0.5 : winner === mover ? 1 : 0
    }
    nodeVisits[rootNode]++
  }
  const first = nodeFirstChild[rootNode]
  let best = first
  for (let ch = first; ch < first + nodeChildCount[rootNode]; ch++) {
    const better =
      nodeResult[ch] !== nodeResult[best] ? nodeResult[ch] > nodeResult[best] : nodeVisits[ch] > nodeVisits[best]
    if (better) best = ch
  }
  console.error(`it=${iterations} win=${(nodeScore[best] / nodeVisits[best]).toFixed(3)}`)
  return nodeMove[best]
}

// --- Game loop ----------------------------------------------------------------

readline() // my id: the grid already shows ours as 1
const board = new Uint8Array(S * S)
let firstTurn = true

while (true) {
  const rows = parseInt(readline())
  const lines: string[] = []
  for (let y = 0; y < rows; y++) lines.push(readline().trim())
  readline() // opponent move: "x y" on one line (the statement says two)
  const deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  board.fill(0)
  for (let y = 0; y < rows; y++) {
    const line = lines[y].replace(/\s+/g, "")
    for (let x = 0; x < line.length; x++) {
      const v = line.charCodeAt(x) - 48
      board[y * S + x + Math.max(0, y - 4)] = v === 1 ? 1 : v === 2 ? 2 : 0
    }
  }
  const i = search(board, 1, deadline)
  console.log(`${toX[i]} ${toY[i]}`)
}
