// 🎮 CodinGame Multiplayer - dots-and-boxes
// https://www.codingame.com/multiplayer/bot-programming/dots-and-boxes
//
// Closing a box scores it and gives another move, so turns do not strictly
// alternate: each MCTS node records who moved. Playouts: take a box when
// possible, else a "safe" side (no box left with three sides), else random.

const FIRST_TURN_MS = 800
const TURN_MS = 80
const UCT_C = 0.5
const MAX_NODES = 3_000_000

let N = 2
let H = 0 // horizontal edges: (N + 1) * N, then vertical: N * (N + 1)
let E = 0
// edgeBoxes[2e], [2e+1]: the boxes along edge e (-1 if none).
let edgeBoxes = new Int16Array(0)
// boxEdges[4b..4b+3]: bottom, top, left, right edges of box b.
let boxEdges = new Int16Array(0)

function setup(n: number) {
  N = n
  H = (N + 1) * N
  E = H + N * (N + 1)
  edgeBoxes = new Int16Array(2 * E).fill(-1)
  boxEdges = new Int16Array(4 * N * N)
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const b = r * N + c
      const sides = [r * N + c, (r + 1) * N + c, H + r * (N + 1) + c, H + r * (N + 1) + c + 1]
      for (let k = 0; k < 4; k++) {
        const e = sides[k]
        boxEdges[4 * b + k] = e
        edgeBoxes[2 * e + (edgeBoxes[2 * e] < 0 ? 0 : 1)] = b
      }
    }
  }
}

class State {
  drawn = new Uint8Array(0)
  sides = new Uint8Array(0) // drawn sides per box
  score = [0, 0]
  turn = 0
  free = 0

  init() {
    this.drawn = new Uint8Array(E)
    this.sides = new Uint8Array(N * N)
  }

  copyFrom(s: State) {
    this.drawn.set(s.drawn)
    this.sides.set(s.sides)
    this.score[0] = s.score[0]
    this.score[1] = s.score[1]
    this.turn = s.turn
    this.free = s.free
  }

  // Draws edge e; returns the boxes closed (the mover plays again if > 0).
  play(e: number): number {
    this.drawn[e] = 1
    this.free--
    let closed = 0
    for (let k = 0; k < 2; k++) {
      const b = edgeBoxes[2 * e + k]
      if (b >= 0 && ++this.sides[b] === 4) closed++
    }
    if (closed) this.score[this.turn] += closed
    else this.turn ^= 1
    return closed
  }

  closes(e: number): boolean {
    for (let k = 0; k < 2; k++) {
      const b = edgeBoxes[2 * e + k]
      if (b >= 0 && this.sides[b] === 3) return true
    }
    return false
  }

  // Would drawing e leave a box with exactly three sides for the opponent?
  gives(e: number): boolean {
    for (let k = 0; k < 2; k++) {
      const b = edgeBoxes[2 * e + k]
      if (b >= 0 && this.sides[b] === 2) return true
    }
    return false
  }

  winner(): number {
    return this.score[0] > this.score[1] ? 0 : this.score[1] > this.score[0] ? 1 : 2
  }
}

let seed = 0x7f4a7c15
const random = (n: number) => {
  seed ^= seed << 13
  seed ^= seed >>> 17
  seed ^= seed << 5
  return ((seed >>> 0) % n) | 0
}

const freeBuf = new Int16Array(256)
const safeBuf = new Int16Array(256)
function playout(s: State): number {
  while (s.free > 0) {
    let nFree = 0
    let nSafe = 0
    let capture = -1
    for (let e = 0; e < E; e++) {
      if (s.drawn[e]) continue
      if (s.closes(e)) {
        capture = e
        break
      }
      freeBuf[nFree++] = e
      if (!s.gives(e)) safeBuf[nSafe++] = e
    }
    if (capture >= 0) s.play(capture)
    else if (nSafe > 0) s.play(safeBuf[random(nSafe)])
    else s.play(freeBuf[random(nFree)])
  }
  return s.winner()
}

