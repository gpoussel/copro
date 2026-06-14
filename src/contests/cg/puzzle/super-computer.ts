// 🎮 CodinGame Puzzle - super-computer
// https://www.codingame.com/training/hard/super-computer

// Classic activity-selection: each task occupies [start, start+dur-1]. Sort by
// end day and greedily pick every task whose start is strictly after the last
// chosen task's end (overlapping tasks cannot both run).
const N = parseInt(readline())
const intervals: [number, number][] = []
for (let i = 0; i < N; i++) {
  const parts = readline().split(" ").map(Number)
  const start = parts[0]
  const dur = parts[1]
  intervals.push([start, start + dur - 1])
}
intervals.sort((a, b) => a[1] - b[1])
let count = 0
let lastEnd = -Infinity
for (const [s, e] of intervals) {
  if (s > lastEnd) {
    count++
    lastEnd = e
  }
}
console.log(count)
