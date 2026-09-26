// 🎮 CodinGame Puzzle - plague-jr
// https://www.codingame.com/training/medium/plague-jr

// The answer is the radius of the tree: ceil(diameter / 2)
const rodCount = parseInt(readline())
const padCount = rodCount + 1
const adjacency: number[][] = []
for (let i = 0; i < padCount; i++) adjacency.push([])
for (let i = 0; i < rodCount; i++) {
  const [a, b] = readline().split(" ").map(Number)
  adjacency[a].push(b)
  adjacency[b].push(a)
}

function farthestFrom(start: number): [number, number] {
  const dist: number[] = []
  for (let i = 0; i < padCount; i++) dist.push(-1)
  dist[start] = 0
  const queue = [start]
  let farthest = start
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head]
    if (dist[node] > dist[farthest]) farthest = node
    for (const next of adjacency[node]) {
      if (dist[next] < 0) {
        dist[next] = dist[node] + 1
        queue.push(next)
      }
    }
  }
  return [farthest, dist[farthest]]
}

const [endpoint] = farthestFrom(0)
const [, diameter] = farthestFrom(endpoint)
console.log(Math.ceil(diameter / 2))
