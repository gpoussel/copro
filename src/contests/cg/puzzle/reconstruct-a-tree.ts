// 🎮 CodinGame Puzzle - reconstruct-a-tree
// https://www.codingame.com/training/medium/reconstruct-a-tree

const code = readline().trim().split(" ").filter(s => s.length > 0).map(Number)
const root = parseInt(readline())
const n = code.length + 2

// Standard Prüfer decoding: repeatedly link the smallest leaf to the next code entry
const degree: number[] = new Array(n + 1).fill(1)
for (const v of code) degree[v]++
const adjacency: number[][] = []
for (let i = 0; i <= n; i++) adjacency.push([])
const link = (a: number, b: number): void => {
  adjacency[a].push(b)
  adjacency[b].push(a)
}

for (const v of code) {
  let leaf = 1
  while (degree[leaf] !== 1) leaf++
  link(leaf, v)
  degree[leaf]--
  degree[v]--
}
const remaining: number[] = []
for (let i = 1; i <= n; i++) if (degree[i] === 1) remaining.push(i)
link(remaining[0], remaining[1])

const render = (node: number, parent: number): string => {
  const children = adjacency[node].filter(c => c !== parent).sort((a, b) => a - b)
  return `(${[String(node)].concat(children.map(c => render(c, node))).join(" ")})`
}
console.log(render(root, 0))
