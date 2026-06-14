// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

// Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
const n: number = parseInt(readline())
let best = ""
for (let i = 0; i < n; i++) {
  const t = readline().trim()
  if (best === "" || t < best) best = t
}
console.log(best)
