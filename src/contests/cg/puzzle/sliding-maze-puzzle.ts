// 🎮 CodinGame Puzzle - sliding-maze-puzzle
// https://www.codingame.com/training/hard/sliding-maze-puzzle

// Each 3x3 tile has one floor (its center) and up to four edge openings; an
// opening leads outside on the tile's floor, or on the other floor for a stair
// '+'. The player can cross between two tiles when both facing edges are open
// and lead to the same floor. State = arrangement of the 9 tiles (the water tile
// is the hole) + the tile the player stands on, ranked into 9!·9 slots.
// BFS expanding moves in priority order (P before T, then v < > ^) makes the
// first discovery of each state carry the lexicographically smallest shortest
// path, so the first time the exit move is found we are done.

const [r0, c0] = readline().split(" ").map(Number)
const grid: string[] = []
for (let i = 0; i < 9; i++) grid.push(readline())

// directions in priority order: v < > ^
const DR = [1, 0, 0, -1]
const DC = [0, -1, 1, 0]
const SYM = ["v", "<", ">", "^"]
const OPP = [3, 2, 1, 0]

const floorOf = (ch: string): number => (ch === "." ? 0 : ch === "=" ? 1 : -1)
const tileFloor: number[] = []
const tileEdge: number[][] = [] // outside floor per direction, -1 if closed
let water = -1
for (let t = 0; t < 9; t++) {
  const br = Math.floor(t / 3) * 3
  const bc = (t % 3) * 3
  const center = grid[br + 1][bc + 1]
  const f = floorOf(center)
  if (center === "~") water = t
  tileFloor.push(f)
  const edges: number[] = []
  for (let d = 0; d < 4; d++) {
    const ch = grid[br + 1 + DR[d]][bc + 1 + DC[d]]
    if (f < 0 || ch === "#" || ch === "~") edges.push(-1)
    else if (ch === "+") edges.push(1 - f)
    else edges.push(floorOf(ch))
  }
  tileEdge.push(edges)
}

const FACT = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880]
const rank = (p: Uint8Array | number[]): number => {
  let r = 0
  for (let i = 0; i < 9; i++) {
    let smaller = 0
    for (let j = i + 1; j < 9; j++) if (p[j] < p[i]) smaller++
    r += smaller * FACT[8 - i]
  }
  return r
}

const total = 362880 * 9
const parent = new Int32Array(total).fill(-1)
const moveOf = new Uint8Array(total)
// queue storing pos->tile arrangement (9 bytes) + player tile
const QMAX = total
const qPerm = new Uint8Array(QMAX * 9)
const qPlayer = new Uint8Array(QMAX)
const qCode = new Int32Array(QMAX)
let head = 0
let tail = 0

const initPerm = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const startCode = rank(initPerm) * 9 + (r0 * 3 + c0)
parent[startCode] = startCode
qPerm.set(initPerm, 0)
qPlayer[0] = r0 * 3 + c0
qCode[0] = startCode
tail = 1

let exitFrom = -1
const perm = new Uint8Array(9)
const pos = new Uint8Array(9) // tile -> position
search: while (head < tail) {
  for (let i = 0; i < 9; i++) {
    perm[i] = qPerm[head * 9 + i]
    pos[perm[i]] = i
  }
  const player = qPlayer[head]
  const code = qCode[head]
  head++
  const pp = pos[player]
  const pr = Math.floor(pp / 3)
  const pc = pp % 3
  // player moves
  for (let d = 0; d < 4; d++) {
    const out = tileEdge[player][d]
    if (out < 0) continue
    const nr = pr + DR[d]
    const nc = pc + DC[d]
    if (nr < 0 || nr > 2 || nc < 0 || nc > 2) {
      if (pp === 0 && d === 1 && out === 1) {
        exitFrom = code
        break search
      }
      continue
    }
    const other = perm[nr * 3 + nc]
    if (tileEdge[other][OPP[d]] !== out) continue
    const nCode = Math.floor(code / 9) * 9 + other
    if (parent[nCode] >= 0) continue
    parent[nCode] = code
    moveOf[nCode] = d
    qPerm.set(perm, tail * 9)
    qPlayer[tail] = other
    qCode[tail] = nCode
    tail++
  }
  // tile slides (only from floor 0)
  if (tileFloor[player] !== 0) continue
  const wp = pos[water]
  const wr = Math.floor(wp / 3)
  const wc = wp % 3
  for (let d = 0; d < 4; d++) {
    // tile moving in direction d comes from the water cell minus d
    const sr = wr - DR[d]
    const sc = wc - DC[d]
    if (sr < 0 || sr > 2 || sc < 0 || sc > 2) continue
    const sp = sr * 3 + sc
    if (sp === pp) continue
    const next = perm.slice()
    next[wp] = perm[sp]
    next[sp] = water
    const nCode = rank(next) * 9 + player
    if (parent[nCode] >= 0) continue
    parent[nCode] = code
    moveOf[nCode] = 4 + d
    qPerm.set(next, tail * 9)
    qPlayer[tail] = player
    qCode[tail] = nCode
    tail++
  }
}

const moves: string[] = ["P <"]
for (let c = exitFrom; c !== startCode; c = parent[c]) {
  const m = moveOf[c]
  moves.push((m < 4 ? "P " : "T ") + SYM[m & 3])
}
moves.reverse()
console.log(moves.length)
console.log(moves.join("\n"))
