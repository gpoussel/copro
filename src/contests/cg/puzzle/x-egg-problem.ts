// 🎮 CodinGame Puzzle - x-egg-problem
// https://www.codingame.com/training/hard/x-egg-problem

// With t drops and x eggs we can distinguish f(t, x) = f(t-1, x-1) + f(t-1, x) + 1
// floors. Grow t until f(t, X) >= N (values are capped at N to stay small).
const n = Number(readline())
const x = Number(readline())
let f = new Array<number>(x + 1).fill(0)
let t = 0
while (f[x] < n) {
  t++
  const g = new Array<number>(x + 1).fill(0)
  for (let e = 1; e <= x; e++) g[e] = Math.min(n, f[e - 1] + f[e] + 1)
  f = g
}
console.log(t)
