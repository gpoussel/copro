// 🎮 CodinGame Puzzle - prime-fractals-in-pascals-triangle
// https://www.codingame.com/training/expert/prime-fractals-in-pascals-triangle

// Lucas' theorem: C(n, k) is not divisible by P iff every base-P digit of k is
// <= the matching digit of n (which also implies k <= n). So we count pairs
// n <= R-1, k <= C-1 with digit-wise domination, using a digit DP over the
// base-P expansions with two "still tight" flags.

const MOD = 1000000007

const toDigits = (v: bigint, p: bigint, len: number): number[] => {
  const d: number[] = new Array(len).fill(0)
  for (let i = len - 1; i >= 0; i--) {
    d[i] = Number(v % p)
    v /= p
  }
  return d
}

const countShaded = (p: number, rows: bigint, cols: bigint): number => {
  const bp = BigInt(p)
  const maxN = rows - 1n
  const maxK = cols - 1n
  let len = 1
  for (let v = maxN > maxK ? maxN : maxK; v >= bp; v /= bp) len++
  const dn = toDigits(maxN, bp, len)
  const dk = toDigits(maxK, bp, len)
  // dp[tn * 2 + tk]: number of prefixes in this tightness state
  let dp = [0, 0, 0, 1]
  for (let i = 0; i < len; i++) {
    const next = [0, 0, 0, 0]
    for (let s = 0; s < 4; s++) {
      if (!dp[s]) continue
      const tn = s >> 1
      const tk = s & 1
      const hiN = tn ? dn[i] : p - 1
      for (let a = 0; a <= hiN; a++) {
        const ntn = tn && a === dn[i] ? 1 : 0
        const hiK = Math.min(a, tk ? dk[i] : p - 1)
        for (let b = 0; b <= hiK; b++) {
          const ns = ntn * 2 + (tk && b === dk[i] ? 1 : 0)
          next[ns] = (next[ns] + dp[s]) % MOD
        }
      }
    }
    dp = next
  }
  return (dp[0] + dp[1] + dp[2] + dp[3]) % MOD
}

const nTests = parseInt(readline())
const answers: number[] = []
for (let i = 0; i < nTests; i++) {
  const [p, r, c] = readline().trim().split(/\s+/)
  answers.push(countShaded(Number(p), BigInt(r), BigInt(c)))
}
console.log(answers.join("\n"))
