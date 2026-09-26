// 🎮 CodinGame Puzzle - electrical-grid
// https://www.codingame.com/training/hard/electrical-grid

// Minimum spanning tree with Kruskal's algorithm (union-find).

const [houseCount, pairCount] = readline().split(" ").map(Number)
const links: [number, number, number][] = []
for (let i = 0; i < pairCount; i++) {
  const [a, b, c] = readline().split(" ").map(Number)
  links.push([a, b, c])
}

const parent = Array.from({ length: houseCount + 1 }, (_, i) => i)
const find = (v: number): number => {
  while (parent[v] !== v) {
    parent[v] = parent[parent[v]]
    v = parent[v]
  }
  return v
}

const chosen: [number, number, number][] = []
let total = 0
for (const link of [...links].sort((p, q) => p[2] - q[2])) {
  const ra = find(link[0])
  const rb = find(link[1])
  if (ra === rb) continue
  parent[ra] = rb
  chosen.push(link)
  total += link[2]
}
chosen.sort((p, q) => p[0] - q[0] || p[1] - q[1])
console.log([`${chosen.length} ${total}`, ...chosen.map(l => l.join(" "))].join("\n"))
