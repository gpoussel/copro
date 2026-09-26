// 🎮 CodinGame Puzzle - consecutive-balanced-substrings
// https://www.codingame.com/training/medium/consecutive-balanced-substrings

// Every pair of positions sharing the same prefix balance (#1 - #0) delimits a
// balanced substring, so k+1 positions with equal balance give k consecutive ones.
readline()
const s = readline().trim()
const counts = new Map<number, number>([[0, 1]])
let balance = 0
let best = 0
for (const ch of s) {
  balance += ch === "1" ? 1 : -1
  const count = (counts.get(balance) || 0) + 1
  counts.set(balance, count)
  best = Math.max(best, count - 1)
}
console.log(best)
