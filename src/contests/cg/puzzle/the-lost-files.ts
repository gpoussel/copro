// 🎮 CodinGame Puzzle - the-lost-files
// https://www.codingame.com/training/medium/the-lost-files

// Euler's formula for a planar graph with C components: V - E + F = 1 + C,
// where F counts the outer face, so the number of tiles is T = E - V + C
const edgeCount = parseInt(readline())
const parentOf: { [vertex: number]: number } = {}

function findRoot(v: number): number {
  while (parentOf[v] !== v) {
    parentOf[v] = parentOf[parentOf[v]]
    v = parentOf[v]
  }
  return v
}

let vertexCount = 0
let componentCount = 0
for (let i = 0; i < edgeCount; i++) {
  const [a, b] = readline().split(" ").map(Number)
  for (const v of [a, b]) {
    if (parentOf[v] === undefined) {
      parentOf[v] = v
      vertexCount++
      componentCount++
    }
  }
  const rootA = findRoot(a)
  const rootB = findRoot(b)
  if (rootA !== rootB) {
    parentOf[rootA] = rootB
    componentCount--
  }
}
console.log(`${componentCount} ${edgeCount - vertexCount + componentCount}`)
