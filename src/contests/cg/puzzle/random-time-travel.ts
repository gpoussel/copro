// 🎮 CodinGame Puzzle - random-time-travel
// https://www.codingame.com/training/medium/random-time-travel

const [a, c, m] = readline().split(" ").map(s => BigInt(s))
const seed = BigInt(readline())
let steps = BigInt(readline())

const mod = (x: bigint): bigint => ((x % m) + m) % m

// An affine map x -> A*x + C (mod m)
type Lcg = [bigint, bigint]
const compose = ([a1, c1]: Lcg, [a2, c2]: Lcg): Lcg => [mod(a1 * a2), mod(a1 * c2 + c1)]

// Inverse of an odd number modulo a power of two (Newton iteration)
const inverse = (x: bigint): bigint => {
  let y = 1n
  for (let i = 0; i < 7; i++) y = mod(y * (2n - x * y))
  return y
}

let base: Lcg = [mod(a), mod(c)]
if (steps < 0n) {
  const ia = inverse(base[0])
  base = [ia, mod(-ia * base[1])]
  steps = -steps
}

let result: Lcg = [mod(1n), 0n]
while (steps > 0n) {
  if (steps & 1n) result = compose(base, result)
  base = compose(base, base)
  steps >>= 1n
}
console.log(mod(result[0] * seed + result[1]).toString())
