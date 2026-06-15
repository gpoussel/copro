// 🎮 CodinGame Puzzle - probability-for-dummies
// https://www.codingame.com/

const m: number = parseInt(readline(), 10)
const n: number = parseInt(readline(), 10)

const N = 38n

function binom(a: bigint, b: bigint): bigint {
  if (b < 0n || b > a) return 0n
  let r = 1n
  for (let i = 0n; i < b; i++) {
    r = (r * (a - i)) / (i + 1n)
  }
  return r
}

function pow(base: bigint, exp: number): bigint {
  let r = 1n
  for (let i = 0; i < exp; i++) r *= base
  return r
}

// Surjections: number of functions from n elements onto exactly k cells
function surj(nn: number, k: bigint): bigint {
  let s = 0n
  for (let j = 0n; j <= k; j++) {
    const term = binom(k, j) * pow(k - j, nn)
    if (j % 2n === 0n) s += term
    else s -= term
  }
  return s
}

const total = pow(N, n)
let favorable = 0n
const top = BigInt(Math.min(n, 38))
for (let k = BigInt(m); k <= top; k++) {
  favorable += binom(N, k) * surj(n, k)
}

// favorable / total as probability, rounded to nearest percent
const num = favorable * 100n
const q = num / total
const rem = num % total
let percent = Number(q)
if (rem * 2n >= total) percent += 1
console.log(`${percent}%`)
