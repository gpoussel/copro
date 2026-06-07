// @ts-nocheck
// 🎮 CodinGame Puzzle - unique-prefixes
// https://www.codingame.com/training/easy/unique-prefixes

const n = parseInt(readline());
const words: string[] = [];
for (let i = 0; i < n; i++) {
  words.push(readline());
}

// Build a trie where each node stores the count of distinct words passing through it
// (duplicate words count as one)
const distinctWords = [...new Set(words)];

interface TrieNode {
  children: Map<string, TrieNode>;
  count: number; // number of distinct words passing through this node
}

function makeNode(): TrieNode {
  return { children: new Map(), count: 0 };
}

const root = makeNode();

for (const word of distinctWords) {
  let node = root;
  for (const ch of word) {
    if (!node.children.has(ch)) {
      node.children.set(ch, makeNode());
    }
    node = node.children.get(ch)!;
    node.count++;
  }
}

// For each word, find the shortest prefix such that the trie node count is 1
// OR if no such prefix exists (word is prefix of another), the prefix is the word itself
function findPrefix(word: string): string {
  let node = root;
  let prefix = "";
  for (const ch of word) {
    node = node.children.get(ch)!;
    prefix += ch;
    if (node.count === 1) {
      return prefix;
    }
  }
  // Word is a prefix of another word (or a duplicate), return the full word
  return word;
}

for (const word of words) {
  console.log(findPrefix(word));
}
