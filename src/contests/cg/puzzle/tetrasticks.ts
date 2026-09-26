// 🎮 CodinGame Puzzle - tetrasticks
// https://www.codingame.com/training/medium/tetrasticks

// Shapes as used by the referee: each lattice point is a 3×3 block of characters,
// edges are drawn as pairs of 'O' between two lattice points.
const SHAPES: { [id: string]: string[] } = {
  F: ["......", "..OO..", ".O....", ".O....", "..OO..", ".O....", ".O....", "......", "......"],
  H: ["......", "......", ".O....", ".O....", "..OO..", ".O..O.", ".O..O.", "......", "......"],
  I: ["...", "...", ".O.", ".O.", "...", ".O.", ".O.", "...", ".O.", ".O.", "...", ".O.", ".O.", "...", "..."],
  J: ["......", "......", "....O.", "....O.", "......", ".O..O.", ".O..O.", "..OO..", "......"],
  L: ["......", "......", ".O....", ".O....", "......", ".O....", ".O....", "......", ".O....", ".O....", "..OO..", "......"],
  N: ["......", "......", ".O....", ".O....", "..OO..", "....O.", "....O.", "......", "....O.", "....O.", "......", "......"],
  O: ["......", "..OO..", ".O..O.", ".O..O.", "..OO..", "......"],
  P: ["......", "..OO..", "....O.", "....O.", "..OO..", ".O....", ".O....", "......", "......"],
  R: [".........", "..OO.....", "....O....", "....O....", ".....OO..", "....O....", "....O....", ".........", "........."],
  T: [".........", "..OO.OO..", "....O....", "....O....", ".........", "....O....", "....O....", ".........", "........."],
  U: [".........", ".........", ".O.....O.", ".O.....O.", "..OO.OO..", "........."],
  V: [".........", ".........", ".......O.", ".......O.", ".........", ".......O.", ".......O.", "..OO.OO..", "........."],
  W: [".........", ".....OO..", "....O....", "....O....", "..OO.....", ".O.......", ".O.......", ".........", "........."],
  X: [".........", ".........", "....O....", "....O....", "..OO.OO..", "....O....", "....O....", ".........", "........."],
  Y: ["......", "......", ".O....", ".O....", "..OO..", ".O....", ".O....", "......", ".O....", ".O....", "......", "......"],
  Z: [".........", "..OO.....", "....O....", "....O....", ".........", "....O....", "....O....", ".....OO..", "........."],
}
const SIZE = 18

function rotateRight(shape: string[]): string[] {
  const h = shape.length
  const w = shape[0].length
  const out: string[] = []
  for (let x = 0; x < w; x++) {
    let s = ""
    for (let y = h - 1; y >= 0; y--) s += shape[y][x]
    out.push(s)
  }
  return out
}

function transform(shape: string[], flip: number, rot: number): string[] {
  let t = flip ? shape.map(r => r.split("").reverse().join("")) : shape
  for (let i = 0; i < rot; i++) t = rotateRight(t)
  return t
}

interface Orientation {
  flip: number
  rot: number
  h: number
  w: number
  cells: [number, number][]
}

function buildOrientation(id: string, flip: number, rot: number): Orientation {
  const t = transform(SHAPES[id], flip, rot)
  const cells: [number, number][] = []
  t.forEach((row, y) => row.split("").forEach((ch, x) => ch === "O" && cells.push([y, x])))
  return { flip, rot, h: t.length, w: t[0].length, cells }
}

// Distinct orientations of each piece
const orientations: { [id: string]: Orientation[] } = {}
for (const id in SHAPES) {
  const seen: string[] = []
  orientations[id] = []
  for (let flip = 0; flip < 2; flip++) {
    for (let rot = 0; rot < 4; rot++) {
      const key = transform(SHAPES[id], flip, rot).join("|")
      if (seen.indexOf(key) >= 0) continue
      seen.push(key)
      orientations[id].push(buildOrientation(id, flip, rot))
    }
  }
}

// Each unit edge gets an index (scan order of its marker cell in the 18×18 char board)
const edgeIndex: number[][] = []
let edgeCount = 0
for (let y = 0; y < SIZE; y++) {
  edgeIndex.push([])
  for (let x = 0; x < SIZE; x++) {
    const horizontal = y % 3 === 1 && x % 3 === 2 && x <= 14
    const vertical = y % 3 === 2 && x % 3 === 1 && y <= 14
    edgeIndex[y].push(horizontal || vertical ? edgeCount++ : -1)
  }
}

