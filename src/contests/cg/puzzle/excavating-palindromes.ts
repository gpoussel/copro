// 🎮 CodinGame Puzzle - excavating-palindromes
// https://www.codingame.com/training/medium/excavating-palindromes

const s = readline().trim()
const n = s.length

// Longest palindromic subsequence: best[i][j] for s[i..j]
const best: number[][] = []
for (let i = 0; i < n; i++) best.push(new Array(n).fill(0))
for (let i = n - 1; i >= 0; i--) {
  best[i][i] = 1
  for (let j = i + 1; j < n; j++) {
    best[i][j] = s[i] === s[j] ? (j - i > 1 ? best[i + 1][j - 1] : 0) + 2 : Math.max(best[i + 1][j], best[i][j - 1])
  }
}
console.log(best[0][n - 1])
