// 🎮 CodinGame Puzzle - tree-paths
// https://www.codingame.com/training/easy/tree-paths

const N = parseInt(readline())
const V = parseInt(readline())
const M = parseInt(readline())

// Map from child node -> { parent, direction }
const parentMap: Record<number, { parent: number; direction: string }> = {}
// Track all nodes that appear as children to find the root
const hasParent = new Set<number>()

for (let i = 0; i < M; i++) {
  const [P, L, R] = readline().split(" ").map(Number)
  parentMap[L] = { parent: P, direction: "Left" }
  parentMap[R] = { parent: P, direction: "Right" }
  hasParent.add(L)
  hasParent.add(R)
}

// Find root: the node that is never a child
// All nodes 1..N exist; root is the one not in hasParent
let root = -1
for (let i = 1; i <= N; i++) {
  if (!hasParent.has(i)) {
    root = i
    break
  }
}

// If V is root, print Root
if (V === root) {
  console.log("Root")
} else {
  // Trace path from V up to root, collecting directions in reverse
  const path: string[] = []
  let current = V
  while (current !== root) {
    const { parent, direction } = parentMap[current]
    path.push(direction)
    current = parent
  }
  path.reverse()
  console.log(path.join(" "))
}
