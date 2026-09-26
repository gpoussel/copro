// 🎮 CodinGame Multiplayer - bandas
// https://www.codingame.com/multiplayer/bot-programming/bandas
// Referee: https://github.com/Oli8/CG-bandas (the move code is ported as is)
//
// 8x8 full of pawns. A turn moves every own pawn one step in a direction,
// pushing whatever stands in front (recursively); pawns pushed off the grid
// or into a hole die. Empty outer lines/columns then become holes. Win by
// wiping the opponent, else more pawns after 200 turns.
// Negamax alpha-beta; eval = pawn difference + centrality.

const TURN_MS = 80
const EMPTY = 0
const HOLE = 3
const MAX_TURNS = 200
const DIRS = ["UP", "RIGHT", "DOWN", "LEFT"]
const DY = [-1, 0, 1, 0]
const DX = [0, 1, 0, -1]

const myId = parseInt(readline())
const H = parseInt(readline())
const W = parseInt(readline())
const ME = myId + 1

function single(g: Int8Array, p: number, y: number, x: number, d: number) {
  const ny = y + DY[d]
  const nx = x + DX[d]
  if (ny < 0 || ny >= H || nx < 0 || nx >= W) {
    g[y * W + x] = EMPTY // pushed off the grid
    return
  }
  const next = g[ny * W + nx]
  if (next === 1 || next === 2) {
    single(g, next, ny, nx, d)
    single(g, p, y, x, d)
  } else {
    if (next !== HOLE) g[ny * W + nx] = p
    g[y * W + x] = EMPTY
  }
}

function move(g: Int8Array, p: number, d: number) {
  if (d === 0) {
    for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) if (g[y * W + x] === p) single(g, p, y, x, d)
  } else if (d === 2) {
    for (let x = 0; x < W; x++) for (let y = H - 1; y >= 0; y--) if (g[y * W + x] === p) single(g, p, y, x, d)
  } else if (d === 1) {
    for (let y = 0; y < H; y++) for (let x = W - 1; x >= 0; x--) if (g[y * W + x] === p) single(g, p, y, x, d)
  } else {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y * W + x] === p) single(g, p, y, x, d)
  }
  shrink(g)
}

// Outer lines/columns without pawns become holes (fully dead ones are skipped).
function shrink(g: Int8Array) {
  const line = (y: number): boolean => {
    let dead = true
    for (let x = 0; x < W; x++) {
      const v = g[y * W + x]
      if (v !== HOLE) dead = false
      if (v === 1 || v === 2) return false
    }
    if (!dead) for (let x = 0; x < W; x++) g[y * W + x] = HOLE
    return true
  }
  const column = (x: number): boolean => {
    let dead = true
    for (let y = 0; y < H; y++) {
      const v = g[y * W + x]
      if (v !== HOLE) dead = false
      if (v === 1 || v === 2) return false
    }
    if (!dead) for (let y = 0; y < H; y++) g[y * W + x] = HOLE
    return true
  }
  for (let y = 0; y < H; y++) if (!line(y)) break
  for (let y = H - 1; y >= 0; y--) if (!line(y)) break
  for (let x = 0; x < W; x++) if (!column(x)) break
  for (let x = W - 1; x >= 0; x--) if (!column(x)) break
}

function count(g: Int8Array, p: number): number {
  let n = 0
  for (let i = 0; i < g.length; i++) if (g[i] === p) n++
  return n
}

// Pawns far from the live area's border are safer.
function evaluate(g: Int8Array, p: number): number {
  let minY = H
  let maxY = -1
  let minX = W
  let maxX = -1
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (g[y * W + x] !== HOLE) {
        if (y < minY) minY = y
        if (y > maxY) maxY = y
        if (x < minX) minX = x
        if (x > maxX) maxX = x
      }
    }
  }
  let s = 0
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = g[y * W + x]
      if (v !== 1 && v !== 2) continue
      const edge = Math.min(y - minY, maxY - y, x - minX, maxX - x)
      const val = 100 + Math.min(edge, 3) * 4
      s += v === p ? val : -val
    }
  }
  return s
}

class Timeout extends Error {}
let deadline = 0
let nodes = 0
const WIN = 1000000

function negamax(g: Int8Array, p: number, depth: number, alpha: number, beta: number, turn: number): number {
  if ((++nodes & 1023) === 0 && Date.now() > deadline) throw new Timeout()
  const mine = count(g, p)
  const theirs = count(g, 3 - p)
  if (theirs === 0) return WIN
  if (mine === 0) return -WIN
  if (turn >= MAX_TURNS) return mine > theirs ? WIN / 2 : mine < theirs ? -WIN / 2 : 0
  if (depth === 0) return evaluate(g, p)
  let best = -Infinity
  for (let d = 0; d < 4; d++) {
    const t = new Int8Array(g)
    move(t, p, d)
    const v = -negamax(t, 3 - p, depth - 1, -beta, -alpha, turn + 1)
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best
}

let turn = myId // our turns are myId, myId + 2, ...
const grid = new Int8Array(H * W)
while (true) {
  for (let y = 0; y < H; y++) {
    const cells = readline().trim().split(" ")
    for (let x = 0; x < W; x++) {
      const c = cells[x]
      grid[y * W + x] = c === "0" ? 1 : c === "1" ? 2 : c === "x" ? HOLE : EMPTY
    }
  }
  deadline = Date.now() + TURN_MS
  let bestDir = 0
  let reached = 0
  nodes = 0
  try {
    for (let depth = 1; depth <= 30; depth++) {
      let alpha = -Infinity
      let depthBest = 0
      for (let d = 0; d < 4; d++) {
        const t = new Int8Array(grid)
        move(t, ME, d)
        const v = -negamax(t, 3 - ME, depth - 1, -Infinity, -alpha, turn + 1)
        if (v > alpha) {
          alpha = v
          depthBest = d
        }
      }
      bestDir = depthBest
      reached = depth
      if (Math.abs(alpha) >= WIN) break
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e
  }
  console.error(`depth=${reached} nodes=${nodes}`)
  turn += 2
  console.log(DIRS[bestDir])
}
