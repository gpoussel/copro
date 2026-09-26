// 🎮 CodinGame Multiplayer - onitama
// https://www.codingame.com/multiplayer/bot-programming/onitama
// Referee: https://github.com/eulerscheZahl/onitama
//
// 5x5, one master + 4 students each; win by taking the enemy master or by
// walking our master onto the enemy shrine (its master's start cell). Cards
// hold 2-4 move vectors; a played card goes to the centre rotated 180°.
// The row numbering and the dy sign are picked on the first turn so that the
// generated moves match the referee's list. Negamax alpha-beta.

const TURN_MS = 38
const FIRST_TURN_MS = 38

// board[r * 5 + c], r = input line: +1 / +2 our student / master, -1 / -2 theirs.
const board = new Int8Array(25)
let rowNumberFromTop = true // "A1" is on the first input line?
let dySign = 1 // row delta = dySign * dy

interface Card {
  id: number
  dx: number[]
  dy: number[]
}
const cards: Card[] = []
// hands[0] ours, hands[1] theirs (indexes into cards), centre card index.
const hands = [
  [0, 0],
  [0, 0],
]
let centre = 0
// sign[k]: +1 when card k's vectors are as given for its next user.
const sign = new Int8Array(5)
let myShrine = 0
let theirShrine = 0

const cellName = (i: number) =>
  String.fromCharCode(65 + (i % 5)) + String(rowNumberFromTop ? Math.floor(i / 5) + 1 : 5 - Math.floor(i / 5))

// Moves packed as card * 1024 + from * 32 + to; to = 31 means PASS.
function genMoves(side: number, out: number[]) {
  out.length = 0
  const hand = hands[side > 0 ? 0 : 1]
  for (const k of hand) {
    const card = cards[k]
    const s = sign[k]
    for (let i = 0; i < 25; i++) {
      if (board[i] * side <= 0) continue
      const r = Math.floor(i / 5)
      const c = i % 5
      for (let m = 0; m < card.dx.length; m++) {
        const cc = c + s * card.dx[m]
        const rr = r + s * dySign * card.dy[m]
        if (cc < 0 || cc > 4 || rr < 0 || rr > 4) continue
        const t = rr * 5 + cc
        if (board[t] * side > 0) continue
        out.push(k * 1024 + i * 32 + t)
      }
    }
  }
  if (out.length === 0) for (const k of hand) out.push(k * 1024 + 31)
}

// Returns the undo info: [card, from, to, captured, handSlot].
function apply(m: number, side: number): number[] {
  const k = m >> 10
  const from = (m >> 5) & 31
  const to = m & 31
  const hand = hands[side > 0 ? 0 : 1]
  const slot = hand[0] === k ? 0 : 1
  let captured = 0
  if (to !== 31) {
    captured = board[to]
    board[to] = board[from]
    board[from] = 0
  }
  hand[slot] = centre
  centre = k
  sign[k] = -sign[k]
  return [k, from, to, captured, slot]
}
function revert(u: number[], side: number) {
  const [k, from, to, captured, slot] = u
  const hand = hands[side > 0 ? 0 : 1]
  sign[k] = -sign[k]
  centre = hand[slot]
  hand[slot] = k
  if (to !== 31) {
    board[from] = board[to]
    board[to] = captured
  }
}

const dist = (a: number, b: number) =>
  Math.max(Math.abs((a % 5) - (b % 5)), Math.abs(Math.floor(a / 5) - Math.floor(b / 5)))

const WIN = 100000
// Winner after a move by `side`, or 0.
function decided(side: number, u: number[]): boolean {
  if (u[3] === -2 * side) return true
  const to = u[2]
  return to !== 31 && board[to] === 2 * side && to === (side > 0 ? theirShrine : myShrine)
}

function evaluate(): number {
  let s = 0
  let myMaster = -1
  let theirMaster = -1
  for (let i = 0; i < 25; i++) {
    const p = board[i]
    if (p === 1) s += 100
    else if (p === -1) s -= 100
    else if (p === 2) myMaster = i
    else if (p === -2) theirMaster = i
  }
  if (myMaster >= 0) s -= 8 * dist(myMaster, theirShrine)
  if (theirMaster >= 0) s += 8 * dist(theirMaster, myShrine)
  return s
}

