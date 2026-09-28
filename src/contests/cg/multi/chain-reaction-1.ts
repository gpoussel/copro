// 🎮 CodinGame Multiplayer - chain-reaction-1
// https://www.codingame.com/multiplayer/bot-programming/chain-reaction-1
//
// 6x6. Add an orb to an empty or own cell; a cell reaching its critical mass
// (its orthogonal neighbour count) explodes into its neighbours, which it
// captures; chains resolve wave by wave until nothing is critical or the
// opponent owns nothing. Negamax alpha-beta; eval = orbs, cells, and our
// cells next to a critical enemy cell (they are about to be taken).

const FIRST_TURN_MS = 800
const TURN_MS = 80
const SIZE = 6
const CELLS = 36

const neighbours: number[][] = []
const critical = new Uint8Array(CELLS)
for (let i = 0; i < CELLS; i++) {
  const r = Math.floor(i / SIZE)
  const c = i % SIZE
  const list: number[] = []
  if (r > 0) list.push(i - SIZE)
  if (r < SIZE - 1) list.push(i + SIZE)
  if (c > 0) list.push(i - 1)
  if (c < SIZE - 1) list.push(i + 1)
  neighbours.push(list)
  critical[i] = list.length
}

// owner: +1 us, -1 them, 0 empty. Row 0 = input line 1 = rank 6.
interface State {
  owner: Int8Array
  orbs: Uint8Array
}

function cellsOf(s: State, side: number): number {
  let n = 0
  for (let i = 0; i < CELLS; i++) if (s.owner[i] === side) n++
  return n
}

// Adds an orb for `side` at i and resolves the chain reaction.
const wave: number[] = []
function play(s: State, i: number, side: number) {
  s.owner[i] = side
  s.orbs[i]++
  let current = s.orbs[i] >= critical[i] ? [i] : []
  let guard = 0
  while (current.length && guard++ < 200) {
    wave.length = 0
    for (const j of current) {
      if (s.orbs[j] < critical[j]) continue
      s.orbs[j] -= critical[j]
      if (s.orbs[j] === 0) s.owner[j] = 0
      for (const k of neighbours[j]) {
        s.owner[k] = side
        s.orbs[k]++
        if (s.orbs[k] >= critical[k]) wave.push(k)
      }
    }
    if (cellsOf(s, -side) === 0) break
    current = [...new Set(wave)]
  }
}

function evaluate(s: State): number {
  let score = 0
  for (let i = 0; i < CELLS; i++) {
    const o = s.owner[i]
    if (o === 0) continue
    score += o * (s.orbs[i] + 2)
    // Next to an enemy cell one orb from exploding: likely lost.
    for (const k of neighbours[i]) {
      if (s.owner[k] === -o && s.orbs[k] === critical[k] - 1) {
        score -= o * (s.orbs[i] + 2)
        break
      }
    }
  }
  return score
}

class Timeout extends Error {}
let deadline = 0
let nodes = 0
const WIN = 100000
const copy = (s: State): State => ({ owner: new Int8Array(s.owner), orbs: new Uint8Array(s.orbs) })

function negamax(s: State, side: number, depth: number, alpha: number, beta: number, ply: number): number {
  if ((++nodes & 127) === 0 && Date.now() > deadline) throw new Timeout()
  if (depth === 0) return side * evaluate(s)
  let best = -Infinity
  for (let i = 0; i < CELLS; i++) {
    if (s.owner[i] === -side) continue
    const t = copy(s)
    play(t, i, side)
    const v = cellsOf(t, -side) === 0 ? WIN - ply : -negamax(t, -side, depth - 1, -beta, -alpha, ply + 1)
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best
}

function think(s: State, canWin: boolean): number {
  const moves: number[] = []
  for (let i = 0; i < CELLS; i++) if (s.owner[i] !== -1) moves.push(i)
  let bestMove = moves[0]
  let order = moves
  let reached = 0
  nodes = 0
  try {
    for (let depth = 1; depth <= 12; depth++) {
      let alpha = -Infinity
      let depthBest = order[0]
      for (const i of order) {
        const t = copy(s)
        play(t, i, 1)
        const v = canWin && cellsOf(t, -1) === 0 ? WIN : -negamax(t, -1, depth - 1, -Infinity, -alpha, 1)
        if (v > alpha) {
          alpha = v
          depthBest = i
        }
      }
      bestMove = depthBest
      reached = depth
      order = [depthBest, ...order.filter(i => i !== depthBest)]
      if (Math.abs(alpha) > WIN / 2) break
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  return bestMove
}

// --- Game loop ----------------------------------------------------------------

const myColor = readline().trim()
let firstTurn = true
let turns = 0
const cellName = (i: number) => String.fromCharCode(97 + (i % SIZE)) + String(SIZE - Math.floor(i / SIZE))

while (true) {
  const last = readline().trim()
  const s: State = { owner: new Int8Array(CELLS), orbs: new Uint8Array(CELLS) }
  for (let r = 0; r < SIZE; r++) {
    const line = readline()
    for (let c = 0; c < SIZE; c++) {
      const tok = line.slice(2 * c, 2 * c + 2)
      if (tok === "..") continue
      s.owner[r * SIZE + c] = tok[0] === myColor ? 1 : -1
      s.orbs[r * SIZE + c] = parseInt(tok[1])
    }
  }
  deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  turns++
  // Wiping the opponent only counts once both have played.
  const opponentPlayed = last !== "null" || turns > 1
  if (cellsOf(s, 1) === 0 && cellsOf(s, -1) === 0) {
    console.log("c3")
    continue
  }
  console.log(cellName(think(s, opponentPlayed)))
}
