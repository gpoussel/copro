// 🎮 CodinGame Puzzle - elevator
// https://www.codingame.com/training/hard/elevator

// Plain BFS over the n floors, each press being an edge (+a or -b).
const [n, a, b, k, m] = readline().split(" ").map(Number)
const dist = new Int32Array(n + 1).fill(-1)
dist[k] = 0
const queue = [k]
for (let head = 0; head < queue.length && dist[m] < 0; head++) {
  const f = queue[head]
  for (const g of [f + a, f - b]) {
    if (g < 1 || g > n || dist[g] >= 0) continue
    dist[g] = dist[f] + 1
    queue.push(g)
  }
}
console.log(dist[m] < 0 ? "IMPOSSIBLE" : String(dist[m]))
