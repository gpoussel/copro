// 🎮 CodinGame Puzzle - plight-of-the-fellowship-of-the-ring
// https://www.codingame.com/training/medium/plight-of-the-fellowship-of-the-ring

const n = parseInt(readline())
const m = parseInt(readline())
const l = parseInt(readline())
const spots: number[][] = []
for (let i = 0; i < n; i++) spots.push(readline().split(" ").map(Number))
const orcs: number[][] = []
for (let i = 0; i < m; i++) orcs.push(readline().split(" ").map(Number))
const adj: number[][] = spots.map(() => [])
for (let i = 0; i < l; i++) {
  const [a, b] = readline().split(" ").map(Number)
  adj[a].push(b)
  adj[b].push(a)
}
adj.forEach(list => list.sort((a, b) => a - b))
const start = parseInt(readline())
const end = parseInt(readline())

// A spot reached after `moves` moves is safe only if every orc is farther than `moves`
const safe = (spot: number, moves: number) =>
  orcs.every(([x, y]) => (x - spots[spot][0]) ** 2 + (y - spots[spot][1]) ** 2 > moves * moves)

// BFS: the earliest arrival is also the safest, since orcs only get closer with time
const dist: number[] = new Array(n).fill(-1)
const prev: number[] = new Array(n).fill(-1)
dist[start] = 0
const queue = [start]
for (let qi = 0; qi < queue.length; qi++) {
  const u = queue[qi]
  for (const v of adj[u]) {
    if (dist[v] >= 0 || !safe(v, dist[u] + 1)) continue
    dist[v] = dist[u] + 1
    prev[v] = u
    queue.push(v)
  }
}

if (dist[end] < 0) {
  console.log("IMPOSSIBLE")
} else {
  const path: number[] = []
  for (let v = end; v >= 0; v = prev[v]) path.unshift(v)
  console.log(path.join(" "))
}
