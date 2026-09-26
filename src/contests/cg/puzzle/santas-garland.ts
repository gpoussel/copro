// 🎮 CodinGame Puzzle - santas-garland
// https://www.codingame.com/training/medium/santas-garland

// A wire used with k steps still to go before reaching the star survives iff its rating T > k.
// That only depends on the remaining distance, so a BFS backwards from the star works:
// from a node at remaining distance k, a wire with T > k leads to a node at distance k + 1.

const [nodeCount, wireCount] = readline().trim().split(/\s+/).map(Number)
const [source, star] = readline().trim().split(/\s+/).map(Number)
const wires: [number, number][][] = []
for (let i = 0; i < nodeCount; i++) wires.push([])
for (let i = 0; i < wireCount; i++) {
  const [a, b, t] = readline().trim().split(/\s+/).map(Number)
  wires[a].push([b, t])
  wires[b].push([a, t])
}

const remaining: number[] = new Array(nodeCount).fill(-1)
remaining[star] = 0
const bfs = [star]
for (let qi = 0; qi < bfs.length; qi++) {
  const v = bfs[qi]
  const k = remaining[v]
  for (const [u, t] of wires[v]) {
    if (remaining[u] >= 0 || t <= k) continue
    remaining[u] = k + 1
    bfs.push(u)
  }
}

console.log(remaining[source] < 0 ? "IMPOSSIBLE" : remaining[source])
