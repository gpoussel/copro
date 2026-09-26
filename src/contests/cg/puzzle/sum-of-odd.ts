// 🎮 CodinGame Puzzle - sum-of-odd
// https://www.codingame.com/training/hard/sum-of-odd

// k consecutive odd numbers starting at a sum to k * (a + k - 1) = k * m.
// So each solution is a factorization n = k * m with 2 ≤ k ≤ m and k ≡ m (mod 2);
// the sequence then goes from m - k + 1 to m + k - 1. The longest one has the largest k.

const n = parseInt(readline())
let count = 0
let best = 0
for (let k = 2; k * k <= n; k++) {
  if (n % k !== 0) continue
  const m = n / k
  if ((m - k) % 2 !== 0) continue
  count++
  best = k
}
console.log(count)
if (count > 0) {
  const m = n / best
  console.log(`${m - best + 1} ${m + best - 1}`)
}
