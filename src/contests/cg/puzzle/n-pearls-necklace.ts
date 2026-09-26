// 🎮 CodinGame Puzzle - n-pearls-necklace
// https://www.codingame.com/training/hard/n-pearls-necklace

// Burnside over the dihedral group counts bracelets using at most k colors;
// inclusion-exclusion then keeps those using all C colors. BigInt throughout.
const n = Number(readline())
const c = Number(readline())

const phi = (m: number) => {
  let r = m
  for (let p = 2, x = m; x > 1; p++) {
    if (x % p) continue
    r = (r / p) * (p - 1)
    while (x % p === 0) x /= p
  }
  return r
}

const atMost = (k: number) => {
  const K = BigInt(k)
  let sum = 0n
  for (let d = 1; d <= n; d++) if (n % d === 0) sum += BigInt(phi(d)) * K ** BigInt(n / d)
  if (n % 2) sum += BigInt(n) * K ** BigInt((n + 1) / 2)
  else sum += BigInt(n / 2) * (K ** BigInt(n / 2 + 1) + K ** BigInt(n / 2))
  return sum / BigInt(2 * n)
}

const binom = (a: number, b: number) => {
  let r = 1n
  for (let i = 0; i < b; i++) r = (r * BigInt(a - i)) / BigInt(i + 1)
  return r
}

let total = 0n
for (let j = 1; j <= c; j++) total += ((c - j) % 2 ? -1n : 1n) * binom(c, j) * atMost(j)
console.log(total.toString())
