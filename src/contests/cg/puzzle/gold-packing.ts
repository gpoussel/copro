// 🎮 CodinGame Puzzle - gold-packing
// https://www.codingame.com/training/easy/gold-packing

// Approach: subset-sum DP to find best total fill (max sum <= m),
// then among all subsets achieving that sum, pick fewest bars,
// then lexicographically smallest sequence (minimize bar[0], then bar[1], ...).

const m = parseInt(readline())
const n = parseInt(readline())
const bars = readline().split(" ").map(Number)

// dp[s] = { achievable: bool }
// We need to track best subsets. Since n<=20 and m<=2000, use bitmask approach.
// n<=20 => 2^20 = ~1M subsets — feasible.

let bestSum = 0
let bestMask = 0
let bestCount = Infinity

for (let mask = 1; mask < 1 << n; mask++) {
  let sum = 0
  let count = 0
  for (let i = 0; i < n; i++) {
    if (mask & (1 << i)) {
      sum += bars[i]
      count++
    }
  }
  if (sum > m) continue

  if (sum > bestSum) {
    bestSum = sum
    bestMask = mask
    bestCount = count
  } else if (sum === bestSum) {
    if (count < bestCount) {
      bestMask = mask
      bestCount = count
    } else if (count === bestCount) {
      // Compare lexicographically: bars are sorted, so compare the selected bars
      // We want to minimize first selected bar, then second, etc.
      // Since bars are sorted ascending, we want the mask that picks bars
      // with smallest indices first.
      // Compare current bestMask vs mask:
      // Extract selected bar indices in order for both
      const bestBars: number[] = []
      const curBars: number[] = []
      for (let i = 0; i < n; i++) {
        if (bestMask & (1 << i)) bestBars.push(bars[i])
        if (mask & (1 << i)) curBars.push(bars[i])
      }
      for (let i = 0; i < bestBars.length; i++) {
        if (curBars[i] < bestBars[i]) {
          bestMask = mask
          bestCount = count
          break
        } else if (curBars[i] > bestBars[i]) {
          break
        }
      }
    }
  }
}

const result: number[] = []
for (let i = 0; i < n; i++) {
  if (bestMask & (1 << i)) {
    result.push(bars[i])
  }
}

console.log(result.join(" "))
