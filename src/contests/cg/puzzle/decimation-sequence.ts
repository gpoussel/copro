// 🎮 CodinGame Puzzle - decimation-sequence
// https://www.codingame.com/training/medium/decimation-sequence

const [n, k0] = readline().split(" ").map(Number)
const first = readline().split(" ").filter(s => s.length > 0).map(Number)

// Terms at positions multiple of n+1 form the sequence itself: u(m(n+1)) = u(m).
// The other terms, once decimated, also form it: u(q(n+1)+r) = u(qn+r) for 1 <= r <= n.
let k = k0
while (k > n) {
  const q = Math.floor(k / (n + 1))
  const r = k % (n + 1)
  k = r === 0 ? q : q * n + r
}
console.log(first[k - 1])
