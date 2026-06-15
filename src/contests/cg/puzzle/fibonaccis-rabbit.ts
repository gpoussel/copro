// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

const [f0, n]: number[] = readline().split(" ").map(Number)
const [a, b]: number[] = readline().split(" ").map(Number)

const f: bigint[] = new Array(n + 1).fill(0n)
f[0] = BigInt(f0)

for (let i = 1; i <= n; i++) {
  let sum = 0n
  for (let k = a; k <= b; k++) {
    if (i - k >= 0) sum += f[i - k]
  }
  f[i] = sum
}

console.log(f[n].toString())
