// 🎮 CodinGame Puzzle - oneway-city
// https://www.codingame.com/training/medium/oneway-city
//
// Answer is C(M + N - 2, M - 1). It is computed exactly from its prime
// factorisation (Legendre's formula) with a little base-1e7 big integer.

const westEastRoads = parseInt(readline(), 10)
const northSouthRoads = parseInt(readline(), 10)
const totalMoves = westEastRoads + northSouthRoads - 2
const southMoves = westEastRoads - 1

const LIMB = 10000000

// Little-endian limbs
function multiplySmall(limbs: number[], factor: number): void {
  let carry = 0
  for (let i = 0; i < limbs.length; i++) {
    const product = limbs[i] * factor + carry
    limbs[i] = product % LIMB
    carry = Math.floor(product / LIMB)
  }
  while (carry > 0) {
    limbs.push(carry % LIMB)
    carry = Math.floor(carry / LIMB)
  }
}

function toDecimal(limbs: number[]): string {
  let out = String(limbs[limbs.length - 1])
  for (let i = limbs.length - 2; i >= 0; i--) {
    const chunk = String(limbs[i])
    out += "0000000".substr(chunk.length) + chunk
  }
  return out
}

function primeExponentInFactorial(n: number, p: number): number {
  let exponent = 0
  for (let q = p; q <= n; q *= p) exponent += Math.floor(n / q)
  return exponent
}

const isComposite = new Array<boolean>(totalMoves + 1).fill(false)
const routes = [1]
for (let p = 2; p <= totalMoves; p++) {
  if (isComposite[p]) continue
  for (let m = p * p; m <= totalMoves; m += p) isComposite[m] = true
  const exponent =
    primeExponentInFactorial(totalMoves, p) -
    primeExponentInFactorial(southMoves, p) -
    primeExponentInFactorial(totalMoves - southMoves, p)
  for (let e = 0; e < exponent; e++) multiplySmall(routes, p)
}

console.log(toDecimal(routes).substr(0, 1000))
