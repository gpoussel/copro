// 🎮 CodinGame Puzzle - the-voucher
// https://www.codingame.com/training/medium/the-voucher

const voucher = parseInt(readline())
const n = parseInt(readline())
const prices: number[] = []
for (let i = 0; i < n; i++) {
  const tokens = readline().trim().split(/\s+/)
  prices.push(parseInt(tokens[tokens.length - 1]))
}

// ways[s] = number of ways to spend exactly s cents with the products seen so far (0..3 of each)
let ways: number[] = new Array(voucher + 1).fill(0)
ways[0] = 1
for (const price of prices) {
  const next: number[] = new Array(voucher + 1).fill(0)
  for (let s = 0; s <= voucher; s++) {
    if (ways[s] === 0) continue
    for (let k = 0; k <= 3 && s + k * price <= voucher; k++) next[s + k * price] += ways[s]
  }
  ways = next
}
console.log(ways[voucher])
