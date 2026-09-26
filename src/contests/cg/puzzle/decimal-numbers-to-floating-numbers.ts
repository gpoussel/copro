// 🎮 CodinGame Puzzle - decimal-numbers-to-floating-numbers
// https://www.codingame.com/training/medium/decimal-numbers-to-floating-numbers

// Minimal non-negative big integers: little-endian limbs in base 1e7
type Big = number[]
const LIMB = 1e7

function bigFromDigits(digits: string): Big {
  const out: Big = []
  for (let end = digits.length; end > 0; end -= 7) out.push(parseInt(digits.substring(Math.max(0, end - 7), end), 10))
  return bigTrim(out)
}
function bigTrim(a: Big): Big {
  while (a.length > 1 && a[a.length - 1] === 0) a.pop()
  if (a.length === 0) a.push(0)
  return a
}
function bigMulSmall(a: Big, k: number): Big {
  const out: Big = []
  let carry = 0
  for (const limb of a) {
    const v = limb * k + carry
    out.push(v % LIMB)
    carry = Math.floor(v / LIMB)
  }
  while (carry > 0) {
    out.push(carry % LIMB)
    carry = Math.floor(carry / LIMB)
  }
  return bigTrim(out)
}
function bigCmp(a: Big, b: Big): number {
  if (a.length !== b.length) return a.length - b.length
  for (let i = a.length - 1; i >= 0; i--) if (a[i] !== b[i]) return a[i] - b[i]
  return 0
}
function bigSub(a: Big, b: Big): Big {
  const out: Big = []
  let borrow = 0
  for (let i = 0; i < a.length; i++) {
    let v = a[i] - borrow - (b[i] || 0)
    borrow = v < 0 ? 1 : 0
    if (v < 0) v += LIMB
    out.push(v)
  }
  return bigTrim(out)
}
const bigIsZero = (a: Big) => a.length === 1 && a[0] === 0

const pad = (s: string, len: number) => {
  let out = s
  while (out.length < len) out = "0" + out
  return out
}

const input = readline().trim()
const match = /^([+-]?)(\d+\.?\d*|\.\d+)(?:[eE]([+-]?\d+))?$/.exec(input)

if (match === null) {
  console.log("[0][11111111][11111111111111111111111]")
  console.log("NaN")
} else {
  const negative = match[1] === "-"
  const mantissaText = match[2]
  const dot = mantissaText.indexOf(".")
  const intDigits = dot < 0 ? mantissaText : mantissaText.substring(0, dot)
  const fracDigits = dot < 0 ? "" : mantissaText.substring(dot + 1)
  // value = digits * 10^power10
  const power10 = (match[3] ? parseInt(match[3], 10) : 0) - fracDigits.length
  let num = bigFromDigits((intDigits + fracDigits).replace(/^0+/, "") || "0")
  let den: Big = [1]
  for (let i = 0; i < Math.abs(power10); i++) {
    if (power10 > 0) num = bigMulSmall(num, 10)
    else den = bigMulSmall(den, 10)
  }

  let bits: string
  if (bigIsZero(num)) {
    bits = pad("", 32)
  } else {
    // Normalize so that den <= num < 2 * den, tracking the binary exponent
    let exp = 0
    while (bigCmp(num, bigMulSmall(den, 2)) >= 0) {
      den = bigMulSmall(den, 2)
      exp++
    }
    while (bigCmp(num, den) < 0) {
      num = bigMulSmall(num, 2)
      exp--
    }
    // Leading 1 then 23 mantissa bits, plus the 24th bit for rounding
    let rem = bigSub(num, den)
    let significand = 1
    let roundBit = 0
    for (let i = 0; i < 24; i++) {
      rem = bigMulSmall(rem, 2)
      let bit = 0
      if (bigCmp(rem, den) >= 0) {
        bit = 1
        rem = bigSub(rem, den)
      }
      if (i < 23) significand = significand * 2 + bit
      else roundBit = bit
    }
    if (roundBit === 1) significand++
    if (significand >= 1 << 24) {
      significand /= 2
      exp++
    }
    const mantissaBits = pad((significand - (1 << 23)).toString(2), 23)
    bits = (negative ? "1" : "0") + pad((127 + exp).toString(2), 8) + mantissaBits
  }

  console.log(`[${bits[0]}][${bits.substring(1, 9)}][${bits.substring(9)}]`)
  console.log("0x" + pad(parseInt(bits, 2).toString(16).toUpperCase(), 8))
}
