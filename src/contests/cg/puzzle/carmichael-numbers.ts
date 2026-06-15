// 🎮 CodinGame Puzzle - carmichael-numbers
// https://www.codingame.com/training/medium/carmichael-numbers

const n: number = parseInt(readline(), 10)

// Korselt's criterion: n is a Carmichael number iff it is square-free,
// has at least 3 distinct prime factors, and (p-1) | (n-1) for every prime p | n.
function isCarmichael(n: number): boolean {
  if (n < 2) return false
  let m = n
  const primes: number[] = []
  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      let exp = 0
      while (m % p === 0) {
        m /= p
        exp++
      }
      if (exp > 1) return false // not square-free
      primes.push(p)
    }
  }
  if (m > 1) primes.push(m)
  if (primes.length < 3) return false // need >=3 distinct prime factors
  for (const p of primes) {
    if ((n - 1) % (p - 1) !== 0) return false
  }
  return true
}

console.log(isCarmichael(n) ? "YES" : "NO")
