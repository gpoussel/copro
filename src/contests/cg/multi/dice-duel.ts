// 🎮 CodinGame Multiplayer - dice-duel
// https://www.codingame.com/multiplayer/bot-programming/dice-duel
// Referee: https://github.com/eulerscheZahl/Dice-Duel
//
// 8x8, 8 dice each. A die rolls exactly `top` steps (U = y+1, R = x+1),
// never revisiting a cell nor crossing a die; the last step may capture an
// enemy die. No legal move = loss; at the end, more dice wins.
// Die state (input order): top, front, bottom, back, left, right; rolling U
// shifts top <- front <- bottom <- back <- top, R: top <- left <- bottom <-
// right <- top. In league 2 (Legend) a capture needs top(after roll) + top of
// the captured die = 7: set SEVEN_RULE when the bot reaches it.

const SEVEN_RULE = false
const TURN_MS = 40
const FIRST_TURN_MS = 40

interface Die {
  mine: boolean
  x: number
  y: number
  s: number[] // top front bottom back left right
}

function rollState(s: number[], path: string): number[] {
  const t = s.slice()
  for (const ch of path) {
    const times = ch === "U" ? 1 : ch === "D" ? 3 : ch === "R" ? 1 : 3
    for (let k = 0; k < times; k++) {
      if (ch === "U" || ch === "D") {
        const tmp = t[0]
        t[0] = t[1]
        t[1] = t[2]
        t[2] = t[3]
        t[3] = tmp
      } else {
        const tmp = t[0]
        t[0] = t[4]
        t[4] = t[2]
        t[2] = t[5]
        t[5] = tmp
      }
    }
  }
  return t
}

interface Move {
  die: Die
  path: string
  x: number
  y: number
  state: number[]
  capture: Die | null
}

const DX = [0, 1, 0, -1]
const DY = [1, 0, -1, 0]
const DN = ["U", "R", "D", "L"]

// All moves of `side`, deduplicated by (end cell, orientation).
function genMoves(dice: Die[], mine: boolean): Move[] {
  const occupied = new Map<number, Die>()
  for (const d of dice) occupied.set(d.x * 8 + d.y, d)
  const out: Move[] = []
  for (const die of dice) {
    if (die.mine !== mine) continue
    const top = die.s[0]
    const seen = new Set<string>()
    const visited = new Uint8Array(64)
    visited[die.x * 8 + die.y] = 1
    const rec = (x: number, y: number, path: string) => {
      if (path.length === top) {
        const other = occupied.get(x * 8 + y)
        const state = rollState(die.s, path)
        if (other && SEVEN_RULE && state[0] + other.s[0] !== 7) return
        const key = `${x},${y},${state[0]},${state[1]}`
        if (seen.has(key)) return
        seen.add(key)
        out.push({ die, path, x, y, state, capture: other ?? null })
        return
      }
      for (let d = 0; d < 4; d++) {
        const nx = x + DX[d]
        const ny = y + DY[d]
        if (nx < 0 || nx > 7 || ny < 0 || ny > 7) continue
        const k = nx * 8 + ny
        if (visited[k]) continue
        const other = occupied.get(k)
        if (other) {
          // Only the last step may land on a die, and only an enemy one.
          if (other.mine === mine || path.length + 1 !== top) continue
        }
        visited[k] = 1
        rec(nx, ny, path + DN[d])
        visited[k] = 0
      }
    }
    rec(die.x, die.y, "")
  }
  return out
}

function applyMove(dice: Die[], m: Move): Die[] {
  return dice.filter(d => d !== m.capture).map(d => (d === m.die ? { mine: d.mine, x: m.x, y: m.y, s: m.state } : d))
}

// Our move's value: captures, minus what the opponent can take back.
function score(dice: Die[], m: Move): number {
  const after = applyMove(dice, m)
  let s = m.capture ? 100 : 0
  const replies = genMoves(after, false)
  if (replies.length === 0) return 10000 // the opponent cannot move: we win
  const threatened = new Set<Die>()
  for (const r of replies) if (r.capture) threatened.add(r.capture)
  if (threatened.size) s -= 90 + 5 * threatened.size
  // Mobility as a tie-breaker (fewer enemy options, more of ours).
  s -= replies.length * 0.05
  return s
}

let firstTurn = true
while (true) {
  const n = parseInt(readline())
  const deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  const dice: Die[] = []
  for (let i = 0; i < n; i++) {
    const p = readline().trim().split(" ")
    dice.push({
      mine: p[0] === "0",
      x: p[1].charCodeAt(0) - 65,
      y: parseInt(p[1].slice(1)) - 1,
      s: p.slice(2, 8).map(Number),
    })
  }
  const moves = genMoves(dice, true)
  // Captures first so a timeout still leaves a good candidate.
  moves.sort((a, b) => (b.capture ? 1 : 0) - (a.capture ? 1 : 0))
  let best = moves[0]
  let bestScore = -Infinity
  let evaluated = 0
  for (const m of moves) {
    if (Date.now() > deadline) break
    evaluated++
    const s = score(dice, m)
    if (s > bestScore) {
      bestScore = s
      best = m
    }
  }
  console.error(`moves=${moves.length} evaluated=${evaluated} score=${bestScore.toFixed(1)}`)
  console.log(`${String.fromCharCode(65 + best.die.x)}${best.die.y + 1} ${best.path}`)
}
