// 🎮 CodinGame Puzzle - codindice
// https://www.codingame.com/training/expert/codindice

// Breadth-first search over board states. A state stores, for each of the 16
// cells, 0 (empty), 1 (iron) or 2..7 (a die with its 6 face at TOP, BOTTOM,
// NORTH, SOUTH, WEST, EAST), plus Rossi's group, canonicalised to the smallest
// cell index of the group he stands on (walking inside a group is free). A
// move rolls a non-iron die of Rossi's group onto an adjacent empty cell;
// Rossi then stands on it. The state packs into a number below 2^52. Die ids
// are recovered at the end by replaying the move list from the start.

const EMPTY = 0
const IRON = 1
const TOP = 2
const BOTTOM = 3
const NORTH = 4
const SOUTH = 5
const WEST = 6
const EAST = 7
const faceCode: Record<string, number> = { IRON, TOP, BOTTOM, NORTH, SOUTH, WEST, EAST }

const diceCount = Number(readline())
const startCells: number[] = new Array<number>(16).fill(EMPTY)
const startIds: number[] = new Array<number>(16).fill(-1)
let startPos = 0
for (let i = 0; i < diceCount; i++) {
  const [xs, ys, face] = readline().trim().split(/\s+/)
  const cell = Number(ys) * 4 + Number(xs)
  startCells[cell] = faceCode[face]
  startIds[cell] = i
  if (i === 0) startPos = cell
}

// Directions: dx, dy, name, and how the 6 face moves when rolling that way
interface Dir {
  dx: number
  dy: number
  name: string
  turn: number[] // indexed by face code
}
const mkTurn = (pairs: [number, number][]): number[] => {
  const t = [0, 1, 2, 3, 4, 5, 6, 7]
  for (const [a, b] of pairs) t[a] = b
  return t
}
const dirs: Dir[] = [
  {
    dx: -1,
    dy: 0,
    name: "LEFT",
    turn: mkTurn([
      [TOP, WEST],
      [WEST, BOTTOM],
      [BOTTOM, EAST],
      [EAST, TOP],
    ]),
  },
  {
    dx: 1,
    dy: 0,
    name: "RIGHT",
    turn: mkTurn([
      [TOP, EAST],
      [EAST, BOTTOM],
      [BOTTOM, WEST],
      [WEST, TOP],
    ]),
  },
  {
    dx: 0,
    dy: -1,
    name: "UP",
    turn: mkTurn([
      [TOP, NORTH],
      [NORTH, BOTTOM],
      [BOTTOM, SOUTH],
      [SOUTH, TOP],
    ]),
  },
  {
    dx: 0,
    dy: 1,
    name: "DOWN",
    turn: mkTurn([
      [TOP, SOUTH],
      [SOUTH, BOTTOM],
      [BOTTOM, NORTH],
      [NORTH, TOP],
    ]),
  },
]
const neighbour: number[][] = []
for (let c = 0; c < 16; c++) {
  const x = c % 4
  const y = (c - x) / 4
  neighbour.push(
    dirs.map(d => {
      const nx = x + d.dx
      const ny = y + d.dy
      return nx >= 0 && nx < 4 && ny >= 0 && ny < 4 ? ny * 4 + nx : -1
    })
  )
}

// Group (flood fill) containing a cell, as a 16-bit mask
const groupOf = (cells: number[], from: number): number => {
  let mask = 1 << from
  const stack = [from]
  while (stack.length) {
    const c = stack.pop() as number
    for (const n of neighbour[c]) {
      if (n >= 0 && cells[n] !== EMPTY && !((mask >> n) & 1)) {
        mask |= 1 << n
        stack.push(n)
      }
    }
  }
  return mask
}
const lowestBit = (mask: number): number => 31 - Math.clz32(mask & -mask)

const P16 = 2 ** 48
const encode = (cells: number[], pos: number): number => {
  let key = 0
  for (let c = 15; c >= 0; c--) key = key * 8 + cells[c]
  return key + pos * P16
}
const decode = (key: number, cells: number[]): number => {
  const pos = Math.floor(key / P16)
  let rest = key - pos * P16
  for (let c = 0; c < 16; c++) {
    cells[c] = rest % 8
    rest = (rest - cells[c]) / 8
  }
  return pos
}

const isGoal = (cells: number[], pos: number): boolean => {
  let all = 0
  for (let c = 0; c < 16; c++) {
    if (cells[c] === EMPTY) continue
    if (cells[c] !== TOP && cells[c] !== IRON) return false
    all |= 1 << c
  }
  return groupOf(cells, pos) === all
}

// parent map: state -> [previous state, from cell, direction]
const parent = new Map<number, [number, number, number]>()
const startKey = encode(startCells, lowestBit(groupOf(startCells, startPos)))
parent.set(startKey, [-1, -1, -1])
let goalKey = -1
let frontier: number[] = [startKey]
const cur: number[] = new Array<number>(16).fill(0)
const scratch: number[] = new Array<number>(16).fill(0)
{
  const p = decode(startKey, cur)
  if (isGoal(cur, p)) goalKey = startKey
}
while (goalKey < 0 && frontier.length) {
  const next: number[] = []
  for (const key of frontier) {
    const pos = decode(key, cur)
    const grp = groupOf(cur, pos)
    for (let c = 0; c < 16 && goalKey < 0; c++) {
      if (!((grp >> c) & 1) || cur[c] === IRON) continue
      for (let d = 0; d < 4; d++) {
        const n = neighbour[c][d]
        if (n < 0 || cur[n] !== EMPTY) continue
        for (let i = 0; i < 16; i++) scratch[i] = cur[i]
        scratch[n] = dirs[d].turn[cur[c]]
        scratch[c] = EMPTY
        const npos = lowestBit(groupOf(scratch, n))
        const nk = encode(scratch, npos)
        if (parent.has(nk)) continue
        parent.set(nk, [key, c, d])
        if (isGoal(scratch, npos)) {
          goalKey = nk
          break
        }
        next.push(nk)
      }
    }
    if (goalKey >= 0) break
  }
  frontier = next
}

// Rebuild the move list and replay it to name the dice
const moves: [number, number][] = []
for (let k = goalKey; k !== startKey; ) {
  const [prev, from, d] = parent.get(k) as [number, number, number]
  moves.push([from, d])
  k = prev
}
moves.reverse()
const ids = startIds.slice()
const out: string[] = []
for (const [from, d] of moves) {
  const to = neighbour[from][d]
  out.push(`${ids[from]} ${dirs[d].name}`)
  ids[to] = ids[from]
  ids[from] = -1
}
console.log(out.join("\n"))
