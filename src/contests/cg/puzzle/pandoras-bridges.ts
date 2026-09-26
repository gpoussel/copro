// 🎮 CodinGame Puzzle - pandoras-bridges
// https://www.codingame.com/training/hard/pandoras-bridges

// Minimum spanning tree (Prim, O(V^2)) over the islands plus the Hometree at
// (1,1,1), where a bridge is allowed only if it is at most 1000 long and its
// slope is under 45 degrees (|dz| < horizontal distance). Then bridges are
// cut from longest to shortest, first-fit into the leftovers in felling order.

const EPS = 1e-9
const pbN = parseInt(readline())
const pts: number[][] = [[1, 1, 1]]
for (let i = 0; i < pbN; i++) pts.push(readline().trim().split(/\s+/).map(Number))
const nodeCount = pts.length

function bridgeLength(a: number[], b: number[]): number {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  const dz = a[2] - b[2]
  const horiz = Math.hypot(dx, dy)
  const len = Math.hypot(horiz, dz)
  if (len > 1000 + EPS || Math.abs(dz) >= horiz - EPS) return Infinity
  return len
}

const inTree = new Array<boolean>(nodeCount).fill(false)
const best = new Array<number>(nodeCount).fill(Infinity)
best[0] = 0
const bridges: number[] = []
for (let it = 0; it < nodeCount; it++) {
  let u = -1
  for (let v = 0; v < nodeCount; v++) if (!inTree[v] && (u < 0 || best[v] < best[u])) u = v
  if (best[u] === Infinity) break
  inTree[u] = true
  if (it > 0) bridges.push(best[u])
  for (let v = 0; v < nodeCount; v++) {
    if (inTree[v]) continue
    const d = bridgeLength(pts[u], pts[v])
    if (d < best[v]) best[v] = d
  }
}

bridges.sort((a, b) => b - a)
const leftovers: number[] = []
let total = 0
for (const len of bridges) {
  total += len
  const k = leftovers.findIndex(l => l >= len - EPS)
  if (k >= 0) leftovers[k] -= len
  else leftovers.push(1000 - len)
}

console.log((Math.floor(total * 100 + 1e-6) / 100).toFixed(2))
console.log(leftovers.length)
