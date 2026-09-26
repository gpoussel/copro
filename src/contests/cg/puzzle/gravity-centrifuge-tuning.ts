// 🎮 CodinGame Puzzle - gravity-centrifuge-tuning
// https://www.codingame.com/training/medium/gravity-centrifuge-tuning
// Bit k tumbles the landscape Fib(k+2) times (1, 2, 3, 5, 8...), so the answer is the
// Zeckendorf representation of N (no two consecutive set bits), printed in octal.

// Minimal arbitrary-precision unsigned integers: little-endian limbs in base 1e7
const LIMB = 1e7
type Big = number[]

const parseBig = (s: string): Big => {
  const limbs: Big = []
  for (let end = s.length; end > 0; end -= 7) limbs.push(Number(s.substring(Math.max(0, end - 7), end)))
  return trim(limbs)
}
const trim = (a: Big): Big => {
  while (a.length > 1 && a[a.length - 1] === 0) a.pop()
  return a
}
const addBig = (a: Big, b: Big): Big => {
  const out: Big = []
  let carry = 0
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const v = (a[i] || 0) + (b[i] || 0) + carry
    out.push(v % LIMB)
    carry = v >= LIMB ? 1 : 0
  }
  if (carry) out.push(carry)
  return out
}
const subBig = (a: Big, b: Big): Big => {
  const out: Big = []
  let borrow = 0
  for (let i = 0; i < a.length; i++) {
    let v = a[i] - (b[i] || 0) - borrow
    borrow = v < 0 ? 1 : 0
    if (v < 0) v += LIMB
    out.push(v)
  }
  return trim(out)
}
const compareBig = (a: Big, b: Big): number => {
  if (a.length !== b.length) return a.length - b.length
  for (let i = a.length - 1; i >= 0; i--) if (a[i] !== b[i]) return a[i] - b[i]
  return 0
}

let remaining = parseBig(readline().trim())
const fibs: Big[] = [[1], [2]]
while (compareBig(fibs[fibs.length - 1], remaining) <= 0) fibs.push(addBig(fibs[fibs.length - 1], fibs[fibs.length - 2]))

// Greedy Zeckendorf decomposition, largest Fibonacci first
const bits: number[] = fibs.map(() => 0)
for (let k = fibs.length - 1; k >= 0; k--) {
  if (compareBig(fibs[k], remaining) <= 0) {
    bits[k] = 1
    remaining = subBig(remaining, fibs[k])
  }
}

let octal = ""
for (let k = 0; k < bits.length; k += 3) octal = String(bits[k] + 2 * (bits[k + 1] || 0) + 4 * (bits[k + 2] || 0)) + octal
octal = octal.replace(/^0+/, "")
console.log(octal === "" ? "0" : octal)
