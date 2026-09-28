// 🎮 CodinGame Multiplayer - dice-shogi
// https://www.codingame.com/multiplayer/bot-programming/dice-shogi
//
// Minishogi where a die picks the destination file each turn (6 = any; any
// file if none fits). Same engine as minishogi.ts: the referee's list already
// applies the die at the root; the search ignores future dice (it lets the
// opponent pick any file, which is pessimistic).
//
// 5x5 shogi. Coordinates: column 5 is the left file, row 1 the top line
// ("5544" = from col 5 row 5 to col 4 row 4, "+" promotes, "G*33" drops).
// Pseudo-legal engine (a king capture ends the search line); the root only
// plays moves from the referee's legal list. Negamax alpha-beta with
// iterative deepening; eval = material (hand pieces a bit less).

const TURN_MS = 80
const FIRST_TURN_MS = 800
const P = 1
const S = 2
const G = 3
const B = 4
const R = 5
const K = 6
const PROMO = 8 // +P = 9, +S = 10, +B = 12, +R = 13
const VALUE: Record<number, number> = {
  1: 100,
  2: 500,
  3: 600,
  4: 800,
  5: 1000,
  6: 0,
  9: 600,
  10: 600,
  12: 1100,
  13: 1300,
}
const LETTER: Record<number, string> = { 1: "P", 2: "S", 3: "G", 4: "B", 5: "R", 6: "K" }
const FROM_LETTER: Record<string, number> = { P, S, G, B, R, K }

const myId = parseInt(readline())
readline() // board size (5)
const ME = myId === 0 ? 1 : -1 // sign of our pieces

// board[r * 5 + c] (r = input line, c = input column): signed type.
const board = new Int8Array(25)
// hands[0] = player 0 (positive), hands[1] = player 1: counts per type.
const hands = [new Int8Array(7), new Int8Array(7)]
const handOf = (side: number) => hands[side > 0 ? 0 : 1]

const GOLD_STEPS = [
  [-1, 0],
  [-1, -1],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, 0],
]
const SILVER_STEPS = [
  [-1, 0],
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
]
const KING_STEPS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]
const ORTHO = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]
const DIAG = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
]

// Move: from (-1 = drop), to, piece (unsigned type moved or dropped), promote.
interface Move {
  from: number
  to: number
  type: number
  promote: boolean
}

function genMoves(side: number): Move[] {
  const out: Move[] = []
  const fwd = side > 0 ? 1 : -1 // multiplies dr (player 0 moves up: dr < 0)
  const far = side > 0 ? 0 : 4
  const add = (from: number, to: number, type: number) => {
    const fr = Math.floor(from / 5)
    const tr = Math.floor(to / 5)
    const canPromote = type === P || type === S || type === B || type === R
    const inZone = fr === far || tr === far
    if (canPromote && inZone) {
      out.push({ from, to, type, promote: true })
      if (type !== P) out.push({ from, to, type, promote: false })
    } else out.push({ from, to, type, promote: false })
  }
  for (let i = 0; i < 25; i++) {
    const v = board[i] * side
    if (v <= 0) continue
    const r = Math.floor(i / 5)
    const c = i % 5
    const step = (dr: number, dc: number) => {
      const rr = r + dr * fwd
      const cc = c + dc
      if (rr < 0 || rr > 4 || cc < 0 || cc > 4) return
      const t = rr * 5 + cc
      if (board[t] * side > 0) return
      add(i, t, v)
    }
    const slide = (dirs: number[][]) => {
      for (const [dr, dc] of dirs) {
        let rr = r + dr
        let cc = c + dc
        while (rr >= 0 && rr <= 4 && cc >= 0 && cc <= 4) {
          const t = rr * 5 + cc
          if (board[t] * side > 0) break
          add(i, t, v)
          if (board[t] !== 0) break
          rr += dr
          cc += dc
        }
      }
    }
    if (v === K) for (const [dr, dc] of KING_STEPS) step(dr, dc)
    else if (v === G || v === P + PROMO || v === S + PROMO) for (const [dr, dc] of GOLD_STEPS) step(dr, dc)
    else if (v === S) for (const [dr, dc] of SILVER_STEPS) step(dr, dc)
    else if (v === P) step(-1, 0)
    else if (v === B || v === B + PROMO) {
      slide(DIAG)
      if (v > PROMO) for (const [dr, dc] of ORTHO) step(dr, dc)
    } else if (v === R || v === R + PROMO) {
      slide(ORTHO)
      if (v > PROMO) for (const [dr, dc] of DIAG) step(dr, dc)
    }
  }
  const hand = handOf(side)
  for (let type = 1; type <= 5; type++) {
    if (!hand[type]) continue
    for (let t = 0; t < 25; t++) {
      if (board[t] !== 0) continue
      if (type === P) {
        if (Math.floor(t / 5) === far) continue
        let pawnOnFile = false
        for (let rr = 0; rr < 5; rr++) if (board[rr * 5 + (t % 5)] === P * side) pawnOnFile = true
        if (pawnOnFile) continue
      }
      out.push({ from: -1, to: t, type, promote: false })
    }
  }
  return out
}

