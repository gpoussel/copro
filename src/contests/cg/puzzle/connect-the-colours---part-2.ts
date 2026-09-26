// 🎮 CodinGame Puzzle - connect-the-colours---part-2
// https://www.codingame.com/training/hard/connect-the-colours---part-2

// Flow-Free style solver: DFS extending one path head at a time (the most
// constrained colour first), pruned by dead-end and connectivity checks.
// The solved paths are then compressed into straight segments, one per turn.
const [h, w] = readline().split(" ").map(Number)
const N = h * w
const grid = new Int8Array(N).fill(-1)
const colourChar: string[] = []
const src: number[] = []
const dst: number[] = []
for (let y = 0; y < h; y++) {
  const row = readline()
  for (let x = 0; x < w; x++) {
    const ch = row[x]
    if (ch === ".") continue
    let c = colourChar.indexOf(ch)
    if (c < 0) {
      c = colourChar.length
      colourChar.push(ch)
      src.push(y * w + x)
    } else dst[c] = y * w + x
    grid[y * w + x] = c
  }
}
const C = colourChar.length

const nbrs: number[][] = []
for (let i = 0; i < N; i++) {
  const x = i % w
  const y = (i - x) / w
  const list: number[] = []
  if (y > 0) list.push(i - w)
  if (x < w - 1) list.push(i + 1)
  if (y < h - 1) list.push(i + w)
  if (x > 0) list.push(i - 1)
  nbrs.push(list)
}

const head = src.slice()
const finished: boolean[] = new Array<boolean>(C).fill(false)
const paths: number[][] = src.map(s => [s])
// active[cell] = 1 when it is a head or target of an unfinished colour
const active = new Uint8Array(N)
for (let c = 0; c < C; c++) {
  active[src[c]] = 1
  active[dst[c]] = 1
}
const comp = new Int32Array(N)
const queue = new Int32Array(N)

// Necessary conditions for the current partial state to be completable
const feasible = (): boolean => {
  // every empty cell needs two usable neighbours
  for (let i = 0; i < N; i++) {
    if (grid[i] !== -1) continue
    let exits = 0
    for (const n of nbrs[i]) if (grid[n] === -1 || active[n]) exits++
    if (exits < 2) return false
  }
  // label empty components
  comp.fill(-1)
  let count = 0
  for (let i = 0; i < N; i++) {
    if (grid[i] !== -1 || comp[i] !== -1) continue
    let qh = 0
    let qt = 0
    queue[qt++] = i
    comp[i] = count
    while (qh < qt) {
      const cur = queue[qh++]
      for (const n of nbrs[cur])
        if (grid[n] === -1 && comp[n] === -1) {
          comp[n] = count
          queue[qt++] = n
        }
    }
    count++
  }
  const headMask = new Array<number>(count).fill(0)
  const dstMask = new Array<number>(count).fill(0)
  for (let c = 0; c < C; c++) {
    if (finished[c]) continue
    let direct = false
    for (const n of nbrs[head[c]]) {
      if (n === dst[c]) direct = true
      else if (grid[n] === -1) headMask[comp[n]] |= 1 << c
    }
    for (const n of nbrs[dst[c]]) if (grid[n] === -1) dstMask[comp[n]] |= 1 << c
    if (direct) continue
    let reachable = false
    for (let k = 0; k < count; k++) if (headMask[k] & dstMask[k] & (1 << c)) reachable = true
    if (!reachable) return false
  }
  for (let k = 0; k < count; k++) if ((headMask[k] & dstMask[k]) === 0) return false
  return true
}

const solve = (): boolean => {
  // pick the unfinished colour with the fewest moves
  let best = -1
  let bestMoves: number[] = []
  for (let c = 0; c < C; c++) {
    if (finished[c]) continue
    const moves: number[] = []
    for (const n of nbrs[head[c]]) if (n === dst[c] || grid[n] === -1) moves.push(n)
    if (moves.length === 0) return false
    if (best < 0 || moves.length < bestMoves.length) {
      best = c
      bestMoves = moves
      if (moves.length === 1) break
    }
  }
  if (best < 0) {
    for (let i = 0; i < N; i++) if (grid[i] === -1) return false
    return true
  }
  const c = best
  const cur = head[c]
  const path = paths[c]
  // prefer going straight to keep the segment count low
  if (path.length >= 2) {
    const dir = cur - path[path.length - 2]
    bestMoves.sort((a, b) => (b - cur === dir ? 1 : 0) - (a - cur === dir ? 1 : 0))
  }
  for (const n of bestMoves) {
    path.push(n)
    if (n === dst[c]) {
      finished[c] = true
      active[cur] = 0
      active[n] = 0
      if (feasible() && solve()) return true
      finished[c] = false
      active[cur] = 1
      active[n] = 1
    } else {
      grid[n] = c
      active[cur] = 0
      active[n] = 1
      head[c] = n
      if (feasible() && solve()) return true
      head[c] = cur
      active[n] = 0
      active[cur] = 1
      grid[n] = -1
    }
    path.pop()
  }
  return false
}

feasible()
solve()

// Compress each path into straight segments
const out: string[] = []
for (let c = 0; c < C; c++) {
  const p = paths[c]
  let start = p[0]
  for (let i = 1; i < p.length; i++) {
    const last = i === p.length - 1
    if (last || p[i + 1] - p[i] !== p[i] - p[i - 1]) {
      out.push(`${start % w} ${Math.floor(start / w)} ${p[i] % w} ${Math.floor(p[i] / w)} ${colourChar[c]}`)
      start = p[i]
    }
  }
}
for (const line of out) console.log(line)
