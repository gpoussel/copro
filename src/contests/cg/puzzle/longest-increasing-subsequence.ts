// 🎮 CodinGame Puzzle - longest-increasing-subsequence
// https://www.codingame.com/training/medium/longest-increasing-subsequence

const n = parseInt(readline())
// tails[k] = smallest possible last value of a strictly increasing subsequence of length k + 1
const tails: number[] = []
for (let i = 0; i < n; i++) {
  const value = parseInt(readline())
  let lo = 0
  let hi = tails.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (tails[mid] < value) lo = mid + 1
    else hi = mid
  }
  tails[lo] = value
}
console.log(tails.length)
