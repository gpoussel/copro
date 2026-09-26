// 🎮 CodinGame Puzzle - ways-to-make-change
// https://www.codingame.com/training/medium/ways-to-make-change

// Counts can exceed 2^53: big numbers as little-endian arrays of base-1e7 limbs
const LIMB = 1e7
type Big = number[]

function addBig(a: Big, b: Big): Big {
  const out: Big = []
  let carry = 0
  for (let i = 0; i < Math.max(a.length, b.length) || carry; i++) {
    const sum = (a[i] || 0) + (b[i] || 0) + carry
    out.push(sum % LIMB)
    carry = Math.floor(sum / LIMB)
  }
  return out
}

function bigToString(a: Big): string {
  let s = String(a[a.length - 1] || 0)
  for (let i = a.length - 2; i >= 0; i--) s += String(a[i] + LIMB).substr(1)
  return s
}

const amount = parseInt(readline())
readline()
const coins = readline().trim().split(/\s+/).map(Number)

const ways: Big[] = []
for (let i = 0; i <= amount; i++) ways.push(i === 0 ? [1] : [])
for (const coin of coins) {
  for (let total = coin; total <= amount; total++) ways[total] = addBig(ways[total], ways[total - coin])
}
console.log(bigToString(ways[amount]))
