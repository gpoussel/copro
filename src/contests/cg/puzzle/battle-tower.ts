// 🎮 CodinGame Puzzle - battle-tower
// https://www.codingame.com/training/medium/battle-tower

// Every corridor needs an exit at one end: minimum vertex cover of a tree (tree DP).
// A lone cell has no corridor but still needs its own exit.
const n = parseInt(readline())
const adj: number[][] = []
for (let i = 0; i <= n; i++) adj.push([])
for (let i = 0; i < n; i++) {
  const [id, count, ...others] = readline().trim().split(/\s+/).map(Number)
  for (let k = 0; k < count; k++) adj[id].push(others[k])
}

if (n === 1) {
  console.log(1)
} else {
  // Iterative DFS order from cell 1, then process children before parents
  const parent = new Array<number>(n + 1).fill(0)
  const order: number[] = []
  const stack = [1]
  parent[1] = -1
  while (stack.length) {
    const u = stack.pop()!
    order.push(u)
    for (const v of adj[u]) {
      if (v === parent[u]) continue
      parent[v] = u
      stack.push(v)
    }
  }
  const withExit = new Array<number>(n + 1).fill(1)
  const withoutExit = new Array<number>(n + 1).fill(0)
  for (let i = order.length - 1; i >= 0; i--) {
    const u = order[i]
    const p = parent[u]
    if (p <= 0) continue
    withExit[p] += Math.min(withExit[u], withoutExit[u])
    withoutExit[p] += withExit[u]
  }
  console.log(Math.min(withExit[1], withoutExit[1]))
}
