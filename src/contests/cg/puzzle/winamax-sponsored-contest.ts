// 🎮 CodinGame Puzzle - winamax-sponsored-contest (Winamax Sponsored Contest)
// https://www.codingame.com/training/hard/winamax-sponsored-contest
//
// Golf-routing constraint puzzle with a UNIQUE solution. Route every ball to a
// distinct hole with non-crossing arrows.
//
// A ball with number N is hit in strokes of forced length N, N-1, N-2, ... and
// stops the moment it lands on a hole (a stroke that would reach length 0
// without landing on a hole is a dead path). Each stroke direction is free.
// An arrow fills the cells from the ball's position up to but NOT including the
// landing cell. Filled cells may fly OVER water, but never sit on a hole or on
// another ball's start, and no two filled cells (within or across paths) may
// overlap. A landing cell must be in-grid and on grass or a hole.
//
// Approach: for each ball enumerate every valid stroke-path to a hole (DFS over
// the 4 directions, depth <= 9), then assign disjoint paths to balls by
// backtracking with a dynamic most-constrained-variable (MRV) heuristic.

const [width, height] = readline().split(" ").map(Number)

// Cell kinds.
const GRASS = 0
const WATER = 1
const BALL = 2
const HOLE = 3

const kind = new Uint8Array(width * height)
const isHole = new Uint8Array(width * height)
const isBall = new Uint8Array(width * height)
const holeId = new Int32Array(width * height).fill(-1)

interface Ball {
  r: number
  c: number
  n: number
}
const balls: Ball[] = []
let holeCount = 0

for (let r = 0; r < height; r++) {
  const row = readline()
  for (let c = 0; c < width; c++) {
    const ch = row.charAt(c)
    const idx = r * width + c
    if (ch === ".") {
      kind[idx] = GRASS
    } else if (ch === "X") {
      kind[idx] = WATER
    } else if (ch === "H") {
      kind[idx] = HOLE
      isHole[idx] = 1
      holeId[idx] = holeCount++
    } else {
      // digit 1..9 -> a ball
      kind[idx] = BALL
      isBall[idx] = 1
      balls.push({ r, c, n: ch.charCodeAt(0) - 48 })
    }
  }
}

// Directions: down, up, right, left.
const DIRS: ReadonlyArray<readonly [number, number, string]> = [
  [1, 0, "v"],
  [-1, 0, "^"],
  [0, 1, ">"],
  [0, -1, "<"],
]

interface Path {
  cells: number[] // filled cell indices (chars[i] belongs to cells[i])
  chars: string[]
  hole: number // destination hole id
}

// Enumerate every valid stroke-path from a ball to a hole.
function enumerate(ball: Ball): Path[] {
  const res: Path[] = []
  const origin = ball.r * width + ball.c
  const visited = new Uint8Array(width * height)
  const cellsAcc: number[] = []
  const charsAcc: string[] = []

  function rec(r: number, c: number, count: number): void {
    for (const [dr, dc, ch] of DIRS) {
      const lr = r + dr * count
      const lc = c + dc * count
      if (lr < 0 || lr >= height || lc < 0 || lc >= width) continue

      // Cells the arrow fills this stroke: positions 0..count-1 (landing excluded).
      const added: number[] = []
      let ok = true
      for (let k = 0; k < count; k++) {
        const idx = (r + dr * k) * width + (c + dc * k)
        if (isHole[idx]) {
          ok = false
          break
        }
        if (isBall[idx] && idx !== origin) {
          ok = false
          break
        }
        if (visited[idx]) {
          ok = false
          break
        }
        added.push(idx)
      }
      if (!ok) continue

      const lidx = lr * width + lc
      if (isHole[lidx]) {
        // Ball lands in a hole: path complete (it cannot move further).
        res.push({
          cells: cellsAcc.concat(added),
          chars: charsAcc.concat(added.map(() => ch)),
          hole: holeId[lidx],
        })
        continue
      }
      // Otherwise the ball must land on grass to keep going.
      if (kind[lidx] !== GRASS) continue
      if (count - 1 < 1) continue // would stall off a hole -> dead

      for (const idx of added) visited[idx] = 1
      const mark = cellsAcc.length
      for (const idx of added) {
        cellsAcc.push(idx)
        charsAcc.push(ch)
      }
      rec(lr, lc, count - 1)
      cellsAcc.length = mark
      charsAcc.length = mark
      for (const idx of added) visited[idx] = 0
    }
  }

  rec(ball.r, ball.c, ball.n)
  return res
}

const candidates: Path[][] = balls.map(enumerate)

// Backtracking assignment with dynamic MRV.
const occ = new Uint8Array(width * height)
const holeUsed = new Uint8Array(holeCount)
const done = new Uint8Array(balls.length)
const chosen: (Path | null)[] = balls.map(() => null)

function pathOk(p: Path): boolean {
  if (holeUsed[p.hole]) return false
  for (const idx of p.cells) if (occ[idx]) return false
  return true
}

function solve(): boolean {
  // Pick the unassigned ball with the fewest currently-feasible paths.
  let bestBall = -1
  let bestFeas: Path[] | null = null
  for (let b = 0; b < balls.length; b++) {
    if (done[b]) continue
    const feas: Path[] = []
    for (const p of candidates[b]) if (pathOk(p)) feas.push(p)
    if (feas.length === 0) return false
    if (bestFeas === null || feas.length < bestFeas.length) {
      bestBall = b
      bestFeas = feas
      if (feas.length === 1) break
    }
  }
  if (bestBall === -1) return true // every ball assigned

  done[bestBall] = 1
  for (const p of bestFeas!) {
    holeUsed[p.hole] = 1
    for (const idx of p.cells) occ[idx] = 1
    chosen[bestBall] = p
    if (solve()) return true
    holeUsed[p.hole] = 0
    for (const idx of p.cells) occ[idx] = 0
    chosen[bestBall] = null
  }
  done[bestBall] = 0
  return false
}

solve()

// Render.
const out: string[] = new Array(width * height).fill(".")
for (const p of chosen) {
  if (!p) continue
  for (let i = 0; i < p.cells.length; i++) out[p.cells[i]] = p.chars[i]
}

const lines: string[] = []
for (let r = 0; r < height; r++) {
  lines.push(out.slice(r * width, r * width + width).join(""))
}
console.log(lines.join("\n"))
