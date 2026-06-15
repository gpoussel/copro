// 🎮 CodinGame Puzzle - levenshtein-distance
// https://www.codingame.com/training/hard/levenshtein-distance

const a: string = readline()
const b: string = readline()
const m = a.length
const n = b.length
let prev: number[] = []
for (let j = 0; j <= n; j++) prev[j] = j
for (let i = 1; i <= m; i++) {
  const cur: number[] = [i]
  for (let j = 1; j <= n; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1
    cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
  }
  prev = cur
}
console.log(prev[n])
