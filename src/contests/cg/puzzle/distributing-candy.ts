// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/

const [n, m] = readline()
  .split(" ")
  .map(s => parseInt(s, 10))
const candies: number[] = readline()
  .split(" ")
  .map(s => parseInt(s, 10))
  .sort((a, b) => a - b)

let best = Infinity
for (let i = 0; i + m - 1 < n; i++) {
  const diff = candies[i + m - 1] - candies[i]
  if (diff < best) best = diff
}

console.log(best)
