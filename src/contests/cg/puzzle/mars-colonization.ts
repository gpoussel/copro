// 🎮 CodinGame Puzzle - mars-colonization
// https://www.codingame.com/training/hard/mars-colonization

// Arctic-network problem: build the Euclidean MST; S satellites link S
// components for free, so the S-1 longest MST edges are dropped and the
// answer is the longest remaining one.

const [m, s] = readline().split(" ").map(Number)
const xs: number[] = []
const ys: number[] = []
for (let i = 0; i < m; i++) {
  const [x, y] = readline().split(" ").map(Number)
  xs.push(x)
  ys.push(y)
}

// Prim's algorithm in O(M^2)
const inTree: boolean[] = new Array(m).fill(false)
const dist: number[] = new Array(m).fill(Infinity)
const edges: number[] = []
dist[0] = 0
for (let k = 0; k < m; k++) {
  let u = -1
  for (let i = 0; i < m; i++) if (!inTree[i] && (u < 0 || dist[i] < dist[u])) u = i
  inTree[u] = true
  if (k > 0) edges.push(dist[u])
  for (let v = 0; v < m; v++) {
    if (!inTree[v]) dist[v] = Math.min(dist[v], Math.hypot(xs[u] - xs[v], ys[u] - ys[v]))
  }
}

edges.sort((a, b) => a - b)
const keep = m - s
console.log((keep > 0 ? edges[keep - 1] : 0).toFixed(2))
