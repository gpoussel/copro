// 🎮 CodinGame Puzzle - magical-frog
// https://www.codingame.com/training/hard/magical-frog

// ways(n) = ways(n-1) + ... + ways(n-K), ways(0) = 1: a K-step linear
// recurrence, raised to the N-th step with K×K matrix fast exponentiation.
const MOD = 1_000_000_007
const [N, K] = readline().split(" ").map(Number)

// (a * b) % MOD without exceeding 2^53
const mulmod = (a: number, b: number): number => (((a * (b >>> 16)) % MOD) * 65536 + a * (b & 65535)) % MOD

type Matrix = number[][]
function mul(a: Matrix, b: Matrix): Matrix {
  const res: Matrix = a.map(() => new Array<number>(K).fill(0))
  for (let i = 0; i < K; i++)
    for (let k = 0; k < K; k++) {
      if (a[i][k] === 0) continue
      for (let j = 0; j < K; j++) res[i][j] = (res[i][j] + mulmod(a[i][k], b[k][j])) % MOD
    }
  return res
}

// state vector (ways(n), ways(n-1), ..., ways(n-K+1))
let base: Matrix = []
for (let i = 0; i < K; i++) {
  const row = new Array<number>(K).fill(0)
  if (i === 0) row.fill(1)
  else row[i - 1] = 1
  base.push(row)
}
let result: Matrix = base.map((_, i) => base.map((__, j) => (i === j ? 1 : 0)))
let e = N
while (e > 0) {
  if (e & 1) result = mul(result, base)
  base = mul(base, base)
  e = Math.floor(e / 2)
}
// initial vector is (1, 0, ..., 0), so ways(N) = result[0][0]
console.log(result[0][0])
