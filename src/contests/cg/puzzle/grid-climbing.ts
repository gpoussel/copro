// 🎮 CodinGame Puzzle - grid-climbing
// https://www.codingame.com/training/hard/grid-climbing

// Every cell can jump to every other cell, so the graph is dense (n² ≤ 1600 nodes):
// a plain O(V²) Dijkstra, where moving to (i', j') costs costs[d-1] + grid(i', j')
// with d the Chebyshev distance, is the right fit.

const n = parseInt(readline())
const costs = readline().split(" ").map(Number)
const grid: number[] = []
for (let i = 0; i < n; i++) for (const ch of readline().trim()) grid.push(Number(ch))

const total = n * n
const dist = new Float64Array(total).fill(Infinity)
const done = new Uint8Array(total)
dist[0] = grid[0]
for (let iter = 0; iter < total; iter++) {
  let u = -1
  for (let v = 0; v < total; v++) if (!done[v] && (u < 0 || dist[v] < dist[u])) u = v
  if (u === total - 1) break
  done[u] = 1
  const ui = Math.floor(u / n)
  const uj = u % n
  for (let v = 0; v < total; v++) {
    if (done[v]) continue
    const d = Math.max(Math.abs(Math.floor(v / n) - ui), Math.abs((v % n) - uj))
    const c = dist[u] + costs[d - 1] + grid[v]
    if (c < dist[v]) dist[v] = c
  }
}
console.log(dist[total - 1])
