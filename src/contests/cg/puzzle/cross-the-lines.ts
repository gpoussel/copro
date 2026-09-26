// 🎮 CodinGame Puzzle - cross-the-lines
// https://www.codingame.com/training/expert/cross-the-lines

// The curve lives in the faces of the planar arrangement: each crossing moves
// from one face to the face across a segment. So this is a Chinese postman
// tour on the dual graph (faces = nodes, segments = edges, bridges = loops):
// answer = #segments + min-weight perfect matching of odd-degree faces.
// Faces are traced with half-edges per connected component; a component's
// outer boundary is merged into the smallest face of another component that
// encloses it (or the unbounded face).
const segCount = parseInt(readline())
const pointIds = new Map<string, number>()
const px: number[] = []
const py: number[] = []
const pointId = (x: number, y: number): number => {
  const key = `${x},${y}`
  let id = pointIds.get(key)
  if (id === undefined) {
    id = px.length
    pointIds.set(key, id)
    px.push(x)
    py.push(y)
  }
  return id
}
// half-edge 2i goes a->b, 2i+1 goes b->a
const heFrom: number[] = []
const heTo: number[] = []
for (let i = 0; i < segCount; i++) {
  const [x1, y1, x2, y2] = readline().split(" ").map(Number)
  const a = pointId(x1, y1)
  const b = pointId(x2, y2)
  heFrom.push(a, b)
  heTo.push(b, a)
}
const vCount = px.length
const heCount = heFrom.length

// outgoing half-edges per vertex, sorted counter-clockwise by angle
const outgoing: number[][] = Array.from({ length: vCount }, () => [])
for (let h = 0; h < heCount; h++) outgoing[heFrom[h]].push(h)
const angleOf = (h: number): number => Math.atan2(py[heTo[h]] - py[heFrom[h]], px[heTo[h]] - px[heFrom[h]])
const posInFan: number[] = new Array<number>(heCount).fill(0)
for (const fan of outgoing) {
  fan.sort((p, q) => angleOf(p) - angleOf(q))
  fan.forEach((h, i) => (posInFan[h] = i))
}
// after arriving at v through h, continue with the edge just clockwise of the reverse edge
const nextHe = (h: number): number => {
  const fan = outgoing[heTo[h]]
  const twin = h ^ 1
  return fan[(posInFan[twin] - 1 + fan.length) % fan.length]
}

// trace cycles (faces of each component)
const cycleOf: number[] = new Array<number>(heCount).fill(-1)
const cycleVerts: number[][] = []
const cycleArea: number[] = []
for (let h0 = 0; h0 < heCount; h0++) {
  if (cycleOf[h0] >= 0) continue
  const id = cycleVerts.length
  const verts: number[] = []
  let area = 0
  let h = h0
  do {
    cycleOf[h] = id
    verts.push(heFrom[h])
    area += px[heFrom[h]] * py[heTo[h]] - px[heTo[h]] * py[heFrom[h]]
    h = nextHe(h)
  } while (h !== h0)
  cycleVerts.push(verts)
  cycleArea.push(area)
}
const cycleCount = cycleVerts.length

// connected components of the segment graph
const comp: number[] = new Array<number>(vCount).fill(-1)
let compCount = 0
for (let s = 0; s < vCount; s++) {
  if (comp[s] >= 0) continue
  const stack = [s]
  comp[s] = compCount
  while (stack.length) {
    const v = stack.pop()!
    for (const h of outgoing[v]) {
      if (comp[heTo[h]] < 0) {
        comp[heTo[h]] = compCount
        stack.push(heTo[h])
      }
    }
  }
  compCount++
}

// union-find over cycles; node `cycleCount` is the global unbounded face
const parent = Array.from({ length: cycleCount + 1 }, (_, i) => i)
const find = (x: number): number => {
  while (parent[x] !== x) x = parent[x] = parent[parent[x]]
  return x
}
const insidePolygon = (x: number, y: number, verts: number[]): boolean => {
  let inside = false
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const xi = px[verts[i]]
    const yi = py[verts[i]]
    const xj = px[verts[j]]
    const yj = py[verts[j]]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
const outerCycle: number[] = new Array<number>(compCount).fill(-1)
for (let c = 0; c < cycleCount; c++) {
  const k = comp[cycleVerts[c][0]]
  if (outerCycle[k] < 0 || cycleArea[c] < cycleArea[outerCycle[k]]) outerCycle[k] = c
}
for (let k = 0; k < compCount; k++) {
  const oc = outerCycle[k]
  const v = cycleVerts[oc][0]
  let best = cycleCount
  let bestArea = Infinity
  for (let c = 0; c < cycleCount; c++) {
    if (cycleArea[c] <= 0 || comp[cycleVerts[c][0]] === k) continue
    if (cycleArea[c] < bestArea && insidePolygon(px[v], py[v], cycleVerts[c])) {
      best = c
      bestArea = cycleArea[c]
    }
  }
  parent[find(oc)] = find(best)
}

// dual graph
const faceIndex = new Map<number, number>()
const faceOf = (c: number): number => {
  const r = find(c)
  let id = faceIndex.get(r)
  if (id === undefined) {
    id = faceIndex.size
    faceIndex.set(r, id)
  }
  return id
}
const dualEdges: [number, number][] = []
for (let i = 0; i < segCount; i++) dualEdges.push([faceOf(cycleOf[2 * i]), faceOf(cycleOf[2 * i + 1])])
const faceCount = faceIndex.size
const degree: number[] = new Array<number>(faceCount).fill(0)
const dist: number[][] = Array.from({ length: faceCount }, (_, i) =>
  Array.from({ length: faceCount }, (_, j) => (i === j ? 0 : Infinity))
)
for (const [a, b] of dualEdges) {
  degree[a]++
  degree[b]++
  if (a !== b) dist[a][b] = dist[b][a] = 1
}
for (let k = 0; k < faceCount; k++)
  for (let i = 0; i < faceCount; i++)
    for (let j = 0; j < faceCount; j++) if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j]

// min-weight perfect matching on odd faces (bitmask DP, pair the lowest free one)
const odd = degree.map((d, i) => (d % 2 ? i : -1)).filter(i => i >= 0)
const full = (1 << odd.length) - 1
const memo = new Map<number, number>()
const match = (mask: number): number => {
  if (mask === full) return 0
  const cached = memo.get(mask)
  if (cached !== undefined) return cached
  let i = 0
  while (mask & (1 << i)) i++
  let best = Infinity
  for (let j = i + 1; j < odd.length; j++) {
    if (mask & (1 << j)) continue
    const cost = dist[odd[i]][odd[j]] + match(mask | (1 << i) | (1 << j))
    if (cost < best) best = cost
  }
  memo.set(mask, best)
  return best
}
console.log(segCount + match(0))
