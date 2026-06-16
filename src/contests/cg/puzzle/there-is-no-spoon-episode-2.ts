// 🎮 CodinGame Puzzle - there-is-no-spoon-episode-2
// https://www.codingame.com/training/hard/there-is-no-spoon-episode-2

const width: number = parseInt(readline(), 10)
const height: number = parseInt(readline(), 10)
const grid: string[] = []
for (let i = 0; i < height; i++) grid.push(readline())

interface Edge {
  a: number
  b: number
  max: number
  horizontal: boolean
  x1: number
  y1: number
  x2: number
  y2: number
}

const nx: number[] = []
const ny: number[] = []
const need: number[] = []
const nodeAt: Int32Array[] = []
for (let y = 0; y < height; y++) nodeAt.push(new Int32Array(width).fill(-1))

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const c = grid[y].charCodeAt(x)
    if (c >= 49 && c <= 56) {
      const id = nx.length
      nodeAt[y][x] = id
      nx.push(x)
      ny.push(y)
      need.push(c - 48)
    }
  }
}

const N = nx.length
const edges: Edge[] = []
const nodeEdges: number[][] = []
for (let i = 0; i < N; i++) nodeEdges.push([])

// Connect each node to its nearest neighbour to the right and below.
for (let id = 0; id < N; id++) {
  for (let x = nx[id] + 1; x < width; x++) {
    const o = nodeAt[ny[id]][x]
    if (o !== -1) {
      const eid = edges.length
      edges.push({ a: id, b: o, max: 2, horizontal: true, x1: nx[id], y1: ny[id], x2: nx[o], y2: ny[o] })
      nodeEdges[id].push(eid)
      nodeEdges[o].push(eid)
      break
    }
  }
  for (let y = ny[id] + 1; y < height; y++) {
    const o = nodeAt[y][nx[id]]
    if (o !== -1) {
      const eid = edges.length
      edges.push({ a: id, b: o, max: 2, horizontal: false, x1: nx[id], y1: ny[id], x2: nx[o], y2: ny[o] })
      nodeEdges[id].push(eid)
      nodeEdges[o].push(eid)
      break
    }
  }
}

const E = edges.length

// Two perpendicular edges conflict (would cross) if their lines intersect strictly between endpoints.
const conflicts: number[][] = []
for (let i = 0; i < E; i++) conflicts.push([])
for (let i = 0; i < E; i++) {
  for (let j = i + 1; j < E; j++) {
    const a = edges[i]
    const b = edges[j]
    if (a.horizontal === b.horizontal) continue
    const h = a.horizontal ? a : b
    const v = a.horizontal ? b : a
    const hy = h.y1
    const hxl = Math.min(h.x1, h.x2)
    const hxr = Math.max(h.x1, h.x2)
    const vx = v.x1
    const vyt = Math.min(v.y1, v.y2)
    const vyb = Math.max(v.y1, v.y2)
    if (vx > hxl && vx < hxr && hy > vyt && hy < vyb) {
      conflicts[i].push(j)
      conflicts[j].push(i)
    }
  }
}

const val: Int32Array = new Int32Array(E).fill(-1) // -1 = undecided, else link count

// Upper bound for an edge: 0 if a crossing edge already carries a link, else 2.
function effMax(e: number): number {
  for (const c of conflicts[e]) if (val[c] > 0) return 0
  return edges[e].max
}

// Constraint propagation: repeatedly force edges that have only one feasible value.
function propagate(): boolean {
  let changed = true
  while (changed) {
    changed = false
    for (let n = 0; n < N; n++) {
      let assigned = 0
      const undecided: number[] = []
      for (const e of nodeEdges[n]) {
        if (val[e] >= 0) assigned += val[e]
        else undecided.push(e)
      }
      const rem = need[n] - assigned
      if (rem < 0) return false
      if (undecided.length === 0) {
        if (rem !== 0) return false
        continue
      }
      const caps: number[] = []
      let undCap = 0
      for (const e of undecided) {
        const em = effMax(e)
        caps.push(em)
        undCap += em
      }
      if (rem > undCap) return false
      if (rem === undCap) {
        for (let k = 0; k < undecided.length; k++) {
          const e = undecided[k]
          if (val[e] !== caps[k]) {
            val[e] = caps[k]
            changed = true
          }
        }
      } else if (rem === 0) {
        for (const e of undecided) {
          if (val[e] !== 0) {
            val[e] = 0
            changed = true
          }
        }
      }
    }
  }
  return true
}

function connected(): boolean {
  if (N === 0) return true
  const seen = new Uint8Array(N)
  const st = [0]
  seen[0] = 1
  let cnt = 1
  while (st.length) {
    const u = st.pop() as number
    for (const e of nodeEdges[u]) {
      if (val[e] > 0) {
        const v = edges[e].a === u ? edges[e].b : edges[e].a
        if (!seen[v]) {
          seen[v] = 1
          cnt++
          st.push(v)
        }
      }
    }
  }
  return cnt === N
}

// Branch on an undecided edge of the node with fewest undecided edges (most constrained).
function pickEdge(): number {
  let bestNode = -1
  let bestUnd = Infinity
  for (let n = 0; n < N; n++) {
    let und = 0
    for (const e of nodeEdges[n]) if (val[e] < 0) und++
    if (und === 0) continue
    if (und < bestUnd) {
      bestUnd = und
      bestNode = n
    }
  }
  if (bestNode === -1) return -1
  for (const e of nodeEdges[bestNode]) if (val[e] < 0) return e
  return -1
}

function solve(): boolean {
  const snap = Int32Array.from(val)
  if (!propagate()) {
    val.set(snap)
    return false
  }
  const e = pickEdge()
  if (e === -1) {
    if (connected()) return true
    val.set(snap)
    return false
  }
  const em = effMax(e)
  for (let v = em; v >= 0; v--) {
    const snap2 = Int32Array.from(val)
    val[e] = v
    if (solve()) return true
    val.set(snap2)
  }
  val.set(snap)
  return false
}

solve()

const out: string[] = []
for (let i = 0; i < E; i++) {
  if (val[i] > 0) {
    out.push(`${edges[i].x1} ${edges[i].y1} ${edges[i].x2} ${edges[i].y2} ${val[i]}`)
  }
}
console.log(out.join("\n"))
