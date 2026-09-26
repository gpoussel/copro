// 🎮 CodinGame Puzzle - tree-recognition
// https://www.codingame.com/training/medium/tree-recognition

interface BstNode {
  value: number
  left: BstNode | null
  right: BstNode | null
}

function insertValue(root: BstNode | null, value: number): BstNode {
  const node: BstNode = { value, left: null, right: null }
  if (!root) return node
  let current = root
  for (;;) {
    if (value < current.value) {
      if (!current.left) {
        current.left = node
        break
      }
      current = current.left
    } else {
      if (!current.right) {
        current.right = node
        break
      }
      current = current.right
    }
  }
  return root
}

// Canonical string of the tree shape, ignoring values
function shapeOf(node: BstNode | null): string {
  return node ? "(" + shapeOf(node.left) + shapeOf(node.right) + ")" : "."
}

const [listCount] = readline().split(" ").map(Number)
const shapes: { [shape: string]: boolean } = {}
let distinctShapes = 0
for (let i = 0; i < listCount; i++) {
  let root: BstNode | null = null
  for (const token of readline().trim().split(/\s+/)) root = insertValue(root, parseInt(token, 10))
  const shape = shapeOf(root)
  if (!shapes[shape]) {
    shapes[shape] = true
    distinctShapes++
  }
}
console.log(distinctShapes)
