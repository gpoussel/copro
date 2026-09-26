// 🎮 CodinGame Puzzle - counter-attack
// https://www.codingame.com/training/hard/counter-attack

// Breakages split the days into k consecutive segments (the first starting at
// day 1); a segment starting at s must read 0, 1, 2, ... DP over (end, k)
// with the mismatch count of each segment.
const n = Number(readline())
const a = readline().trim().split(/\s+/).map(Number)
// cost[s][e]: modifications for a segment covering days s..e-1
const cost: number[][] = []
for (let s = 0; s < n; s++) {
  const row = new Array<number>(n + 1).fill(0)
  for (let e = s + 1; e <= n; e++) row[e] = row[e - 1] + (a[e - 1] !== e - 1 - s ? 1 : 0)
  cost.push(row)
}
const INF = 1e9
// dp[k][e]: first e days covered by k segments
let dp = new Array<number>(n + 1).fill(INF)
dp[0] = 0
const out: number[] = []
for (let k = 1; k <= n; k++) {
  const nd = new Array<number>(n + 1).fill(INF)
  for (let s = 0; s < n; s++) {
    if (dp[s] >= INF) continue
    for (let e = s + 1; e <= n; e++) nd[e] = Math.min(nd[e], dp[s] + cost[s][e])
  }
  dp = nd
  out.push(dp[n])
}
console.log(out.join("\n"))