// Applies m for side; returns the captured signed piece (0 if none).
function apply(m: Move, side: number): number {
  const captured = board[m.to]
  if (m.from < 0) {
    handOf(side)[m.type]--
    board[m.to] = m.type * side
  } else {
    board[m.from] = 0
    board[m.to] = (m.promote ? m.type + PROMO : m.type) * side
  }
  if (captured) {
    const base = Math.abs(captured) > PROMO ? Math.abs(captured) - PROMO : Math.abs(captured)
    if (base !== K) handOf(side)[base]++
  }
  return captured
}
function revert(m: Move, side: number, captured: number) {
  if (captured) {
    const base = Math.abs(captured) > PROMO ? Math.abs(captured) - PROMO : Math.abs(captured)
    if (base !== K) handOf(side)[base]--
  }
  if (m.from < 0) {
    handOf(side)[m.type]++
    board[m.to] = 0
  } else {
    board[m.from] = m.type * side
    board[m.to] = captured
  }
}

function evaluate(side: number): number {
  let s = 0
  for (let i = 0; i < 25; i++) if (board[i]) s += Math.sign(board[i]) * VALUE[Math.abs(board[i])]
  for (let t = 1; t <= 5; t++) s += (hands[0][t] - hands[1][t]) * VALUE[t] * 0.9
  return s * side
}

class Timeout extends Error {}
let deadline = 0
let nodes = 0
const WIN = 1000000

function negamax(side: number, depth: number, alpha: number, beta: number, ply: number): number {
  if ((++nodes & 255) === 0 && Date.now() > deadline) throw new Timeout()
  if (depth === 0) return evaluate(side)
  const moves = genMoves(side)
  moves.sort((a, b) => Math.abs(board[b.to]) - Math.abs(board[a.to]))
  let best = -Infinity
  for (const m of moves) {
    const captured = apply(m, side)
    const v = Math.abs(captured) === K ? WIN - ply : -negamax(-side, depth - 1, -beta, -alpha, ply + 1)
    revert(m, side, captured)
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best === -Infinity ? -WIN + ply : best
}

const moveName = (m: Move) =>
  m.from < 0
    ? `${LETTER[m.type]}*${5 - (m.to % 5)}${Math.floor(m.to / 5) + 1}`
    : `${5 - (m.from % 5)}${Math.floor(m.from / 5) + 1}${5 - (m.to % 5)}${Math.floor(m.to / 5) + 1}${m.promote ? "+" : ""}`

let firstTurn = true
while (true) {
  const rows: string[] = []
  for (let r = 0; r < 5; r++) rows.push(readline().trim())
  const h0 = readline().trim()
  const h1 = readline().trim()
  readline() // rolled die: already applied to the legal list
  readline() // last action
  const n = parseInt(readline())
  const actions: string[] = []
  for (let i = 0; i < n; i++) actions.push(readline().trim())
  deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  for (let r = 0; r < 5; r++) {
    let c = 0
    let promoted = false
    for (const ch of rows[r]) {
      if (ch === "+") {
        promoted = true
        continue
      }
      const i = r * 5 + c
      if (ch === ".") board[i] = 0
      else {
        const type = FROM_LETTER[ch.toUpperCase()] + (promoted ? PROMO : 0)
        board[i] = ch === ch.toUpperCase() ? type : -type
      }
      promoted = false
      c++
    }
  }
  hands[0].fill(0)
  hands[1].fill(0)
  for (const ch of h0) if (ch !== "-") hands[0][FROM_LETTER[ch.toUpperCase()]]++
  for (const ch of h1) if (ch !== "-") hands[1][FROM_LETTER[ch.toUpperCase()]]++

  const wanted = new Set(actions.map(a => a.toUpperCase()))
  const legal = genMoves(ME).filter(m => wanted.has(moveName(m).toUpperCase()))
  if (legal.length !== actions.length) console.error(`desync: engine ${legal.length} of ${actions.length}`)
  let best: Move | null = legal[0] ?? null
  let reached = 0
  nodes = 0
  try {
    let order = legal
    for (let depth = 1; depth <= 20 && legal.length > 1; depth++) {
      let alpha = -Infinity
      let depthBest = order[0]
      for (const m of order) {
        const captured = apply(m, ME)
        const v = -negamax(-ME, depth - 1, -Infinity, -alpha, 1)
        revert(m, ME, captured)
        if (v > alpha) {
          alpha = v
          depthBest = m
        }
      }
      best = depthBest
      reached = depth
      order = [depthBest, ...order.filter(m => m !== depthBest)]
      if (Math.abs(alpha) > WIN / 2) break
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  const match = best ? actions.find(a => a.toUpperCase() === moveName(best!).toUpperCase()) : undefined
  console.log(match ?? actions[0])
}
