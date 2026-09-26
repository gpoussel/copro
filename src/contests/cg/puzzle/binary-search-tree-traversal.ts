// 🎮 CodinGame Puzzle - binary-search-tree-traversal
// https://www.codingame.com/training/medium/binary-search-tree-traversal

interface TreeNode {
  value: number
  left: TreeNode | null
  right: TreeNode | null
}

readline()
const values = readline().trim().split(/\s+/).map(Number)

let root: TreeNode | null = null
for (const v of values) {
  const node: TreeNode = { value: v, left: null, right: null }
  if (!root) {
    root = node
    continue
  }
  let cur: TreeNode = root
  while (true) {
    if (v < cur.value) {
      if (!cur.left) {
        cur.left = node
        break
      }
      cur = cur.left
    } else {
      if (!cur.right) {
        cur.right = node
        break
      }
      cur = cur.right
    }
  }
}

const pre: number[] = []
const inOrder: number[] = []
const post: number[] = []
function walk(node: TreeNode | null): void {
  if (!node) return
  pre.push(node.value)
  walk(node.left)
  inOrder.push(node.value)
  walk(node.right)
  post.push(node.value)
}
walk(root)

const level: number[] = []
const queue: TreeNode[] = root ? [root] : []
for (let i = 0; i < queue.length; i++) {
  const node = queue[i]
  level.push(node.value)
  if (node.left) queue.push(node.left)
  if (node.right) queue.push(node.right)
}

console.log([pre, inOrder, post, level].map(l => l.join(" ")).join("\n"))
