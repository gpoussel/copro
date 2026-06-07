// 🎮 CodinGame Puzzle - logically-reasonable-inequalities
// https://www.codingame.com/training/easy/logically-reasonable-inequalities

const n = parseInt(readline())
const edges: [string, string][] = []
const nodes = new Set<string>()

for (let i = 0; i < n; i++) {
  const line = readline() // e.g. "A > B"
  const parts = line.split(" ")
  const left = parts[0]
  const right = parts[2]
  edges.push([left, right])
  nodes.add(left)
  nodes.add(right)
}

// Build adjacency list: left > right => edge from left to right
const adj: Map<string, string[]> = new Map()
for (const node of nodes) {
  adj.set(node, [])
}
for (const [from, to] of edges) {
  adj.get(from)!.push(to)
}

// Detect cycle using DFS with coloring: 0=unvisited, 1=in-stack, 2=done
const color: Map<string, number> = new Map()
for (const node of nodes) {
  color.set(node, 0)
}

let hasCycle = false

function dfs(node: string): void {
  if (hasCycle) return
  color.set(node, 1)
  for (const neighbor of adj.get(node)!) {
    if (color.get(neighbor) === 1) {
      hasCycle = true
      return
    }
    if (color.get(neighbor) === 0) {
      dfs(neighbor)
    }
  }
  color.set(node, 2)
}

for (const node of nodes) {
  if (color.get(node) === 0) {
    dfs(node)
  }
  if (hasCycle) break
}

console.log(hasCycle ? "contradiction" : "consistent")
