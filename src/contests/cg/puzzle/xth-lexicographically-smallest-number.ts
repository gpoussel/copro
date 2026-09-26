// 🎮 CodinGame Puzzle - xth-lexicographically-smallest-number
// https://www.codingame.com/training/hard/xth-lexicographically-smallest-number

// Walk the base-b digit trie: for each candidate prefix count how many
// numbers of [m, n] start with it (one interval per length); skip whole
// subtrees while x is larger, otherwise descend into it.
const [m, n, b, x0] = readline().split(" ").map(Number)

function count(p: number): number {
  let total = 0
  for (let lo = p, hi = p; lo <= n; lo *= b, hi = hi * b + b - 1) {
    const a = Math.max(lo, m)
    const z = Math.min(hi, n)
    if (z >= a) total += z - a + 1
  }
  return total
}

let x = x0
let p = 1
let answer = -1
while (answer < 0) {
  const c = count(p)
  if (x > c) {
    // skip this subtree, go to the next sibling
    x -= c
    p++
    continue
  }
  if (p >= m && p <= n) {
    x--
    if (x === 0) answer = p
  }
  p *= b
}
console.log(answer)
