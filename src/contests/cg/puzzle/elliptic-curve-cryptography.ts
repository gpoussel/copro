// 🎮 CodinGame Puzzle - elliptic-curve-cryptography
// https://www.codingame.com/training/medium/elliptic-curve-cryptography

const ZERO = BigInt(0)
const ONE = BigInt(1)
const TWO = BigInt(2)
const THREE = BigInt(3)
const P = BigInt("0x3fddbf07bb3bc551")
const G: Point = [BigInt("0x69d463ce83b758e"), BigInt("0x287a120903f7ef5c")]

type Point = [bigint, bigint] | null // null is the point at infinity

const mod = (a: bigint): bigint => ((a % P) + P) % P

function power(base: bigint, exponent: bigint): bigint {
  let result = ONE
  base = mod(base)
  while (exponent > ZERO) {
    if (exponent & ONE) result = (result * base) % P
    base = (base * base) % P
    exponent >>= ONE
  }
  return result
}

// P is prime: Fermat's little theorem gives the inverse
const inverse = (a: bigint): bigint => power(a, P - TWO)

function add(c: Point, d: Point): Point {
  if (c === null) return d
  if (d === null) return c
  const [xc, yc] = c
  const [xd, yd] = d
  let slope: bigint
  if (xc === xd) {
    if (mod(yc + yd) === ZERO) return null
    slope = mod(THREE * xc * xc * inverse(TWO * yc))
  } else {
    slope = mod((yd - yc) * inverse(xd - xc))
  }
  const xs = mod(slope * slope - xc - xd)
  const ys = mod(slope * (xc - xs) - yc)
  return [xs, ys]
}

// Double-and-add
function multiply(k: bigint, point: Point): Point {
  let result: Point = null
  let addend = point
  while (k > ZERO) {
    if (k & ONE) result = add(result, addend)
    addend = add(addend, addend)
    k >>= ONE
  }
  return result
}

const n = parseInt(readline())
for (let i = 0; i < n; i++) {
  const result = multiply(BigInt(readline().trim()), G)
  console.log(result === null ? "0x0" : "0x" + result[0].toString(16))
}
