// 🎮 CodinGame Puzzle - inversion-count
// https://www.codingame.com/training/medium/inversion-count

const [m, a, s, n] = readline().split(" ").map(Number)

// Fenwick tree over values (all < M): for each new value, count previous values greater than it
const tree = new Int32Array(m + 1)
let x = s
let inversions = 0
for (let i = 0; i < n; i++) {
  x = (a * x) % m // a * x < 1e14, exact in a double
  let smallerOrEqual = 0
  for (let k = x + 1; k > 0; k -= k & -k) smallerOrEqual += tree[k]
  inversions += i - smallerOrEqual
  for (let k = x + 1; k <= m; k += k & -k) tree[k]++
}
console.log(inversions)
