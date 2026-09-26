// 🎮 CodinGame Puzzle - advanced-tree
// https://www.codingame.com/training/medium/advanced-tree

interface TreeNode {
  name: string
  children: { [name: string]: TreeNode }
  isDir: boolean
}

const newNode = (nodeName: string, isDir: boolean): TreeNode => ({ name: nodeName, children: {}, isDir })

const startPath = readline()
const flagLine = readline() || ""
const fileCount = parseInt(readline())

const treeRoot = newNode(".", true)
for (let i = 0; i < fileCount; i++) {
  const parts = readline()
    .trim()
    .split("/")
    .filter(p => p !== "" && p !== ".")
  let node = treeRoot
  parts.forEach((part, idx) => {
    const isDir = idx < parts.length - 1
    if (!node.children[part]) node.children[part] = newNode(part, isDir)
    node = node.children[part]
  })
}

let showAll = false
let dirsOnly = false
let maxDepth = Infinity
for (const rawFlag of flagLine.split(",")) {
  const flag = rawFlag.trim()
  if (flag === "-a") showAll = true
  else if (flag === "-d") dirsOnly = true
  else {
    const m = /^-L\s+(\d+)$/.exec(flag)
    if (m && parseInt(m[1]) > 0) maxDepth = parseInt(m[1])
  }
}

// Resolve the starting directory
const startParts = startPath
  .trim()
  .split("/")
  .filter(p => p !== "" && p !== ".")
let startNode: TreeNode | undefined = treeRoot
for (const part of startParts) {
  startNode = startNode && startNode.isDir ? startNode.children[part] : undefined
}

const sortKey = (n: TreeNode) => (n.name[0] === "." ? n.name.substring(1) : n.name).toLowerCase()

let dirCount = 0
let fileTotal = 0
const treeLines: string[] = []

function walk(node: TreeNode, prefix: string, depth: number): void {
  const entries = Object.keys(node.children)
    .map(k => node.children[k])
    .filter(n => (showAll || n.name[0] !== ".") && (!dirsOnly || n.isDir))
    .sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : sortKey(a) > sortKey(b) ? 1 : 0))
  entries.forEach((child, idx) => {
    const last = idx === entries.length - 1
    treeLines.push(prefix + (last ? "`-- " : "|-- ") + child.name)
    if (child.isDir) {
      dirCount++
      if (depth < maxDepth) walk(child, prefix + (last ? "    " : "|   "), depth + 1)
    } else fileTotal++
  })
}

if (startNode === undefined || !startNode.isDir) {
  treeLines.push(startPath + " [error opening dir]")
} else {
  treeLines.push(startPath)
  walk(startNode, "", 1)
}

treeLines.push("")
const dirWord = dirCount === 1 ? "directory" : "directories"
const fileWord = fileTotal === 1 ? "file" : "files"
treeLines.push(dirsOnly ? `${dirCount} ${dirWord}` : `${dirCount} ${dirWord}, ${fileTotal} ${fileWord}`)
console.log(treeLines.join("\n"))
