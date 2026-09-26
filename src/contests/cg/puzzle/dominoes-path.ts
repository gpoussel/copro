// 🎮 CodinGame Puzzle - dominoes-path
// https://www.codingame.com/training/medium/dominoes-path

// A single path using every domino is an Eulerian path in the multigraph
// whose vertices are the pip values and whose edges are the dominoes.
const dominoCount = Number(readline())
const degree = new Array(7).fill(0)
const parent = [0, 1, 2, 3, 4, 5, 6]
const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
const used: boolean[] = new Array(7).fill(false)
for (let i = 0; i < dominoCount; i++) {
  const [a, b] = readline().split(" ").map(Number)
  degree[a]++
  degree[b]++
  used[a] = used[b] = true
  parent[find(a)] = find(b)
}

const roots = new Set<number>()
for (let v = 0; v < 7; v++) if (used[v]) roots.add(find(v))
const oddCount = degree.filter(d => d % 2 === 1).length
console.log(roots.size === 1 && (oddCount === 0 || oddCount === 2) ? "true" : "false")
