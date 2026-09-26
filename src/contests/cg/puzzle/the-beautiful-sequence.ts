// 🎮 CodinGame Puzzle - the-beautiful-sequence
// https://www.codingame.com/training/hard/the-beautiful-sequence

// Largest rectangle in a histogram: a monotonic stack gives, for each
// element, the widest window in which it is the minimum, in O(N).
const n = parseInt(readline())
const a: number[] = []
while (a.length < n) {
  const line = readline()
  if (line === undefined) break
  for (const tok of line.trim().split(/\s+/)) if (tok !== "") a.push(Number(tok))
}

let best = 0
const stack: number[] = [] // indices with increasing values
for (let i = 0; i <= n; i++) {
  const h = i === n ? -1 : a[i]
  while (stack.length && a[stack[stack.length - 1]] >= h) {
    const top = stack.pop() as number
    const left = stack.length ? stack[stack.length - 1] + 1 : 0
    best = Math.max(best, a[top] * (i - left))
  }
  stack.push(i)
}
console.log(best)
