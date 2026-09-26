// 🎮 CodinGame Puzzle - the-optimal-urinal-problem
// https://www.codingame.com/training/medium/the-optimal-urinal-problem

const n = parseInt(readline())

// inner[g]: guys fitting in a run of g free urinals bounded by occupied ones on both sides.
// The next guy takes the middle, splitting the run in two independent halves.
const inner = new Int32Array(n + 1)
for (let g = 3; g <= n; g++) {
  const half = (g - 1) >> 1
  inner[g] = 1 + inner[half] + inner[g - 1 - half]
}
// A run of L free urinals against a wall: the wall-side urinal is taken first
const edge = (len: number) => (len >= 2 ? 1 + inner[len - 1] : 0)

let best = 0
let bestIndex = 1
for (let i = 1; i <= n; i++) {
  const total = 1 + edge(i - 1) + edge(n - i)
  if (total > best) {
    best = total
    bestIndex = i
  }
}
console.log(`${best} ${bestIndex}`)
