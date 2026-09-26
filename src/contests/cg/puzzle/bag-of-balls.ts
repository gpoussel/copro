// 🎮 CodinGame Puzzle - bag-of-balls
// https://www.codingame.com/training/medium/bag-of-balls

// P(A) = C(W,k)·C(N-W,s-k) / C(N,s), so the odds are A : (T - A) with T = C(N,s).
// Values exceed 2^53, so they are handled as prime exponents, then as small big numbers.
const N = Number(readline())
const W = Number(readline())
const s = Number(readline())
const k = Number(readline())

const PRIMES: number[] = []
for (let p = 2; p <= 60; p++) if (PRIMES.every(q => p % q !== 0)) PRIMES.push(p)

const factorialExp = (n: number, p: number) => {
  let e = 0
  for (let q = p; q <= n; q *= p) e += Math.floor(n / q)
  return e
}
const binomialExps = (n: number, r: number) => PRIMES.map(p => factorialExp(n, p) - factorialExp(r, p) - factorialExp(n - r, p))

// Big numbers: little-endian arrays of base-10^6 limbs
const BASE = 1000000
type Big = number[]

function mulSmall(a: Big, m: number): Big {
  const res: Big = []
  let carry = 0
  for (const limb of a) {
    const v = limb * m + carry
    res.push(v % BASE)
    carry = Math.floor(v / BASE)
  }
  while (carry > 0) {
    res.push(carry % BASE)
    carry = Math.floor(carry / BASE)
  }
  return res
}

function sub(a: Big, b: Big): Big {
  const res: Big = []
  let borrow = 0
  for (let i = 0; i < a.length; i++) {
    let v = a[i] - (b[i] || 0) - borrow
    borrow = v < 0 ? 1 : 0
    if (v < 0) v += BASE
    res.push(v)
  }
  while (res.length > 1 && res[res.length - 1] === 0) res.pop()
  return res
}

function toStr(a: Big): string {
  let str = String(a[a.length - 1])
  for (let i = a.length - 2; i >= 0; i--) str += String(a[i] + BASE).slice(1)
  return str
}

function fromExps(exps: number[]): Big {
  let res: Big = [1]
  exps.forEach((e, i) => {
    for (let j = 0; j < e; j++) res = mulSmall(res, PRIMES[i])
  })
  return res
}

if (s - k > N - W) {
  console.log("0:1")
} else {
  const favourable = binomialExps(W, k).map((e, i) => e + binomialExps(N - W, s - k)[i])
  const total = binomialExps(N, s)
  const common = favourable.map((e, i) => Math.min(e, total[i]))
  const a = fromExps(favourable.map((e, i) => e - common[i]))
  const t = fromExps(total.map((e, i) => e - common[i]))
  console.log(`${toStr(a)}:${toStr(sub(t, a))}`)
}
