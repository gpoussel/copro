// 🎮 CodinGame Puzzle - frog-date
// https://www.codingame.com/training/medium/frog-date

const [x, y, m, n, L] = readline().split(" ").map(v => BigInt(v))
const ZERO = BigInt(0)
const ONE = BigInt(1)

const mod = (a: bigint, b: bigint): bigint => ((a % b) + b) % b

// Returns [g, u, v] with a*u + b*v = g = gcd(a, b)
function extendedGcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
  if (b === ZERO) return [a, ONE, ZERO]
  const [g, u, v] = extendedGcd(b, a % b)
  return [g, v, u - (a / b) * v]
}

// Solve k * (m - n) = y - x (mod L) for the smallest k > 0
const a = mod(m - n, L)
const b = mod(y - x, L)
const [g, u] = extendedGcd(a, L)
if (b % g !== ZERO) console.log("Impossible")
else {
  const reducedL = L / g
  let k = mod((b / g) * mod(u, reducedL), reducedL)
  if (k === ZERO) k = reducedL
  console.log(k.toString())
}
