// 🎮 CodinGame Puzzle - binary-extension
// https://www.codingame.com/training/hard/binary-extension

// The tree shape is a set of cells where every non-root cell hangs below an
// occupied diagonal neighbour of the previous row. A row-by-row DP over
// occupancy masks (each row has at most 8 usable cells) finds the smallest
// such set covering every goal. The shape is then labelled by in-order
// traversal (x-1 child smaller, x+1 child larger) and printed top-down.
const [width, height, n, bombsCount, goalsCount] = readline().split(" ").map(Number)
const bomb = new Set<number>()
const goal = new Set<number>()
for (let i = 0; i < bombsCount; i++) {
  const [x, y] = readline().split(" ").map(Number)
  bomb.add(y * width + x)
}
for (let i = 0; i < goalsCount; i++) {
  const [x, y] = readline().split(" ").map(Number)
  goal.add(y * width + x)
}

const x0 = (width - 1) / 2
// Usable cells of each row, and the goal / forbidden masks over them
const rows: number[][] = []
const goalMask: number[] = []
const bombMask: number[] = []
for (let y = 0; y < height; y++) {
  const xs: number[] = []
  for (let x = 0; x < width; x++) if (Math.abs(x - x0) <= y && (x - x0 - y) % 2 === 0) xs.push(x)
  rows.push(xs)
  let g = 0
  let b = 0
  xs.forEach((x, i) => {
    if (goal.has(y * width + x)) g |= 1 << i
    if (bomb.has(y * width + x)) b |= 1 << i
  })
  goalMask.push(g)
  bombMask.push(b)
}

const INF = 1e9
const popcount = (m: number): number => {
  let c = 0
  for (; m; m &= m - 1) c++
  return c
}

const dp: number[][] = [new Array<number>(2).fill(INF)]
const from: number[][] = [new Array<number>(2).fill(-1)]
if (!bombMask[0]) dp[0][1] = 1
for (let y = 1; y < height; y++) {
  const prev = rows[y - 1]
  const cur = rows[y]
  // For each cell of the current row, the mask of its possible parents
  const parents = cur.map(x => {
    let m = 0
    prev.forEach((px, i) => {
      if (Math.abs(px - x) === 1) m |= 1 << i
    })
    return m
  })
  const size = 1 << cur.length
  const d = new Array<number>(size).fill(INF)
  const f = new Array<number>(size).fill(-1)
  for (let pm = 0; pm < dp[y - 1].length; pm++) {
    if (dp[y - 1][pm] >= INF) continue
    for (let m = 0; m < size; m++) {
      if ((m & goalMask[y]) !== goalMask[y] || m & bombMask[y]) continue
      let ok = true
      for (let i = 0; i < cur.length && ok; i++) if ((m >> i) & 1 && !(parents[i] & pm)) ok = false
      if (!ok) continue
      const c = dp[y - 1][pm] + popcount(m)
      if (c < d[m]) {
        d[m] = c
        f[m] = pm
      }
    }
  }
  dp.push(d)
  from.push(f)
}

// Rebuild the chosen cells from the best final state
let best = 0
const last = dp[height - 1]
for (let m = 1; m < last.length; m++) if (last[m] < last[best]) best = m
const occupied = new Set<number>()
for (let y = height - 1, m = best; y >= 0; m = from[y][m], y--) {
  rows[y].forEach((x, i) => {
    if ((m >> i) & 1) occupied.add(y * width + x)
  })
}
if (occupied.size > n) console.error("too many nodes", occupied.size, n)

// Attach each cell to one occupied parent (upper-left first)
const kids = new Map<number, number[]>()
for (const c of occupied) {
  const x = c % width
  const y = (c - x) / width
  if (y === 0) continue
  const p = occupied.has((y - 1) * width + x - 1) ? (y - 1) * width + x - 1 : (y - 1) * width + x + 1
  if (!kids.has(p)) kids.set(p, [])
  kids.get(p)!.push(c)
}

// In-order labelling: x-1 child (smaller values), node, x+1 child (larger values)
const value = new Map<number, number>()
let counter = 0
const label = (c: number): void => {
  const ch = kids.get(c) ?? []
  const x = c % width
  const small = ch.find(k => k % width === x - 1)
  const large = ch.find(k => k % width === x + 1)
  if (small !== undefined) label(small)
  value.set(c, ++counter)
  if (large !== undefined) label(large)
}
const root = x0
label(root)

// Breadth-first output guarantees each parent is inserted before its children
const out: number[] = []
const queue = [root]
for (let i = 0; i < queue.length; i++) {
  out.push(value.get(queue[i])!)
  queue.push(...(kids.get(queue[i]) ?? []))
}
console.log(out.join("\n"))
