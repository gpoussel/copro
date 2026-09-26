// 🎮 CodinGame Puzzle - box-of-cigars
// https://www.codingame.com/training/medium/box-of-cigars

const n = Number(readline())
const present: boolean[] = new Array(1001).fill(false)
for (let i = 0; i < n; i++) present[Number(readline())] = true
const lengths: number[] = []
for (let v = 1; v <= 1000; v++) if (present[v]) lengths.push(v)

// Longest arithmetic progression with a positive difference (lengths are distinct values)
let best = 1
for (let i = 0; i < lengths.length; i++) {
  for (let j = i + 1; j < lengths.length; j++) {
    const start = lengths[i]
    const d = lengths[j] - start
    // Only count from the first term of a progression
    if (start - d >= 1 && present[start - d]) continue
    let count = 1
    for (let v = start + d; v <= 1000 && present[v]; v += d) count++
    best = Math.max(best, count)
  }
}
console.log(best)
