// 🎮 CodinGame Puzzle - jump-point-search---runtime
// https://www.codingame.com/training/hard/jump-point-search---runtime

// JPS+ runtime (Rabin & Silva, section 14.7): A* over jump points where each
// popped node only explores the directions allowed by its travel direction,
// with the special "goal is closer than the jump/wall distance" targets.
// Every popped node is printed; the open list is a binary heap ordered by
// f = g + octile heuristic, ties broken by insertion order.
const [W, H] = readline().split(" ").map(Number)
const [startC, startR, goalC, goalR] = readline().split(" ").map(Number)
const openCount = Number(readline())
const dist: number[][] = new Array(W * H)
for (let i = 0; i < openCount; i++) {
  const v = readline().split(" ").map(Number)
  dist[v[1] * W + v[0]] = v.slice(2)
}

const SQRT2 = Math.SQRT2
// N NE E SE S SW W NW
const DX = [0, 1, 1, 1, 0, -1, -1, -1]
const DY = [-1, -1, 0, 1, 1, 1, 0, -1]
const dirOf = (dx: number, dy: number): number => {
  for (let d = 0; d < 8; d++) if (DX[d] === dx && DY[d] === dy) return d
  return -1
}
// valid directions given the travel direction (cardinal: 5, diagonal: 3)
const valid = (d: number): number[] =>
  d < 0
    ? [0, 1, 2, 3, 4, 5, 6, 7]
    : d % 2 === 0
      ? [d - 2, d - 1, d, d + 1, d + 2].map(x => (x + 8) % 8)
      : [d - 1, d, d + 1].map(x => (x + 8) % 8)

const octile = (x: number, y: number): number => {
  const dx = Math.abs(x - goalC)
  const dy = Math.abs(y - goalR)
  return dx + dy + (SQRT2 - 2) * Math.min(dx, dy)
}

const N = W * H
const g = new Array<number>(N).fill(Infinity)
const parent = new Array<number>(N).fill(-1)
const closed = new Array<boolean>(N).fill(false)

// binary heap of [f, seq, node]
type Entry = [number, number, number]
const heap: Entry[] = []
const less = (a: Entry, b: Entry): boolean => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])
function push(e: Entry): void {
  heap.push(e)
  let i = heap.length - 1
  while (i > 0) {
    const p = (i - 1) >> 1
    if (!less(heap[i], heap[p])) break
    ;[heap[i], heap[p]] = [heap[p], heap[i]]
    i = p
  }
}
function pop(): Entry {
  const top = heap[0]
  const last = heap.pop()!
  if (heap.length) {
    heap[0] = last
    let i = 0
    while (true) {
      const l = 2 * i + 1
      const r = l + 1
      let m = i
      if (l < heap.length && less(heap[l], heap[m])) m = l
      if (r < heap.length && less(heap[r], heap[m])) m = r
      if (m === i) break
      ;[heap[i], heap[m]] = [heap[m], heap[i]]
      i = m
    }
  }
  return top
}

let seq = 0
const start = startR * W + startC
const goal = goalR * W + goalC
g[start] = 0
push([octile(startC, startR), seq++, start])
const out: string[] = []
while (true) {
  // skip stale heap entries
  while (heap.length && closed[heap[0][2]]) pop()
  if (!heap.length) {
    out.push("NO PATH")
    break
  }
  const cur = pop()[2]
  closed[cur] = true
  const cx = cur % W
  const cy = (cur / W) | 0
  const p = parent[cur]
  out.push(p < 0 ? `${cx} ${cy} -1 -1 0.00` : `${cx} ${cy} ${p % W} ${(p / W) | 0} ${g[cur].toFixed(2)}`)
  if (cur === goal) break
  const travel = p < 0 ? -1 : dirOf(Math.sign(cx - (p % W)), Math.sign(cy - ((p / W) | 0)))
  for (const d of valid(travel)) {
    const dd = dist[cur][d]
    const ad = Math.abs(dd)
    const rowDiff = Math.abs(goalR - cy)
    const colDiff = Math.abs(goalC - cx)
    let succ = -1
    let cost = 0
    const inDir =
      (DX[d] === 0 ? goalC === cx : Math.sign(goalC - cx) === DX[d]) &&
      (DY[d] === 0 ? goalR === cy : Math.sign(goalR - cy) === DY[d])
    if (d % 2 === 0 && inDir && rowDiff + colDiff <= ad) {
      succ = goal
      cost = g[cur] + rowDiff + colDiff
    } else if (d % 2 === 1 && inDir && (rowDiff <= ad || colDiff <= ad)) {
      const m = Math.min(rowDiff, colDiff)
      succ = (cy + DY[d] * m) * W + cx + DX[d] * m
      cost = g[cur] + SQRT2 * m
    } else if (dd > 0) {
      succ = (cy + DY[d] * dd) * W + cx + DX[d] * dd
      cost = g[cur] + (d % 2 === 1 ? SQRT2 * dd : dd)
    }
    if (succ < 0 || cost >= g[succ]) continue
    g[succ] = cost
    parent[succ] = cur
    closed[succ] = false
    push([cost + octile(succ % W, (succ / W) | 0), seq++, succ])
  }
}
for (const line of out) console.log(line)
