// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

const [n, m] = readline().split(" ").map(Number)
const c = readline().split(" ").map(Number)
c.sort((a, b) => a - b)
let best = Infinity
for (let i = 0; i + m <= n; i++) {
  best = Math.min(best, c[i + m - 1] - c[i])
}
console.log(best)
