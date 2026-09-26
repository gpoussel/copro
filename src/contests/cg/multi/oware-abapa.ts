// 🎮 CodinGame Multiplayer - oware-abapa
// https://www.codingame.com/multiplayer/bot-programming/oware-abapa
//
// Negamax alpha-beta with iterative deepening. Houses 0-5 are the player to
// move's, 6-11 the opponent's, sowing goes up the indexes. Scores are not
// given: our captures come from our own moves, the opponent's are the rest.

const FIRST_TURN_MS = 800
const TURN_MS = 40
const TOTAL = 48
const WIN_SCORE = 25

class Timeout extends Error {}
let deadline = 0
let nodes = 0

// Sows house h (0-5) of `pits` (player to move owns 0-5) into `out` and
// returns the seeds captured, or -1 when the move is illegal.
function sow(pits: Int8Array, h: number, out: Int8Array): number {
  let seeds = pits[h]
  if (seeds === 0) return -1
  out.set(pits)
  out[h] = 0
  let i = h
  while (seeds > 0) {
    i = (i + 1) % 12
    if (i === h) continue // the starting house is skipped
    out[i]++
    seeds--
  }
  let captured = 0
  let j = i
  while (j >= 6 && (out[j] === 2 || out[j] === 3)) {
    captured += out[j]
    j--
  }
  if (captured > 0) {
    // A grand slam (taking every opponent seed) cancels the capture.
    let left = 0
    for (let k = 6; k < 12; k++) left += out[k]
    for (let k = j + 1; k <= i; k++) left -= out[k]
    if (left === 0) captured = 0
    else for (let k = j + 1; k <= i; k++) out[k] = 0
  }
  // The opponent must be able to play.
  let oppSeeds = 0
  for (let k = 6; k < 12; k++) oppSeeds += out[k]
  if (oppSeeds === 0) return -1
  return captured
}

// Swap sides so the next player owns 0-5.
function flip(src: Int8Array, dst: Int8Array) {
  for (let k = 0; k < 6; k++) {
    dst[k] = src[k + 6]
    dst[k + 6] = src[k]
  }
}

const buffers: Int8Array[] = Array.from({ length: 128 }, () => new Int8Array(12))
const flipped: Int8Array[] = Array.from({ length: 128 }, () => new Int8Array(12))

// Value for the player to move, who has `mine` captured vs `theirs`.
function negamax(
  pits: Int8Array,
  mine: number,
  theirs: number,
  depth: number,
  alpha: number,
  beta: number,
  ply: number
): number {
  if ((++nodes & 1023) === 0 && Date.now() > deadline) throw new Timeout()
  if (mine >= WIN_SCORE) return 1000 + mine - theirs
  if (theirs >= WIN_SCORE) return -1000 + mine - theirs
  if (depth === 0) return mine - theirs
  const out = buffers[ply]
  const next = flipped[ply]
  let best = -Infinity
  let any = false
  for (let h = 0; h < 6; h++) {
    const got = sow(pits, h, out)
    if (got < 0) continue
    any = true
    flip(out, next)
    const v = -negamax(next, theirs, mine + got, depth - 1, -beta, -alpha, ply + 1)
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  if (!any) {
    // No move can feed the opponent: the player to move takes every seed.
    let rest = 0
    for (let k = 0; k < 12; k++) rest += pits[k]
    const m = mine + rest
    return m > theirs ? 1000 + m - theirs : m < theirs ? -1000 + m - theirs : 0
  }
  return best
}

function think(pits: Int8Array, mine: number, theirs: number): number {
  let bestMove = -1
  const out = new Int8Array(12)
  const next = new Int8Array(12)
  const legal: number[] = []
  for (let h = 0; h < 6; h++) if (sow(pits, h, out) >= 0) legal.push(h)
  if (legal.length === 0) return pits.findIndex((s, i) => i < 6 && s > 0)
  bestMove = legal[0]
  let reached = 0
  nodes = 0
  let order = legal
  try {
    for (let depth = 1; depth <= 60; depth++) {
      let alpha = -Infinity
      let depthBest = order[0]
      for (const h of order) {
        const got = sow(pits, h, out)
        flip(out, next)
        const v = -negamax(next, theirs, mine + got, depth - 1, -Infinity, -alpha, 1)
        if (v > alpha) {
          alpha = v
          depthBest = h
        }
      }
      bestMove = depthBest
      reached = depth
      order = [depthBest, ...order.filter(h => h !== depthBest)]
      if (Math.abs(alpha) >= 900) break // decided
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  return bestMove
}

// --- Game loop ----------------------------------------------------------------

let firstTurn = true
let myScore = 0
const pits = new Int8Array(12)
const after = new Int8Array(12)

while (true) {
  const seeds = readline().split(" ").map(Number)
  deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  let onBoard = 0
  for (let k = 0; k < 12; k++) {
    pits[k] = seeds[k]
    onBoard += seeds[k]
  }
  const oppScore = TOTAL - onBoard - myScore
  const h = think(pits, myScore, oppScore)
  const got = sow(pits, h, after)
  if (got > 0) myScore += got
  console.log(h)
}
