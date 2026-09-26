// 🎮 CodinGame Multiplayer - amazons
// https://www.codingame.com/multiplayer/bot-programming/amazons
//
// Move an amazon like a queen, then shoot a wall like a queen from where it
// landed; no move = loss. Two games per match with colours swapped, so the
// colour is re-read every turn. One-ply search over every move with a
// territory evaluation: queen-move BFS distances from both sides, each empty
// square counts for whoever reaches it first.

const FIRST_TURN_MS = 800
const TURN_MS = 85
const EMPTY = 0
const MINE = 1
const THEIRS = 2
const WALL = 3

let N = 8
let SQ = 64
const DR = [-1, -1, -1, 0, 0, 1, 1, 1]
const DC = [-1, 0, 1, -1, 1, -1, 0, 1]
const board = new Int8Array(100)

// Multi-source queen-move BFS: dist[i] = moves needed by `side` to reach i.
const queue = new Int16Array(100)
function queenDistances(b: Int8Array, side: number, dist: Uint8Array) {
  dist.fill(255)
  let head = 0
  let tail = 0
  for (let i = 0; i < SQ; i++) {
    if (b[i] === side) {
      dist[i] = 0
      queue[tail++] = i
    }
  }
  while (head < tail) {
    const i = queue[head++]
    const r = Math.floor(i / N)
    const c = i % N
    const nd = dist[i] + 1
    for (let d = 0; d < 8; d++) {
      let rr = r + DR[d]
      let cc = c + DC[d]
      while (rr >= 0 && rr < N && cc >= 0 && cc < N) {
        const j = rr * N + cc
        if (b[j] !== EMPTY) break
        if (dist[j] > nd) {
          dist[j] = nd
          queue[tail++] = j
        }
        rr += DR[d]
        cc += DC[d]
      }
    }
  }
}

const distMine = new Uint8Array(100)
const distTheirs = new Uint8Array(100)
// Territory after our move (the opponent moves next, so ties lean to it).
function evaluate(b: Int8Array): number {
  queenDistances(b, MINE, distMine)
  queenDistances(b, THEIRS, distTheirs)
  let score = 0
  for (let i = 0; i < SQ; i++) {
    if (b[i] !== EMPTY) continue
    const m = distMine[i]
    const t = distTheirs[i]
    if (m < t) score += 1
    else if (t < m) score -= 1
    else if (m !== 255) score -= 0.2
  }
  return score
}

// Visits every square reachable from i by a queen move (stopping at pieces).
function slides(b: Int8Array, i: number, visit: (j: number) => void) {
  const r = Math.floor(i / N)
  const c = i % N
  for (let d = 0; d < 8; d++) {
    let rr = r + DR[d]
    let cc = c + DC[d]
    while (rr >= 0 && rr < N && cc >= 0 && cc < N) {
      const j = rr * N + cc
      if (b[j] !== EMPTY) break
      visit(j)
      rr += DR[d]
      cc += DC[d]
    }
  }
}

class Timeout extends Error {}

function think(deadline: number): [number, number, number] | null {
  let best: [number, number, number] | null = null
  let bestScore = -Infinity
  let evaluated = 0
  try {
    for (let from = 0; from < SQ; from++) {
      if (board[from] !== MINE) continue
      slides(board, from, to => {
        board[from] = EMPTY
        board[to] = MINE
        slides(board, to, wall => {
          if ((++evaluated & 63) === 0 && Date.now() > deadline) throw new Timeout()
          board[wall] = WALL
          const s = evaluate(board)
          board[wall] = EMPTY
          if (s > bestScore) {
            bestScore = s
            best = [from, to, wall]
          }
        })
        board[to] = EMPTY
        board[from] = MINE
      })
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
    // Restore any amazon left mid-move by the interrupted loops.
    board.set(saved.subarray(0, SQ))
  }
  console.error(`evaluated=${evaluated} score=${bestScore.toFixed(1)}`)
  return best
}

// --- Game loop ----------------------------------------------------------------

N = parseInt(readline())
SQ = N * N
const saved = new Int8Array(100)
let firstTurn = true
// "d8": column letter, rank counted from the bottom (rows arrive top first).
const sqName = (i: number) => String.fromCharCode(97 + (i % N)) + String(N - Math.floor(i / N))

while (true) {
  const color = readline().trim()
  const rows: string[] = []
  for (let r = 0; r < N; r++) rows.push(readline())
  const deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  firstTurn = false
  readline() // last action
  const count = parseInt(readline())
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const ch = rows[r][c]
      board[r * N + c] = ch === "." ? EMPTY : ch === "-" ? WALL : ch === color ? MINE : THEIRS
    }
  }
  saved.set(board)
  const move = count > 0 ? think(deadline) : null
  console.log(move ? sqName(move[0]) + sqName(move[1]) + sqName(move[2]) : "random")
}
