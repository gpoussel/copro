// 🎮 CodinGame Puzzle - factorials-of-primes-decomposition
// https://www.codingame.com/training/hard/factorials-of-primes-decomposition

// Work on the prime exponent vector of N. The largest prime p present can only
// come from p!, so its exponent e gives the term p#e; divide by (p!)^e (i.e.
// subtract e * v_q(p!) for every prime q <= p, Legendre's formula) and repeat
// with the next largest prime.
const [num, den = "1"] = readline().trim().split("/")
const LIMIT = 2000
const isPrime = new Array<boolean>(LIMIT + 1).fill(true)
const primes: number[] = []
for (let i = 2; i <= LIMIT; i++) {
  if (!isPrime[i]) continue
  primes.push(i)
  for (let j = i * i; j <= LIMIT; j += i) isPrime[j] = false
}
const exp = new Map<number, number>()
function addFactors(n: number, sign: number): void {
  for (const p of primes) {
    while (n % p === 0) {
      exp.set(p, (exp.get(p) ?? 0) + sign)
      n /= p
    }
  }
}
addFactors(Number(num), 1)
addFactors(Number(den), -1)

// exponent of q in p!
const legendre = (p: number, q: number) => {
  let v = 0
  for (let k = q; k <= p; k *= q) v += Math.floor(p / k)
  return v
}
const terms: string[] = []
for (let i = primes.length - 1; i >= 0; i--) {
  const p = primes[i]
  const e = exp.get(p) ?? 0
  if (e === 0) continue
  terms.push(`${p}#${e}`)
  for (let j = 0; j <= i; j++) {
    const q = primes[j]
    exp.set(q, (exp.get(q) ?? 0) - e * legendre(p, q))
  }
}
console.log(terms.join(" "))
