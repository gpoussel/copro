// 🎮 CodinGame Puzzle - the-hidden-fortress
// https://www.codingame.com/training/hard/the-hidden-fortress

// v[i][j] = R_i + C_j - x[i][j] with R/C the row/column counts and x the cell.
// Summing a row gives (n-1)·R_i + T, summing everything gives (2n-1)·T, so T,
// then every R_i and C_j follow, and finally x[i][j] = R_i + C_j - v[i][j].

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const n = parseInt(readline())
const v: number[][] = []
for (let i = 0; i < n; i++) v.push([...readline().trim()].map(c => DIGITS.indexOf(c)))

const rowSum = v.map(r => r.reduce((a, b) => a + b, 0))
const colSum = v[0].map((_, j) => v.reduce((a, r) => a + r[j], 0))
const total = rowSum.reduce((a, b) => a + b, 0) / (2 * n - 1)
const R = rowSum.map(s => (s - total) / (n - 1))
const C = colSum.map(s => (s - total) / (n - 1))
for (let i = 0; i < n; i++) {
  let line = ""
  for (let j = 0; j < n; j++) line += R[i] + C[j] - v[i][j] === 1 ? "O" : "."
  console.log(line)
}
