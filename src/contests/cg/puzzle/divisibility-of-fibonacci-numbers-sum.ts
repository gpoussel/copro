// 🎮 CodinGame Puzzle - divisibility-of-fibonacci-numbers-sum
// https://www.codingame.com/training/hard/divisibility-of-fibonacci-numbers-sum

// F_a + ... + F_b = F_(b+2) - F_(a+1), and both terms are computed modulo d
// with the fast-doubling formulas (BigInt, since products reach 1e18):
//   F(2k) = F(k) * (2F(k+1) - F(k)),  F(2k+1) = F(k)^2 + F(k+1)^2
function fib(n: bigint, m: bigint): [bigint, bigint] {
  if (n === 0n) return [0n, 1n % m]
  const [f, g] = fib(n >> 1n, m)
  const c = (f * ((2n * g - f + m) % m)) % m
  const e = (f * f + g * g) % m
  return n & 1n ? [e, (c + e) % m] : [c, e]
}

const nb = Number(readline())
for (let i = 0; i < nb; i++) {
  const [a, b, d] = readline().split(" ")
  const m = BigInt(d)
  const sum = (fib(BigInt(b) + 2n, m)[0] - fib(BigInt(a) + 1n, m)[0] + m) % m
  console.log(`F_${a} + ... + F_${b} is ${sum === 0n ? "" : "NOT "}divisible by ${d}`)
}