class Timeout extends Error {}
let deadline = 0
let nodes = 0
const bufs: number[][] = Array.from({ length: 64 }, () => [])

function negamax(side: number, depth: number, alpha: number, beta: number, ply: number): number {
  if ((++nodes & 255) === 0 && Date.now() > deadline) throw new Timeout()
  if (depth === 0) return side * evaluate()
  const moves = bufs[ply]
  genMoves(side, moves)
  let best = -Infinity
  for (const m of moves.slice()) {
    const u = apply(m, side)
    const v = decided(side, u) ? WIN - ply : -negamax(-side, depth - 1, -beta, -alpha, ply + 1)
    revert(u, side)
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best
}

function think(legal: number[]): number {
  let bestIndex = 0
  let order = legal.map((_, k) => k)
  let reached = 0
  nodes = 0
  try {
    for (let depth = 1; depth <= 40; depth++) {
      let alpha = -Infinity
      let depthBest = order[0]
      for (const k of order) {
        const u = apply(legal[k], 1)
        const v = decided(1, u) ? WIN : -negamax(-1, depth - 1, -Infinity, -alpha, 1)
        revert(u, 1)
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

const myId = parseInt(readline())
let firstTurn = true
const moveStr = (m: number) =>
  `${cards[m >> 10].id} ` + ((m & 31) === 31 ? "PASS" : cellName((m >> 5) & 31) + cellName(m & 31))

while (true) {
  const rows: string[] = []
  for (let r = 0; r < 5; r++) rows.push(readline())
  deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  cards.length = 0
  const owners: number[] = []
  for (let k = 0; k < 5; k++) {
    const v = readline().split(" ").map(Number)
    const card: Card = { id: v[1], dx: [], dy: [] }
    for (let m = 0; m < 4; m++) {
      if (v[2 + 2 * m] === 0 && v[3 + 2 * m] === 0) continue
      card.dx.push(v[2 + 2 * m])
      card.dy.push(v[3 + 2 * m])
    }
    cards.push(card)
    owners.push(v[0])
    sign[k] = 1
  }
  let mine = 0
  let theirs = 0
  for (let k = 0; k < 5; k++) {
    if (owners[k] === myId) hands[0][mine++] = k
    else if (owners[k] === -1) centre = k
    else hands[1][theirs++] = k
  }
  const count = parseInt(readline())
  const actions: string[] = []
  for (let i = 0; i < count; i++) actions.push(readline().trim())

  const myMasterCh = myId === 0 ? "W" : "B"
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const ch = rows[r][c]
      const i = r * 5 + c
      if (ch === ".") board[i] = 0
      else if (ch === ch.toLowerCase()) board[i] = ch === myMasterCh.toLowerCase() ? 1 : -1
      else board[i] = ch === myMasterCh ? 2 : -2
    }
  }
  if (firstTurn) {
    // Shrines: the middle of each side's back row (where its students stand).
    let mySum = 0
    for (let i = 0; i < 25; i++) if (board[i] > 0) mySum += Math.floor(i / 5)
    const myBack = mySum / 5 > 2 ? 4 : 0
    myShrine = myBack * 5 + 2
    theirShrine = (4 - myBack) * 5 + 2
    const want = new Set(actions)
    const got: number[] = []
    let found = false
    for (const top of [true, false]) {
      for (const s of [1, -1]) {
        rowNumberFromTop = top
        dySign = s
        genMoves(1, got)
        const names = got.map(moveStr)
        if (names.length === want.size && names.every(n => want.has(n))) found = true
        if (found) break
      }
      if (found) break
    }
    console.error(`orientation top=${rowNumberFromTop} dy=${dySign} found=${found}`)
  }
  firstTurn = false
  const legal: number[] = []
  genMoves(1, legal)
  const names = legal.map(moveStr)
  const valid = legal.filter((_, k) => actions.includes(names[k]))
  if (valid.length === 0) {
    console.error("desync: no engine move is legal")
    console.log(actions[0])
    continue
  }
  console.log(moveStr(valid[think(valid)]))
}
