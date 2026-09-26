// 🎮 CodinGame Puzzle - prime-transformations
// https://www.codingame.com/training/expert/prime-transformations

// All primes are at most 100, so every number is factorised over the 25 small
// primes (BigInt, values reach 2^63). A prime p can only map to a prime q if,
// for every clue Ai -> Bi, the exponent of p in Ai equals the exponent of q in
// Bi. So each prime gets a signature (its exponent vector across the clues)
// and p maps to the target prime carrying the same signature on the B side.

const primes: number[] = []
for (let n = 2; n <= 100; n++) if (primes.every(p => n % p !== 0)) primes.push(n)

const factor = (v: bigint): number[] => {
  const exps: number[] = []
  for (const p of primes) {
    const bp = BigInt(p)
    let e = 0
    while (v % bp === 0n) {
      v /= bp
      e++
    }
    exps.push(e)
  }
  return exps
}

const source = BigInt(readline().trim())
const clueCount = Number(readline())
const fromSig: string[][] = primes.map(() => [])
const toSig: string[][] = primes.map(() => [])
for (let i = 0; i < clueCount; i++) {
  const [a, b] = readline().trim().split(/\s+/).map(BigInt)
  const fa = factor(a)
  const fb = factor(b)
  for (let k = 0; k < primes.length; k++) {
    fromSig[k].push(String(fa[k]))
    toSig[k].push(String(fb[k]))
  }
}

// Available targets grouped by signature
const targets = new Map<string, number[]>()
for (let k = 0; k < primes.length; k++) {
  const key = toSig[k].join(",")
  const list = targets.get(key) ?? []
  list.push(primes[k])
  targets.set(key, list)
}

const fx = factor(source)
let result = 1n
for (let k = 0; k < primes.length; k++) {
  if (fx[k] === 0) continue
  const list = targets.get(fromSig[k].join(",")) ?? [primes[k]]
  const q = list.includes(primes[k]) && list.length > 1 ? primes[k] : list[0]
  result *= BigInt(q) ** BigInt(fx[k])
}
console.log(result.toString())
