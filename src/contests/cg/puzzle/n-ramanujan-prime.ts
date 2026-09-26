// 🎮 CodinGame Puzzle - n-ramanujan-prime
// https://www.codingame.com/training/hard/n-ramanujan-prime

// Sieve up to the known upper bound 4n·ln(4n) with a running prime count π.
// Scanning x downwards from that bound, the first x with π(x) - π(x/2) < n
// is the last failure, so Rₙ = x + 1.
const n = parseInt(readline())
const limit = Math.max(20, Math.ceil(4 * n * Math.log(4 * n)))

const composite = new Uint8Array(limit + 1)
const pi = new Int32Array(limit + 1)
for (let i = 2; i * i <= limit; i++) {
  if (!composite[i]) for (let j = i * i; j <= limit; j += i) composite[j] = 1
}
for (let i = 2; i <= limit; i++) pi[i] = pi[i - 1] + (composite[i] ? 0 : 1)

let x = limit
while (x > 0 && pi[x] - pi[x >> 1] >= n) x--
console.log(x + 1)
