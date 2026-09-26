// 🎮 CodinGame Puzzle - numbers-with-only-two-distinct-digits
// https://www.codingame.com/training/medium/numbers-with-only-two-distinct-digits

// Minimal non-negative big integers: little-endian limbs in base 1e7
const BASE = 1e7
type Big = number[]
const addBig = (x: Big, y: Big): Big => {
  const out: Big = []
  let carry = 0
  for (let i = 0; i < Math.max(x.length, y.length) || carry; i++) {
    const s = (x[i] || 0) + (y[i] || 0) + carry
    out.push(s % BASE)
    carry = Math.floor(s / BASE)
  }
  return out
}
const mulSmall = (x: Big, m: number): Big => {
  const out: Big = []
  let carry = 0
  for (let i = 0; i < x.length || carry; i++) {
    const p = (x[i] || 0) * m + carry
    out.push(p % BASE)
    carry = Math.floor(p / BASE)
  }
  return out
}
const halve = (x: Big): Big => {
  const out: Big = new Array(x.length).fill(0)
  let rem = 0
  for (let i = x.length - 1; i >= 0; i--) {
    const cur = rem * BASE + x[i]
    out[i] = Math.floor(cur / 2)
    rem = cur % 2
  }
  return out
}

const n = +readline()
const [a, b] = readline().trim().split(/\s+/).map(Number)
const even = a % 2 === 0 ? a : b
const odd = a % 2 === 0 ? b : a

// Invariant: x (k digits) is divisible by 2^k, q = x / 2^k and pow5 = 5^k.
// Prepending d gives (d * 5^k + q) * 2^k, divisible by 2^(k+1) iff d ≡ q (mod 2).
let q: Big = [0]
let pow5: Big = [1]
let digits = ""
for (let k = 0; k < n; k++) {
  const d = q[0] % 2 === 0 ? even : odd
  digits = d + digits
  q = halve(addBig(mulSmall(pow5, d), q))
  pow5 = mulSmall(pow5, 5)
}
console.log(digits)
