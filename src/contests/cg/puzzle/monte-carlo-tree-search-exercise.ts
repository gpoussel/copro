// 🎮 CodinGame Puzzle - monte-carlo-tree-search-exercise
// https://www.codingame.com/training/hard/monte-carlo-tree-search-exercise

// Replay the playouts: follow the existing tree, add at most one new node,
// and back-propagate visits/scores along the path. Then descend with UCB1,
// ties going to the smallest letter.
type TreeNode = { visits: number; score: number; children: Map<string, TreeNode> }
const newNode = (): TreeNode => ({ visits: 0, score: 0, children: new Map() })

const [nStr, cStr] = readline().split(" ")
const c = Number(cStr)
const root = newNode()
for (let i = 0; i < Number(nStr); i++) {
  const [moves, scoreStr] = readline().split(" ")
  const score = Number(scoreStr)
  let node = root
  node.visits++
  node.score += score
  for (const m of moves) {
    let child = node.children.get(m)
    const created = !child
    if (!child) {
      child = newNode()
      node.children.set(m, child)
    }
    child.visits++
    child.score += score
    node = child
    if (created) break
  }
}

let path = ""
let node = root
while (node.children.size > 0) {
  let best: [string, TreeNode] | null = null
  let bestValue = -Infinity
  for (const [m, child] of [...node.children].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const value = child.score / child.visits + c * Math.sqrt(Math.log(node.visits) / child.visits)
    if (value > bestValue + 1e-9) {
      bestValue = value
      best = [m, child]
    }
  }
  if (best === null) break
  path += best[0]
  node = best[1]
}
console.log(path)
