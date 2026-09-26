// 🎮 CodinGame Puzzle - the-balanced-centrifuge-problem
// https://www.codingame.com/training/hard/the-balanced-centrifuge-problem

// Holroyd & Wakefield: K tubes can be balanced in N holes iff both K and
// N - K are sums of prime divisors of N. A coin-change reachability table
// over the prime divisors gives the answer.

const holes = parseInt(readline())

const primes: number[] = []
let rest = holes
for (let p = 2; p * p <= rest; p++) {
  if (rest % p) continue
  primes.push(p)
  while (rest % p === 0) rest /= p
}
if (rest > 1) primes.push(rest)

const reachable = new Uint8Array(holes + 1)
reachable[0] = 1
for (const p of primes) for (let v = p; v <= holes; v++) if (reachable[v - p]) reachable[v] = 1

let count = 0
for (let k = 1; k <= holes; k++) if (reachable[k] && reachable[holes - k]) count++
console.log(count)
