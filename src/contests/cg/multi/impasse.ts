// 🎮 CodinGame Multiplayer - impasse
// https://www.codingame.com/multiplayer/bot-programming/impasse
//
// Remove all your checkers first. Singles slide diagonally forward, doubles
// diagonally backward; a double reaching the nearest row bears off its crown,
// a single reaching the furthest row gets crowned. The referee lists the legal
// moves (1–3 coordinates); each is applied with its automatic effects and
// scored: fewer own checkers, singles far forward, doubles close to home.

// board[r * 8 + c], r = 0 top line (rank 8): +1 / +2 our single / double, −1 / −2 theirs.
const board = new Int8Array(64)
const myColor = readline().trim()
// White starts at the bottom: its furthest row is rank 8 (r = 0).
const farRow = (side: number) => (side > 0 === (myColor === "w") ? 0 : 7)
const nearRow = (side: number) => 7 - farRow(side)
const sq = (s: string) => (8 - parseInt(s[1])) * 8 + (s.charCodeAt(0) - 97)

// In an impasse every legal move is a removal (+ an optional crown); that is
// decided on the whole move list: no slide lands on an empty square and no
// move is a transpose (own double onto an adjacent own single).
let impasse = false
function detectImpasse(b: Int8Array, moves: string[]) {
  impasse = !moves.some(m => {
    if (m.length < 4) return false
    const from = sq(m.slice(0, 2))
    const to = sq(m.slice(2, 4))
    const adjacent = Math.abs((from >> 3) - (to >> 3)) <= 1 && Math.abs((from & 7) - (to & 7)) <= 1
    return b[to] === 0 || (b[from] === 2 && b[to] === 1 && adjacent)
  })
}

function apply(b: Int8Array, move: string) {
  const coords: number[] = []
  for (let k = 0; k + 1 < move.length; k += 2) coords.push(sq(move.slice(k, k + 2)))
  let used = 0
  if (!impasse && coords.length >= 2) {
    const from = coords[0]
    const to = coords[1]
    if (b[from] === 2 && b[to] === 1) {
      b[from] = 1 // transpose: the crown moves onto the single
      b[to] = 2
    } else {
      b[to] = b[from]
      b[from] = 0
    }
    used = 2
  } else {
    const at = coords[0]
    b[at] = b[at] === 2 ? 1 : 0 // impasse removal
    used = 1
  }
  // Bear off: a double on our nearest row loses its crown.
  for (let c = 0; c < 8; c++) if (b[nearRow(1) * 8 + c] === 2) b[nearRow(1) * 8 + c] = 1
  // Crown with the given single.
  if (coords.length > used) {
    const crown = coords[used]
    for (let c = 0; c < 8; c++) {
      const f = farRow(1) * 8 + c
      if (b[f] === 1 && f !== crown) {
        b[crown] = 0
        b[f] = 2
        break
      }
    }
  }
}

function evaluate(b: Int8Array): number {
  let s = 0
  for (let i = 0; i < 64; i++) {
    const v = b[i]
    if (v === 0) continue
    const side = v > 0 ? 1 : -1
    const r = i >> 3
    const toFar = Math.abs(r - farRow(side))
    const toNear = Math.abs(r - nearRow(side))
    const checkers = Math.abs(v)
    // Every checker left costs; progress towards the next conversion helps.
    const value = -12 * checkers + (checkers === 1 ? 7 - toFar : 7 - toNear)
    s += side * value
  }
  return s
}

while (true) {
  const rows: string[] = []
  for (let r = 0; r < 8; r++) rows.push(readline())
  readline() // last move
  const n = parseInt(readline())
  const moves: string[] = []
  for (let i = 0; i < n; i++) moves.push(readline().trim())
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const ch = rows[r][c]
      const lower = ch.toLowerCase()
      const v = ch === "." ? 0 : ch === lower ? 1 : 2
      board[r * 8 + c] = lower === myColor ? v : -v
    }
  }
  detectImpasse(board, moves)
  let best = moves[0]
  let bestScore = -Infinity
  for (const m of moves) {
    const b = new Int8Array(board)
    apply(b, m)
    const s = evaluate(b)
    if (s > bestScore) {
      bestScore = s
      best = m
    }
  }
  console.error(`moves=${n} score=${bestScore}`)
  console.log(best)
}