// A placement covers some edges and passes straight through some lattice points,
// either vertically or horizontally (two sticks can't cross at such a point)
interface Placement {
  id: string
  edges: number[]
  vThrough: number[]
  hThrough: number[]
  text: string
}

function makePlacement(id: string, o: Orientation, r: number, c: number): Placement | null {
  if (3 * r + o.h > SIZE || 3 * c + o.w > SIZE) return null
  const mark: boolean[][] = []
  for (let y = 0; y < SIZE; y++) mark.push(new Array(SIZE).fill(false))
  const edges: number[] = []
  for (const [dy, dx] of o.cells) {
    const y = 3 * r + dy
    const x = 3 * c + dx
    mark[y][x] = true
    const e = edgeIndex[y][x]
    if (e >= 0) edges.push(e)
  }
  const vThrough: number[] = []
  const hThrough: number[] = []
  for (let py = 0; py < 6; py++) {
    for (let px = 0; px < 6; px++) {
      const y = 3 * py + 1
      const x = 3 * px + 1
      if (y > 1 && y < 16 && mark[y - 1][x] && mark[y + 1][x]) vThrough.push(py * 6 + px)
      if (x > 1 && x < 16 && mark[y][x - 1] && mark[y][x + 1]) hThrough.push(py * 6 + px)
    }
  }
  return { id, edges, vThrough, hThrough, text: `${id} ${o.flip} ${o.rot} ${r} ${c}` }
}

const allPlacements: Placement[] = []
for (const id in orientations) {
  for (const o of orientations[id]) {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const p = makePlacement(id, o, r, c)
        if (p) allPlacements.push(p)
      }
    }
  }
}

const edgeUsed: boolean[] = new Array(edgeCount).fill(false)
const vUsed: boolean[] = new Array(36).fill(false)
const hUsed: boolean[] = new Array(36).fill(false)

function canPlace(p: Placement): boolean {
  for (const e of p.edges) if (edgeUsed[e]) return false
  for (const q of p.vThrough) if (hUsed[q]) return false
  for (const q of p.hThrough) if (vUsed[q]) return false
  return true
}

function apply(p: Placement, value: boolean) {
  for (const e of p.edges) edgeUsed[e] = value
  for (const q of p.vThrough) vUsed[q] = value
  for (const q of p.hThrough) hUsed[q] = value
}

// Placements covering each edge (Algorithm X style: branch on the most constrained edge)
const byEdge: Placement[][] = []
for (let e = 0; e < edgeCount; e++) byEdge.push([])
for (const p of allPlacements) for (const e of p.edges) byEdge[e].push(p)

const byPiece: { [id: string]: Placement[] } = {}
for (const p of allPlacements) (byPiece[p.id] = byPiece[p.id] || []).push(p)

const solution: string[] = []
const available: { [id: string]: boolean } = {}

function solve(left: number): boolean {
  if (left === 0) return true
  let best: Placement[] | null = null
  for (let e = 0; e < edgeCount; e++) {
    if (edgeUsed[e]) continue
    const options = byEdge[e].filter(p => available[p.id] && canPlace(p))
    if (!best || options.length < best.length) best = options
    if (best.length === 0) return false
  }
  for (const id in byPiece) {
    if (!available[id]) continue
    const options = byPiece[id].filter(p => canPlace(p))
    if (!best || options.length < best.length) best = options
    if (best.length === 0) return false
  }
  if (!best) return false
  for (const p of best) {
    available[p.id] = false
    apply(p, true)
    solution.push(p.text)
    if (solve(left - 1)) return true
    solution.pop()
    apply(p, false)
    available[p.id] = true
  }
  return false
}

let turn = 0
while (true) {
  readline() // m
  const remaining = readline().split(" ").filter(s => s.length > 0)
  const n = parseInt(readline())
  const placed: string[] = []
  for (let i = 0; i < n; i++) placed.push(readline())
  if (turn === 0) {
    for (const line of placed) {
      const [id, flip, rot, r, c] = line.split(" ")
      const o = buildOrientation(id, +flip, +rot)
      const p = makePlacement(id, o, +r, +c)
      if (p) apply(p, true)
    }
    for (const id of remaining) available[id] = true
    solve(remaining.length)
  }
  console.log(solution[turn++])
}
