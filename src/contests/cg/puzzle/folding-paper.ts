// 🎮 CodinGame Puzzle - folding-paper
// https://www.codingame.com/

const order = readline().trim()
const side = readline().trim()

let hx = 0
let hy = 0
for (const c of order) {
  if (c === "R" || c === "L") hx++
  else hy++
}
const W = 1 << hx
const H = 1 << hy

interface Cell {
  id: number
  fx: boolean
  fy: boolean
}
type Layer = Cell[][] // [y][x]

let Wc = W
let Hc = H

const clone = (c: Cell): Cell => ({ id: c.id, fx: c.fx, fy: c.fy })

let stack: Layer[] = []
{
  const g: Layer = []
  for (let y = 0; y < H; y++) {
    g[y] = []
    for (let x = 0; x < W; x++) g[y][x] = { id: y * W + x, fx: false, fy: false }
  }
  stack = [g]
}

function foldX(isR: boolean) {
  const half = Wc / 2
  const bottom: Layer[] = []
  const top: Layer[] = []
  for (const layer of stack) {
    if (isR) {
      // right half folds onto left, on top, reversed + mirrored
      const lh: Layer = []
      const rh: Layer = []
      for (let y = 0; y < Hc; y++) {
        lh[y] = []
        rh[y] = []
        for (let x = 0; x < half; x++) lh[y][x] = layer[y][x]
        for (let x = 0; x < half; x++) {
          const c = clone(layer[y][Wc - 1 - x])
          c.fx = !c.fx
          rh[y][x] = c
        }
      }
      bottom.push(lh)
      top.push(rh)
    } else {
      // left half folds onto right, on top, reversed + mirrored
      const rh: Layer = []
      const lh: Layer = []
      for (let y = 0; y < Hc; y++) {
        rh[y] = []
        lh[y] = []
        for (let x = 0; x < half; x++) rh[y][x] = layer[y][x + half]
        for (let x = 0; x < half; x++) {
          const c = clone(layer[y][half - 1 - x])
          c.fx = !c.fx
          lh[y][x] = c
        }
      }
      bottom.push(rh)
      top.push(lh)
    }
  }
  top.reverse()
  stack = bottom.concat(top)
  Wc = half
}

function foldY(isU: boolean) {
  const half = Hc / 2
  const bottom: Layer[] = []
  const top: Layer[] = []
  for (const layer of stack) {
    if (isU) {
      // high (large y) folds onto low, on top, reversed + mirrored
      const low: Layer = []
      const high: Layer = []
      for (let y = 0; y < half; y++) {
        low[y] = []
        for (let x = 0; x < Wc; x++) low[y][x] = layer[y][x]
      }
      for (let y = 0; y < half; y++) {
        high[y] = []
        for (let x = 0; x < Wc; x++) {
          const c = clone(layer[Hc - 1 - y][x])
          c.fy = !c.fy
          high[y][x] = c
        }
      }
      bottom.push(low)
      top.push(high)
    } else {
      // low folds onto high, on top, reversed + mirrored
      const high: Layer = []
      const low: Layer = []
      for (let y = 0; y < half; y++) {
        high[y] = []
        for (let x = 0; x < Wc; x++) high[y][x] = layer[y + half][x]
      }
      for (let y = 0; y < half; y++) {
        low[y] = []
        for (let x = 0; x < Wc; x++) {
          const c = clone(layer[half - 1 - y][x])
          c.fy = !c.fy
          low[y][x] = c
        }
      }
      bottom.push(high)
      top.push(low)
    }
  }
  top.reverse()
  stack = bottom.concat(top)
  Hc = half
}

for (const c of order) {
  if (c === "R") foldX(true)
  else if (c === "L") foldX(false)
  else if (c === "U") foldY(true)
  else foldY(false)
}

// Now Wc == Hc == 1: a stack of L layers, one original cell each.
const L = stack.length
const cells: Cell[] = []
for (let k = 0; k < L; k++) cells.push(stack[k][0][0])

// z-position of each original cell id in the final stack.
const pos = new Map<number, number>()
for (let k = 0; k < L; k++) pos.set(cells[k].id, k)

// For each layer, find the original cell touching its edge on `side`,
// taking flips into account. Existing neighbour -> crease; otherwise the
// edge is an open (cut) edge.
function neighbourId(c: Cell): number | null {
  const ox = c.id % W
  const oy = (c.id / W) | 0
  let nx = ox
  let ny = oy
  if (side === "R") nx = c.fx ? ox - 1 : ox + 1
  else if (side === "L") nx = c.fx ? ox + 1 : ox - 1
  else if (side === "U") ny = c.fy ? oy - 1 : oy + 1
  else ny = c.fy ? oy + 1 : oy - 1
  if (nx < 0 || nx >= W || ny < 0 || ny >= H) return null
  return ny * W + nx
}

const arcs: [number, number][] = []
const opens: number[] = []
for (let k = 0; k < L; k++) {
  const nb = neighbourId(cells[k])
  if (nb === null) {
    opens.push(k)
  } else {
    const zn = pos.get(nb)!
    if (k < zn) arcs.push([k, zn]) // count each crease once
  }
}

// Looking from `side`, an arc (crease) hides everything nested inside it.
// Count only the outermost features (arcs + open edges at nesting depth 0).
const enclosedArc = ([lo, hi]: [number, number]) => arcs.some(([l, h]) => l < lo && hi < h)
const enclosedOpen = (k: number) => arcs.some(([l, h]) => l < k && k < h)

let visible = 0
for (const a of arcs) if (!enclosedArc(a)) visible++
for (const k of opens) if (!enclosedOpen(k)) visible++

console.log(visible)
