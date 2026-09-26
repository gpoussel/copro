// 🎮 CodinGame Puzzle - fair-numbering
// https://www.codingame.com/training/medium/fair-numbering

// Total number of digits needed to write 1..n
function digitsUpTo(n: number): number {
  let total = 0
  let low = 1
  let width = 1
  while (low <= n) {
    const high = Math.min(n, low * 10 - 1)
    total += (high - low + 1) * width
    low *= 10
    width++
  }
  return total
}

const testCount = parseInt(readline())
for (let t = 0; t < testCount; t++) {
  const [st, ed] = readline().split(" ").map(Number)
  const before = digitsUpTo(st - 1)
  const all = digitsUpTo(ed)
  // Largest m such that Alice's digits (st..m) <= Bob's digits (m+1..ed)
  let lo = st
  let hi = ed
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    const alice = digitsUpTo(mid) - before
    if (alice <= all - before - alice) lo = mid
    else hi = mid - 1
  }
  console.log(lo)
}
