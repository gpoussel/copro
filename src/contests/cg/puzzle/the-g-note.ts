// 🎮 CodinGame Puzzle - the-g-note
// https://www.codingame.com/training/medium/the-g-note

// S_N = sum_{k=0}^{L} k^N mod 2^53 with L = N^N.
// k^N mod 2^53 is periodic in k with period P = 2^53, so writing L + 1 = q*P + r:
//   S_N = q * (sum over one full period) + (sum over k < r)
// Both sums are power sums T_j(n) = sum_{k<n} k^j, computed for all j <= N by binary lifting:
//   T_j(2n)  = T_j(n) + sum_i C(j,i) n^(j-i) T_i(n)
//   T_j(n+1) = T_j(n) + n^j

const MOD = 9007199254740992 // 2^53
const LOW = 67108864 // 2^26

function addMod(x: number, y: number): number {
  const t = x - (MOD - y)
  return t >= 0 ? t : x + y
}

// Exact (a * b) mod 2^53 with doubles: split into 26/27-bit halves and use int32 bit ops
// (ToInt32 of an exact integer double is its value mod 2^32, so masking stays exact).
function mulMod(a: number, b: number): number {
  const a0 = a & 0x3ffffff
  const a1 = (a - a0) / LOW
  const b0 = b & 0x3ffffff
  const b1 = (b - b0) / LOW
  const low = a0 * b0 // < 2^52, exact
  const lowLo = low & 0x3ffffff
  const lowHi = (low - lowLo) / LOW
  // coefficient of 2^26, mod 2^27 (a1*b1*2^52 only contributes its parity)
  const mid = (lowHi + ((a1 * b0) | 0) + ((a0 * b1) | 0) + ((a1 & b1 & 1) << 26)) & 0x7ffffff
  return mid * LOW + lowLo
}

const N = parseInt(readline())

// Binomial coefficients mod 2^53
const binom: number[][] = []
for (let j = 0; j <= N; j++) {
  const row: number[] = new Array(j + 1)
  row[0] = row[j] = 1
  for (let i = 1; i < j; i++) row[i] = addMod(binom[j - 1][i - 1], binom[j - 1][i])
  binom.push(row)
}

function powers(n: number): number[] {
  const p: number[] = [1]
  for (let e = 1; e <= N; e++) p.push(mulMod(p[e - 1], n))
  return p
}

// state: T[j] = sum_{k<n} k^j; n kept as n mod 2^53
function double(T: number[], n: number): number[] {
  const pw = powers(n)
  const res: number[] = new Array(N + 1)
  for (let j = 0; j <= N; j++) {
    let acc = T[j]
    const row = binom[j]
    for (let i = 0; i <= j; i++) {
      if (T[i] === 0) continue
      acc = addMod(acc, mulMod(mulMod(row[i], pw[j - i]), T[i]))
    }
    res[j] = acc
  }
  return res
}

function increment(T: number[], n: number): number[] {
  const pw = powers(n) // powers(0) = [1, 0, 0, ...], i.e. 0^0 = 1
  return T.map((v, j) => addMod(v, pw[j]))
}

// Power sums for n given as a little-endian bit array
function powerSums(bits: number[]): number[] {
  let T: number[] = new Array(N + 1).fill(0)
  let n = 0
  for (let b = bits.length - 1; b >= 0; b--) {
    T = double(T, n)
    n = addMod(n, n)
    if (bits[b]) {
      T = increment(T, n)
      n = addMod(n, 1)
    }
  }
  return T
}

// L + 1 = N^N + 1 modulo 2^106, as 16-bit limbs (little-endian)
const LIMBS = 7
let big: number[] = new Array(LIMBS).fill(0)
big[0] = 1
for (let e = 0; e < N; e++) {
  let carry = 0
  for (let i = 0; i < LIMBS; i++) {
    const v = big[i] * N + carry
    big[i] = v % 65536
    carry = Math.floor(v / 65536)
  }
}
// + 1
for (let i = 0, carry = 1; i < LIMBS && carry; i++) {
  const v = big[i] + carry
  big[i] = v % 65536
  carry = v >= 65536 ? 1 : 0
}
const allBits: number[] = []
for (let i = 0; i < LIMBS * 16; i++) allBits.push((big[i >> 4] >> (i & 15)) & 1)
const rBits = allBits.slice(0, 53)
const qBits = allBits.slice(53, 106)

let q = 0
for (let b = qBits.length - 1; b >= 0; b--) q = addMod(addMod(q, q), qBits[b])

let answer = powerSums(rBits)[N]
if (q !== 0) {
  const periodBits: number[] = new Array(54).fill(0)
  periodBits[53] = 1 // n = 2^53
  const fullPeriod = powerSums(periodBits)[N]
  answer = addMod(answer, mulMod(q, fullPeriod))
}
console.log(String(answer))
