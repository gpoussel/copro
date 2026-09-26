// 🎮 CodinGame Puzzle - dawg
// https://www.codingame.com/training/hard/dawg

// Build a trie, then minimise it bottom-up: two nodes are equivalent when they
// have the same end-of-word flag and the same labelled edges to equivalent
// children. Answer = number of distinct classes + the shared sink node.

type TrieNode = { end: boolean; next: Map<string, TrieNode> }

const dawgN = parseInt(readline())
const trieRoot: TrieNode = { end: false, next: new Map() }
for (let i = 0; i < dawgN; i++) {
  const w = readline().trim()
  let node = trieRoot
  for (const ch of w) {
    let child = node.next.get(ch)
    if (!child) {
      child = { end: false, next: new Map() }
      node.next.set(ch, child)
    }
    node = child
  }
  node.end = true
}

const classes = new Map<string, number>()
function classify(node: TrieNode): number {
  const parts: string[] = [node.end ? "1" : "0"]
  for (const ch of [...node.next.keys()].sort()) parts.push(ch + classify(node.next.get(ch)!))
  const sig = parts.join(",")
  let id = classes.get(sig)
  if (id === undefined) {
    id = classes.size
    classes.set(sig, id)
  }
  return id
}

classify(trieRoot)
console.log(classes.size + 1)
