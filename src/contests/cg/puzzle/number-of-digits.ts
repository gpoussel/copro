// 🎮 CodinGame Puzzle - number-of-digits
// https://www.codingame.com/training/easy/number-of-digits

const n: number = parseInt(readline(), 10)
const k: number = parseInt(readline(), 10)
let count = 0
for (let p = 1; p <= n; p *= 10) {
  const high = Math.floor(n / (p * 10))
  const cur = Math.floor(n / p) % 10
  const low = n % p
  count += high * p
  if (cur > k) count += p
  else if (cur === k) count += low + 1
}
console.log(count)
