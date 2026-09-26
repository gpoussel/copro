// 🎮 CodinGame Puzzle - a-million-digits-of-pi
// https://www.codingame.com/training/expert/a-million-digits-of-pi

// Chudnovsky series with binary splitting on BigInt (V8 has sub-quadratic
// multiplication/division). sqrt(10005) comes from a division-free Newton
// iteration on 1/sqrt in binary fixed point, and the requested decimal
// digits are extracted with a single modulo instead of a full toString().
const startIndex = parseInt(readline())
const digitCount = parseInt(readline())
const decimals = startIndex + digitCount - 1 // digits after the "3"
const bits = Math.ceil((decimals + 10) * Math.log2(10)) + 64

const C3_24 = 10939058860032000n // 640320^3 / 24

// Returns [P, Q, T] for terms in [a, b); P is skipped when not needed
const split = (a: number, b: number, needP: boolean): [bigint, bigint, bigint] => {
  if (b - a === 1) {
    if (a === 0) return [1n, 1n, 13591409n]
    const k = BigInt(a)
    const p = (6n * k - 5n) * (2n * k - 1n) * (6n * k - 1n)
    const q = k * k * k * C3_24
    const t = p * (13591409n + 545140134n * k)
    return [p, q, a & 1 ? -t : t]
  }
  const m = (a + b) >> 1
  const [p1, q1, t1] = split(a, m, true)
  const [p2, q2, t2] = split(m, b, needP)
  return [needP ? p1 * p2 : 0n, q1 * q2, t1 * q2 + p1 * t2]
}

// y ~ 2^prec / sqrt(a), refined by Newton y += y * (1 - a*y^2) / 2 with doubling precision
const invSqrt = (a: bigint, prec: number): bigint => {
  if (prec <= 40) return BigInt(Math.floor(2 ** prec / Math.sqrt(Number(a))))
  const half = (prec >> 1) + 20
  const y = invSqrt(a, half) << BigInt(prec - half)
  const p2 = BigInt(2 * prec)
  const err = (1n << p2) - a * y * y
  return y + ((y * err) >> (p2 + 1n))
}

const terms = Math.ceil((decimals + 20) / 14.18) + 2
const [, Q, T] = split(0, terms, false)
const invRoot = invSqrt(10005n, bits) // 2^bits / sqrt(10005)
const piFixed = (426880n * 10005n * invRoot * Q) / T // pi * 2^bits
const shifted = (piFixed * 10n ** BigInt(decimals)) >> BigInt(bits) // floor(pi * 10^decimals)
const tail = (shifted % 10n ** BigInt(digitCount)).toString().padStart(digitCount, "0")
console.log(tail)
