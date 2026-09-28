// 🎮 CodinGame Multiplayer - nine-mens-morris
// https://www.codingame.com/multiplayer/bot-programming/nine-mens-morris
//
// 24 fields (adjacency given at start). Place 9 stones each, then move to an
// adjacent field (fly anywhere with 3 stones); a mill takes an enemy stone
// (outside mills when possible). Win: the opponent drops below 3 stones or
// cannot move. Negamax alpha-beta; eval = stones, mobility, open mills.

const TURN_MS = 38
const FIRST_TURN_MS = 38

const myId = parseInt(readline())
const fieldCount = parseInt(readline())
const names: string[] = []
const adjacency: number[][] = []
const indexOf = new Map<string, number>()
const rawNeighbours: string[][] = []
for (let i = 0; i < fieldCount; i++) {
  const [field, list] = readline().trim().split(":")
  indexOf.set(field, i)
  names.push(field)
  rawNeighbours.push(list ? list.split(";").filter(s => s) : [])
}
for (let i = 0; i < fieldCount; i++) adjacency.push(rawNeighbours[i].map(f => indexOf.get(f)!))

// Mills: three fields in a row or a column; row 4 and column D hold two each.
const mills: number[][] = []
const byKey = (key: (f: string) => string, order: (f: string) => number) => {
  const groups = new Map<string, string[]>()
  for (const f of names) groups.set(key(f), [...(groups.get(key(f)) ?? []), f])
  for (const g of groups.values()) {
    g.sort((a, b) => order(a) - order(b))
    for (let k = 0; k + 2 < g.length; k += 3) mills.push(g.slice(k, k + 3).map(f => indexOf.get(f)!))
  }
}
byKey(
  f => f.slice(1),
  f => f.charCodeAt(0)
)
byKey(
  f => f[0],
  f => parseInt(f.slice(1))
)
const millsOf: number[][] = names.map((_, i) => mills.map((m, k) => (m.includes(i) ? k : -1)).filter(k => k >= 0))

// board[i]: 0 empty, 1 us, -1 them. hand[0] ours, hand[1] theirs.
const board = new Int8Array(fieldCount)
const hand = [9, 9]
const count = (side: number) => {
  let n = 0
  for (let i = 0; i < fieldCount; i++) if (board[i] === side) n++
  return n
}
const inMill = (i: number) => millsOf[i].some(k => mills[k].every(j => board[j] === board[i]))

// A move: [from (-1 = place), to, take (-1 = none)].
type Move = [number, number, number]

function genMoves(side: number): Move[] {
  const h = hand[side > 0 ? 0 : 1]
  const stones = count(side)
  const targets: [number, number][] = [] // [from, to]
  if (h > 0) {
    for (let i = 0; i < fieldCount; i++) if (board[i] === 0) targets.push([-1, i])
  } else {
    const flying = stones === 3
    for (let i = 0; i < fieldCount; i++) {
      if (board[i] !== side) continue
      if (flying) {
        for (let j = 0; j < fieldCount; j++) if (board[j] === 0) targets.push([i, j])
      } else {
        for (const j of adjacency[i]) if (board[j] === 0) targets.push([i, j])
      }
    }
  }
  const out: Move[] = []
  for (const [from, to] of targets) {
    if (from >= 0) board[from] = 0
    board[to] = side
    if (inMill(to)) {
      const enemies: number[] = []
      for (let i = 0; i < fieldCount; i++) if (board[i] === -side) enemies.push(i)
      const free = enemies.filter(i => !inMill(i))
      for (const t of free.length ? free : enemies) out.push([from, to, t])
      if (enemies.length === 0) out.push([from, to, -1])
    } else {
      out.push([from, to, -1])
    }
    board[to] = 0
    if (from >= 0) board[from] = side
  }
  return out
}

function apply(m: Move, side: number) {
  const [from, to, take] = m
  if (from < 0) hand[side > 0 ? 0 : 1]--
  else board[from] = 0
  board[to] = side
  if (take >= 0) board[take] = 0
}
function revert(m: Move, side: number) {
  const [from, to, take] = m
  if (take >= 0) board[take] = -side
  board[to] = 0
  if (from < 0) hand[side > 0 ? 0 : 1]++
  else board[from] = side
}

