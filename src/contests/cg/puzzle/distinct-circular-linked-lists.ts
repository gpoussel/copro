// 🎮 CodinGame Puzzle - distinct-circular-linked-lists
// https://www.codingame.com/training/medium/distinct-circular-linked-lists

// Necklaces with fixed multiplicities, counted with Burnside's lemma:
//   (1/N) * sum over d | gcd(counts) of phi(d) * (N/d)! / prod((c_i/d)!)
const MOD = 1_000_000_007

const mulMod = (a: number, b: number): number => ((((a * (b >>> 16)) % MOD) * 65536) + a * (b & 65535)) % MOD
const powMod = (base: number, exp: number): number => {
  let result = 1
  for (let b = base % MOD, e = exp; e > 0; e = Math.floor(e / 2)) {
    if (e & 1) result = mulMod(result, b)
    b = mulMod(b, b)
  }
  return result
}
const inv = (a: number): number => powMod(a, MOD - 2)

const n = parseInt(readline())
const counts = new Map<string, number>()
for (let i = 0; i < n; i++) {
  const v = readline().trim()
  counts.set(v, (counts.get(v) || 0) + 1)
}
const multiplicities: number[] = []
counts.forEach(c => multiplicities.push(c))

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const g = multiplicities.reduce(gcd, 0)

const fact = [1]
for (let i = 1; i <= n; i++) fact.push(mulMod(fact[i - 1], i))

const phi = (m: number): number => {
  let result = m
  for (let p = 2; p * p <= m; p++) {
    if (m % p !== 0) continue
    while (m % p === 0) m /= p
    result -= result / p
  }
  if (m > 1) result -= result / m
  return result
}

let total = 0
for (let d = 1; d <= g; d++) {
  if (g % d !== 0) continue
  let arrangements = fact[n / d]
  for (const c of multiplicities) arrangements = mulMod(arrangements, inv(fact[c / d]))
  total = (total + mulMod(phi(d), arrangements)) % MOD
}

console.log(mulMod(total, inv(n)))