const nodeMove = new Int16Array(MAX_NODES)
const nodePlayer = new Uint8Array(MAX_NODES) // who made nodeMove
const nodeFirstChild = new Int32Array(MAX_NODES)
const nodeChildCount = new Uint16Array(MAX_NODES)
const nodeVisits = new Float64Array(MAX_NODES)
const nodeScore = new Float64Array(MAX_NODES)
let nodeCount = 0
const newNode = (move: number, player: number) => {
  const i = nodeCount++
  nodeMove[i] = move
  nodePlayer[i] = player
  nodeFirstChild[i] = -1
  nodeChildCount[i] = 0
  nodeVisits[i] = 0
  nodeScore[i] = 0
  return i
}

const sim = new State()
const path = new Int32Array(512)

function search(root: State, deadline: number): number {
  nodeCount = 0
  const rootNode = newNode(0, root.turn ^ 1)
  let iterations = 0
  while (nodeCount < MAX_NODES - 256) {
    if ((iterations & 15) === 0 && Date.now() >= deadline) break
    iterations++
    sim.copyFrom(root)
    let node = rootNode
    let depth = 0
    path[depth++] = node
    while (nodeFirstChild[node] >= 0 && sim.free > 0) {
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
    if (sim.free > 0) {
      nodeFirstChild[node] = nodeCount
      let n = 0
      for (let e = 0; e < E; e++) {
        if (!sim.drawn[e]) {
          newNode(e, sim.turn)
          n++
        }
      }
      nodeChildCount[node] = n
      node = nodeFirstChild[node] + random(n)
      sim.play(nodeMove[node])
      path[depth++] = node
    }
    const winner = playout(sim)
    for (let d = depth - 1; d >= 1; d--) {
      const n = path[d]
      nodeVisits[n]++
      nodeScore[n] += winner === 2 ? 0.5 : winner === nodePlayer[n] ? 1 : 0
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

setup(parseInt(readline()))
readline() // player id: we always play as "turn 0" of our own search
const state = new State()
sim.init()
let firstTurn = true
const SIDE_NAMES = "BTLR" // order of boxEdges

while (true) {
  const [myScore, oppScore] = readline().split(" ").map(Number)
  const deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  const count = parseInt(readline())
  state.init()
  state.drawn.fill(1)
  const boxName: string[] = []
  const freeSides = new Map<number, string>() // box -> free side letters
  for (let i = 0; i < count; i++) {
    const [box, sides] = readline().trim().split(" ")
    const b = (parseInt(box.slice(1)) - 1) * N + (box.charCodeAt(0) - 65)
    boxName[b] = box
    freeSides.set(b, sides)
    for (const ch of sides) state.drawn[boxEdges[4 * b + SIDE_NAMES.indexOf(ch)]] = 0
  }
  state.free = 0
  for (let e = 0; e < E; e++) if (!state.drawn[e]) state.free++
  for (let b = 0; b < N * N; b++) {
    let s = 0
    for (let k = 0; k < 4; k++) s += state.drawn[boxEdges[4 * b + k]]
    state.sides[b] = s
  }
  state.score[0] = myScore
  state.score[1] = oppScore
  state.turn = 0

  const e = state.free === 1 ? state.drawn.indexOf(0) : search(state, deadline)
  // Name the edge through one of its boxes that lists it as free.
  let out = ""
  for (let k = 0; k < 2 && !out; k++) {
    const b = edgeBoxes[2 * e + k]
    if (b < 0 || !freeSides.has(b)) continue
    const side = SIDE_NAMES[[0, 1, 2, 3].find(j => boxEdges[4 * b + j] === e)!]
    if (freeSides.get(b)!.includes(side)) out = `${boxName[b]} ${side}`
  }
  console.log(out)
}
