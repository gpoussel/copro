// 🎮 CodinGame Multiplayer - abalone
// https://www.codingame.com/multiplayer/bot-programming/abalone
//
// Hex board of side 5 (rows of 5..9..5). Move 1-3 aligned marbles one step;
// in-line moves may push (sumito) a shorter enemy column, marbles pushed off
// are lost; 6 off wins. The coordinate order and the direction labels are
// only shown in an image, so on the first turn the bot tries every mapping
// and keeps the one under which every referee move is legal.
// Negamax alpha-beta; eval = marbles off, centrality, cohesion.

const TURN_MS = 60
const FIRST_TURN_MS = 800
const myId = parseInt(readline()) // 1 white, 2 black
const ME = myId
const THEM = 3 - myId

// Axial coordinates: r = row - 4, q = index - 4 + max(0, 4 - row).
const AX: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
]
const rowLen = (row: number) => 9 - Math.abs(row - 4)
const key = (q: number, r: number) => (q + 4) * 9 + (r + 4)
const onBoard = (q: number, r: number) => Math.abs(q) <= 4 && Math.abs(r) <= 4 && Math.abs(q + r) <= 4
const toAxial = (row: number, index: number): [number, number] => [index - 4 + Math.max(0, 4 - row), row - 4]

const board = new Int8Array(81) // by key(q, r): 0 empty, 1 white, 2 black
const cells: [number, number][] = []
for (let row = 0; row < 9; row++) for (let i = 0; i < rowLen(row); i++) cells.push(toAxial(row, i))

// Mapping fitted on real move lists (every game agreed): moves give
// (index, row) pairs, and direction label k moves along AX[DIR_MAP[k]].
const swapXY = true
const DIR_MAP = [0, 4, 3, 1, 5, 2]

type Move = { line: [number, number][]; d: [number, number] }

// Applies (or just checks) a move for `p`; returns captured count or -1.
function play(b: Int8Array, m: Move, p: number, apply: boolean): number {
  const [dq, dr] = m.d
  const line = m.line
  for (const [q, r] of line) if (!onBoard(q, r) || b[key(q, r)] !== p) return -1
  const n = line.length
  let inLine = n === 1
  if (n > 1) {
    const uq = line[1][0] - line[0][0]
    const ur = line[1][1] - line[0][1]
    inLine = (uq === dq && ur === dr) || (uq === -dq && ur === -dr)
  }
  if (!inLine) {
    for (const [q, r] of line) {
      const tq = q + dq
      const tr = r + dr
      if (!onBoard(tq, tr) || b[key(tq, tr)] !== 0) return -1
    }
    if (apply) {
      for (const [q, r] of line) b[key(q, r)] = 0
      for (const [q, r] of line) b[key(q + dq, r + dr)] = p
    }
    return 0
  }
  // In-line: find the front marble along d.
  let front = line[0]
  for (const c of line) if (c[0] * dq + c[1] * dr > front[0] * dq + front[1] * dr) front = c
  let fq = front[0] + dq
  let fr = front[1] + dr
  let enemies = 0
  while (onBoard(fq, fr) && b[key(fq, fr)] === 3 - p) {
    enemies++
    fq += dq
    fr += dr
  }
  if (enemies === 0) {
    if (!onBoard(fq, fr) || b[key(fq, fr)] !== 0) return -1
  } else {
    if (enemies >= n) return -1
    if (onBoard(fq, fr) && b[key(fq, fr)] !== 0) return -1
  }
  const captured = enemies > 0 && !onBoard(fq, fr) ? 1 : 0
  if (apply) {
    if (enemies > 0 && onBoard(fq, fr)) b[key(fq, fr)] = 3 - p
    for (const [q, r] of line) b[key(q, r)] = 0
    for (const [q, r] of line) b[key(q + dq, r + dr)] = p
  }
  return captured
}

function genMoves(b: Int8Array, p: number): Move[] {
  const out: Move[] = []
  const axes: [number, number][] = [
    [1, 0],
    [0, 1],
    [1, -1],
  ]
  for (const [q, r] of cells) {
    if (b[key(q, r)] !== p) continue
    const lines: [number, number][][] = [[[q, r]]]
    for (const [uq, ur] of axes) {
      const l: [number, number][] = [[q, r]]
      for (let k = 1; k < 3; k++) {
        const cq = q + uq * k
        const cr = r + ur * k
        if (!onBoard(cq, cr) || b[key(cq, cr)] !== p) break
        l.push([cq, cr])
        lines.push(l.slice())
      }
    }
    for (const line of lines) for (const d of AX) if (play(b, { line, d }, p, false) >= 0) out.push({ line, d })
  }
  return out
}

