// 🎮 CodinGame Multiplayer - paper-soccer
// https://www.codingame.com/multiplayer/bot-programming/paper-soccer
// Referee: https://github.com/jdermont/CodinGame-paper-soccer
//
// Points x 0..8, y 0..10, goals at y = -1 / 11 for x 3..5. Borders are drawn
// except the goal mouths; reaching a point that already has a line bounces
// (the same player moves again); a stuck ball loses for the mover. Player 0
// scores at the top (y = -1). Directions: 0 N (y-1), then clockwise.
// Two-ply search over whole turns (bounce chains), with caps.

const TURN_MS = 150
const FIRST_TURN_MS = 800
const DX = [0, 1, 1, 1, 0, -1, -1, -1]
const DY = [-1, -1, 0, 1, 1, 1, 0, -1]

const id = (x: number, y: number) => (y + 1) * 9 + x
const NODES = 13 * 9
const valid = new Uint8Array(NODES)
const nodeX = new Int8Array(NODES)
const nodeY = new Int8Array(NODES)
for (let y = -1; y <= 11; y++) {
  for (let x = 0; x <= 8; x++) {
    const inPitch = y >= 0 && y <= 10
    const inGoal = (y === -1 || y === 11) && x >= 3 && x <= 5
    if (inPitch || inGoal) valid[id(x, y)] = 1
    nodeX[id(x, y)] = x
    nodeY[id(x, y)] = y
  }
}
// neighbour[n * 8 + d] = node, or -1.
const neighbour = new Int16Array(NODES * 8).fill(-1)
const removed = new Set(
  [
    [id(3, -1), id(2, 0)],
    [id(5, -1), id(6, 0)],
    [id(3, 11), id(2, 10)],
    [id(5, 11), id(6, 10)],
  ].flatMap(([a, b]) => [a * 1000 + b, b * 1000 + a])
)
for (let n = 0; n < NODES; n++) {
  if (!valid[n]) continue
  for (let d = 0; d < 8; d++) {
    const x = nodeX[n] + DX[d]
    const y = nodeY[n] + DY[d]
    if (x < 0 || x > 8 || y < -1 || y > 11) continue
    const m = id(x, y)
    if (valid[m] && !removed.has(n * 1000 + m)) neighbour[n * 8 + d] = m
  }
}
const isGoal = (n: number) => nodeY[n] === -1 || nodeY[n] === 11

// drawn[n]: bitmask of directions already drawn from n.
const drawn = new Uint8Array(NODES)
function dirTo(a: number, b: number): number {
  for (let d = 0; d < 8; d++) if (neighbour[a * 8 + d] === b) return d
  return -1
}
function draw(a: number, b: number) {
  const d = dirTo(a, b)
  drawn[a] |= 1 << d
  drawn[b] |= 1 << ((d + 4) % 8)
}
function undraw(a: number, d: number) {
  const b = neighbour[a * 8 + d]
  drawn[a] &= ~(1 << d)
  drawn[b] &= ~(1 << ((d + 4) % 8))
}
// Pre-drawn lines: side lines, goal lines outside the mouths, goal frames.
for (let y = 0; y < 10; y++) {
  draw(id(0, y), id(0, y + 1))
  draw(id(8, y), id(8, y + 1))
}
for (const y of [0, 10]) for (let x = 0; x < 8; x++) if (x < 3 || x >= 5) draw(id(x, y), id(x + 1, y))
for (const [gy, py] of [
  [-1, 0],
  [11, 10],
]) {
  draw(id(3, gy), id(4, gy))
  draw(id(4, gy), id(5, gy))
  draw(id(3, gy), id(3, py))
  draw(id(5, gy), id(5, py))
}

const degree = new Uint8Array(NODES)
for (let n = 0; n < NODES; n++) for (let d = 0; d < 8; d++) if (neighbour[n * 8 + d] >= 0) degree[n]++
const popcount = (m: number) => {
  let c = 0
  for (; m; m &= m - 1) c++
  return c
}
const free = (n: number) => degree[n] - popcount(drawn[n])

let ball = id(4, 5)

// Enumerates whole turns from `ball`; calls leaf(outcome, path) with the
// state applied. outcome: 1 the mover scored, -1 the mover lost, 0 normal.
let leafBudget = 0
function enumerate(target: number, leaf: (outcome: number, path: string) => void, path = "") {
  const from = ball
  for (let d = 0; d < 8; d++) {
    if (leafBudget <= 0) return
    const to = neighbour[from * 8 + d]
    if (to < 0 || drawn[from] & (1 << d)) continue
    draw(from, to)
    ball = to
    const p = path + d
    if (isGoal(to)) {
      leafBudget--
      leaf(nodeY[to] === target ? 1 : -1, p)
    } else if (free(to) === 0) {
      leafBudget--
      leaf(-1, p)
    } else if (popcount(drawn[to]) >= 2) {
      enumerate(target, leaf, p) // bounce: same player again
    } else {
      leafBudget--
      leaf(0, p)
    }
    ball = from
    undraw(from, d)
  }
}

let myTarget = -1
const theirTarget = () => (myTarget === -1 ? 11 : -1)
// Our view of a position: closer to their goal is better.
const evaluate = () => -Math.abs(nodeY[ball] - myTarget) * 10 - Math.abs(nodeX[ball] - 4)

class Timeout extends Error {}
function think(deadline: number): string {
  let bestPath = ""
  let bestScore = -Infinity
  let firstLegal = ""
  leafBudget = 4000
  try {
    enumerate(myTarget, (outcome, path) => {
      if (!firstLegal) firstLegal = path
      if (Date.now() > deadline) throw new Timeout()
      let score: number
      if (outcome === 1) score = 1e9
      else if (outcome === -1) score = -1e9
      else {
        // The opponent's best reply, from our point of view.
        const saved = leafBudget
        leafBudget = 300
        let worst = Infinity
        let any = false
        enumerate(theirTarget(), o => {
          any = true
          const v = o === 1 ? -1e9 : o === -1 ? 1e8 : evaluate()
          if (v < worst) worst = v
        })
        leafBudget = saved
        score = any ? worst : 1e8
      }
      if (score > bestScore) {
        bestScore = score
        bestPath = path
      }
    })
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
    // Timeout mid-enumeration: rebuild the drawn state from the history.
    rebuild()
  }
  console.error(`score=${bestScore}`)
  return bestPath || firstLegal
}

// Full history of moves, to rebuild after an interrupted search.
const history: string[] = []
const baseDrawn = new Uint8Array(drawn)
function applyMove(move: string) {
  for (const ch of move) {
    const d = ch.charCodeAt(0) - 48
    const to = neighbour[ball * 8 + d]
    draw(ball, to)
    ball = to
  }
}
function rebuild() {
  drawn.set(baseDrawn)
  ball = id(4, 5)
  for (const m of history) applyMove(m)
}

const myId = parseInt(readline())
myTarget = myId === 0 ? -1 : 11
let firstTurn = true
while (true) {
  readline() // opponent move length
  const opp = readline().trim()
  const deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  if (opp !== "-" && opp !== "") {
    history.push(opp)
    applyMove(opp)
  }
  const move = think(deadline)
  history.push(move)
  applyMove(move)
  console.log(move)
}
