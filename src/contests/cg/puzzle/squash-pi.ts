// 🎮 CodinGame Puzzle - squash-pi
// https://www.codingame.com/training/easy/squash-pi

const index: number = parseInt(readline(), 10)
const count: number = parseInt(readline(), 10)

// Number of pi digits we need: digit `index` is the (index)-th digit of
// "3141592653..." (no decimal point). We need digits [index, index+count).
// Use guard digits to absorb rounding error in the last places.
const need: number = index + count
const digits: number = need + 20

// Chudnovsky algorithm via binary splitting.
// pi = (426880 * sqrt(10005)) / S, where
// S = sum_{k>=0} (6k)! (13591409 + 545140134 k) / ((3k)! (k!)^3 (-262537412640768000)^k)
// Binary splitting computes P, Q, T such that S = T / Q (with appropriate scaling).

const BIG_1: bigint = 1n

function bsPQT(a: number, b: number): [bigint, bigint, bigint] {
  if (b - a === 1) {
    let pab: bigint
    let qab: bigint
    if (a === 0) {
      pab = BIG_1
      qab = BIG_1
    } else {
      const k: bigint = BigInt(a)
      // P(a,b) = (6a-5)(2a-1)(6a-1)
      pab = (6n * k - 5n) * (2n * k - 1n) * (6n * k - 1n)
      // Q(a,b) = a^3 * 640320^3 / 24
      qab = k * k * k * 10939058860032000n
    }
    // T(a,b) = P(a,b) * (13591409 + 545140134 a), negated on odd a
    let tab: bigint = pab * (13591409n + 545140134n * BigInt(a))
    if (a % 2 === 1) tab = -tab
    return [pab, qab, tab]
  }
  const m: number = Math.floor((a + b) / 2)
  const [pam, qam, tam]: [bigint, bigint, bigint] = bsPQT(a, m)
  const [pmb, qmb, tmb]: [bigint, bigint, bigint] = bsPQT(m, b)
  const p: bigint = pam * pmb
  const q: bigint = qam * qmb
  const t: bigint = tam * qmb + pam * tmb
  return [p, q, t]
}

// Each Chudnovsky term adds about 14.18 digits of precision.
const terms: number = Math.floor(digits / 14) + 2

// Scale factor: 10^digits
function pow10(n: number): bigint {
  let r: bigint = BIG_1
  const ten: bigint = 10n
  let base: bigint = ten
  let e: number = n
  while (e > 0) {
    if (e & 1) r *= base
    base *= base
    e >>= 1
  }
  return r
}

// Integer square root of n.
function isqrt(n: bigint): bigint {
  if (n < 2n) return n
  let x: bigint = BIG_1 << (BigInt(n.toString(2).length + 1) >> BIG_1)
  while (true) {
    const y: bigint = (x + n / x) >> BIG_1
    if (y >= x) return x
    x = y
  }
}

const scale: bigint = pow10(digits)

const [, q, t]: [bigint, bigint, bigint] = bsPQT(0, terms)

// pi = (426880 * sqrt(10005) * Q) / T
// We compute with the scale factor so the result is floor(pi * 10^digits).
// sqrt(10005) * 10^digits = isqrt(10005 * 10^(2*digits))
const sqrtPart: bigint = isqrt(10005n * scale * scale)
const piScaled: bigint = (426880n * sqrtPart * q) / t

// piScaled = floor(pi * 10^digits). Its decimal string is "3" + decimals.
const piStr: string = piScaled.toString()
const result: string = piStr.slice(index, index + count)
console.log(result)