const WIN = 100000
const lost = (side: number) => count(side) + hand[side > 0 ? 0 : 1] < 3

function evaluate(): number {
  let s = 100 * (count(1) + hand[0] - count(-1) - hand[1])
  // Two stones and an empty field in a mill line: a threat.
  for (const m of mills) {
    let mine = 0
    let theirs = 0
    let empty = 0
    for (const j of m) {
      if (board[j] === 1) mine++
      else if (board[j] === -1) theirs++
      else empty++
    }
    if (mine === 2 && empty === 1) s += 15
    if (theirs === 2 && empty === 1) s -= 15
  }
  return s
}

class Timeout extends Error {}
let deadline = 0
let nodes = 0

function negamax(side: number, depth: number, alpha: number, beta: number, ply: number): number {
  if ((++nodes & 255) === 0 && Date.now() > deadline) throw new Timeout()
  if (lost(side)) return -WIN + ply
  const moves = genMoves(side)
  if (moves.length === 0) return -WIN + ply
  if (depth === 0) return side * evaluate()
  moves.sort((a, b) => (b[2] >= 0 ? 1 : 0) - (a[2] >= 0 ? 1 : 0))
  let best = -Infinity
  for (const m of moves) {
    apply(m, side)
    const v = -negamax(-side, depth - 1, -beta, -alpha, ply + 1)
    revert(m, side)
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best
}

function think(legal: Move[]): number {
  let bestIndex = 0
  let order = legal.map((_, k) => k)
  let reached = 0
  nodes = 0
  try {
    for (let depth = 1; depth <= 30; depth++) {
      let alpha = -Infinity
      let depthBest = order[0]
      for (const k of order) {
        apply(legal[k], 1)
        const v = -negamax(-1, depth - 1, -Infinity, -alpha, 1)
        revert(legal[k], 1)
        if (v > alpha) {
          alpha = v
          depthBest = k
        }
      }
      bestIndex = depthBest
      reached = depth
      order = [depthBest, ...order.filter(k => k !== depthBest)]
      if (Math.abs(alpha) > WIN / 2) break
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  return bestIndex
}

// --- Game loop ----------------------------------------------------------------

let firstTurn = true
let myTurns = 0
let theirTurns = 0

// "PLACE;A1", "PLACE&TAKE;A1;D1", "MOVE;A1;D1", "MOVE&TAKE;A1;D1;D2".
function parseCommand(c: string): Move {
  const parts = c.split(";")
  const f = parts.slice(1).map(n => indexOf.get(n)!)
  if (parts[0].startsWith("PLACE")) return [-1, f[0], f.length > 1 ? f[1] : -1]
  return [f[0], f[1], f.length > 2 ? f[2] : -1]
}
function formatMove(m: Move): string {
  const [from, to, take] = m
  const t = take >= 0 ? `;${names[take]}` : ""
  if (from < 0) return (take >= 0 ? "PLACE&TAKE;" : "PLACE;") + names[to] + t
  return (take >= 0 ? "MOVE&TAKE;" : "MOVE;") + names[from] + ";" + names[to] + t
}

while (true) {
  const opMove = readline().trim()
  deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  if (opMove !== "-" && opMove !== "") theirTurns++
  firstTurn = false
  const state = readline().trim()
  for (const entry of state.split(";")) {
    if (!entry) continue
    const [field, v] = entry.split(":")
    const i = indexOf.get(field.trim())
    if (i === undefined) continue
    const s = parseInt(v)
    board[i] = s === 2 ? 0 : s === myId ? 1 : -1
  }
  hand[0] = Math.max(0, 9 - myTurns)
  hand[1] = Math.max(0, 9 - theirTurns)
  const n = parseInt(readline())
  const commands: string[] = []
  for (let i = 0; i < n; i++) commands.push(readline().trim())
  const legal = commands.map(parseCommand)
  const mine = new Set(genMoves(1).map(formatMove))
  if (!commands.every(c => mine.has(c))) console.error("desync: referee command unknown to the engine")
  const k = legal.length === 1 ? 0 : think(legal)
  myTurns++
  console.log(commands[k])
}