const CENTRE_DIST = (q: number, r: number) => Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r))
function evaluate(b: Int8Array, p: number, lost: number[]): number {
  let s = (lost[3 - p] - lost[p]) * 1000
  for (const [q, r] of cells) {
    const v = b[key(q, r)]
    if (v === 0) continue
    let near = 0
    for (const [dq, dr] of AX) if (onBoard(q + dq, r + dr) && b[key(q + dq, r + dr)] === v) near++
    const val = (4 - CENTRE_DIST(q, r)) * 10 + near * 2
    s += v === p ? val : -val
  }
  return s
}

class Timeout extends Error {}
let deadline = 0
let nodes = 0

function negamax(b: Int8Array, p: number, depth: number, alpha: number, beta: number, lost: number[]): number {
  if ((++nodes & 255) === 0 && Date.now() > deadline) throw new Timeout()
  if (lost[p] >= 6) return -100000
  if (lost[3 - p] >= 6) return 100000
  if (depth === 0) return evaluate(b, p, lost)
  const moves = genMoves(b, p)
  let best = -Infinity
  for (const m of moves) {
    const t = new Int8Array(b)
    const c = play(t, m, p, true)
    lost[3 - p] += c
    const v = -negamax(t, 3 - p, depth - 1, -beta, -alpha, lost)
    lost[3 - p] -= c
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best === -Infinity ? evaluate(b, p, lost) : best
}

function parseMove(v: number[]): Move | null {
  const [a0, a1, b0, b1, label] = v
  const [r1, i1, r2, i2] = swapXY ? [a1, a0, b1, b0] : [a0, a1, b0, b1]
  if (r1 < 0 || r1 > 8 || r2 < 0 || r2 > 8) return null
  const A = toAxial(r1, i1)
  const B = toAxial(r2, i2)
  const steps = Math.max(Math.abs(B[0] - A[0]), Math.abs(B[1] - A[1]), Math.abs(B[0] + B[1] - A[0] - A[1]))
  const line: [number, number][] = []
  for (let k = 0; k <= steps; k++) {
    line.push([A[0] + ((B[0] - A[0]) / Math.max(steps, 1)) * k, A[1] + ((B[1] - A[1]) / Math.max(steps, 1)) * k])
  }
  if (line.some(([q, r]) => !Number.isInteger(q) || !Number.isInteger(r))) return null
  return { line, d: AX[DIR_MAP[label]] }
}

let firstTurn = true
const lost = [0, 0, 0] // marbles lost per player id
while (true) {
  const [myScore, oppScore] = readline().split(" ").map(Number)
  const rows: string[] = []
  for (let r = 0; r < 9; r++) rows.push(readline().trim())
  readline() // opponent's last move
  const n = parseInt(readline())
  const raw: number[][] = []
  for (let i = 0; i < n; i++) raw.push(readline().trim().split(" ").map(Number))
  deadline = Date.now() + (firstTurn ? FIRST_TURN_MS : TURN_MS)
  board.fill(0)
  for (let row = 0; row < 9; row++) {
    for (let i = 0; i < rows[row].length; i++) {
      const [q, r] = toAxial(row, i)
      board[key(q, r)] = rows[row].charCodeAt(i) - 48
    }
  }
  // Scores are the marbles each side pushed off.
  lost[THEM] = myScore
  lost[ME] = oppScore
  const allLegal = () =>
    raw.every(v => {
      const m = parseMove(v)
      return m !== null && play(board, m, ME, false) >= 0
    })
  if (firstTurn && !allLegal()) console.error("desync: a referee move is illegal for the engine")
  firstTurn = false
  const legal = raw.map(v => parseMove(v))
  let best = 0
  let reached = 0
  nodes = 0
  try {
    for (let depth = 1; depth <= 10; depth++) {
      let alpha = -Infinity
      let depthBest = best
      for (let k = 0; k < legal.length; k++) {
        const m = legal[k]
        if (!m) continue
        const t = new Int8Array(board)
        const c = play(t, m, ME, true)
        if (c < 0) continue
        lost[THEM] += c
        const v = -negamax(t, THEM, depth - 1, -Infinity, -alpha, lost)
        lost[THEM] -= c
        if (v > alpha) {
          alpha = v
          depthBest = k
        }
      }
      best = depthBest
      reached = depth
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
    lost[THEM] = myScore
    lost[ME] = oppScore
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  console.log(raw[best].join(" "))
}
