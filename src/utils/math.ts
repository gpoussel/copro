const LIMIT = 1100401
export const PRIMES = sieveOfEratosthene()

function isGreatestCommonDivisorDone(divisor: number, ns: number[]): boolean {
  for (const n of ns) {
    if (divisor > n) {
      return true
    }
  }

  return false
}

export function isPrime(n: number) {
  if (n <= 1) {
    return false
  }
  for (let factor = 2; factor * factor <= n; factor++) {
    if (n % factor === 0) {
      return false
    }
  }
  return true
}

export function sieveOfEratosthene(max: number = LIMIT): number[] {
  const bs = new Map<number, boolean>()
  const maxPrimeSqrt = Math.round(Math.sqrt(max))
  const primes = []

  for (let i = 2; i <= maxPrimeSqrt; i++) {
    if (!bs.get(i)) {
      primes.push(i)
      for (let j = 0; j < max; j += i) {
        bs.set(j, true)
      }
    }
  }
  for (let i = maxPrimeSqrt + (maxPrimeSqrt & 1 ? 2 : 1); i < max; i += 2) {
    if (!bs.get(i)) {
      primes.push(i)
    }
  }

  return primes
}

export function factorization(n: number): number[] {
  const factors = []
  for (const d of PRIMES) {
    if (d * d > n) {
      break
    }
    while (n % d === 0) {
      factors.push(d)
      n /= d
    }
  }
  if (n > 1) {
    factors.push(n)
  }
  return factors
}

export function lcm(...numbers: number[]): number {
  return numbers.reduce((i, s) => {
    return (s * i) / gcd(i, s)
  })
}

export function gcd(...numbers: number[]): number {
  let common = 1

  for (let i = 0; !isGreatestCommonDivisorDone(PRIMES[i], numbers); i++) {
    while (isDivisible(PRIMES[i], numbers)) {
      common *= PRIMES[i]
      for (let j = 0; j < numbers.length; j++) {
        numbers[j] /= PRIMES[i]
      }
    }
  }

  return common
}

function isDivisible(divisor: number, numbers: number[]): boolean {
  for (const n of numbers) {
    if (n % divisor !== 0) {
      return false
    }
  }

  return true
}
export function positiveModulo(n: number, m: number) {
  return ((n % m) + m) % m
}

export function countSetBits(n: number): number {
  if (n == 0) return 0
  return (n & 1) + countSetBits(n >> 1)
}

export function digits(n: number): number[] {
  return n.toString().split("").map(Number)
}

export function divisors(n: number) {
  const result = []
  let i = 1
  let max = n

  while (i < max) {
    if (n % i === 0) {
      result.push(i)

      let k = n / i
      if (i !== k) {
        result.push(k)
      }
      max = k
    }
    i++
  }
  return result
}

export function sumOfDivisors(num: number): number {
  let total = 1

  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) {
      let e = 0
      do {
        e++
        num /= i
      } while (num % i === 0)

      let sum = 0
      let pow = 1
      do {
        sum += pow
        pow *= i
      } while (e-- > 0)
      total *= sum
    }
  }
  if (num > 1) {
    total *= 1 + num
  }
  return total
}

export function sumOfDigits(n: number | bigint): number {
  return n
    .toString()
    .split("")
    .reduce((acc, d) => acc + +d, 0)
}

function forceBigint(n: number | bigint): bigint {
  return typeof n === "number" ? BigInt(n) : n
}

function toZn(a: number | bigint, n: number | bigint) {
  const number = forceBigint(a)
  const modulo = forceBigint(n)

  if (modulo <= 0n) {
    throw new RangeError("modulo must be positive")
  }

  const aZn = number % modulo
  return aZn < 0n ? aZn + modulo : aZn
}

function eGcd(aParam: number | bigint, bParam: number | bigint): { g: bigint; x: bigint; y: bigint } {
  let a = forceBigint(aParam)
  let b = forceBigint(bParam)

  if (a <= 0n || b <= 0n) {
    throw new RangeError("a and b MUST be positive")
  }

  let x = 0n
  let y = 1n
  let u = 1n
  let v = 0n

  while (a !== 0n) {
    const q = b / a
    const r = b % a
    const m = x - u * q
    const n = y - v * q
    b = a
    a = r
    x = u
    y = v
    u = m
    v = n
  }
  return {
    g: b,
    x,
    y,
  }
}

export function modInv(a: number | bigint, n: number | bigint) {
  const egcd = eGcd(toZn(a, n), n)
  if (egcd.g !== 1n) {
    throw new RangeError(`${a.toString()} does not have inverse modulo ${n.toString()}`) // modular inverse does not exist
  } else {
    return toZn(egcd.x, n)
  }
}

export function modAdd(addends: Array<number | bigint>, n: number | bigint): bigint {
  const modulo = forceBigint(n)
  const sum = addends.map(a => forceBigint(a) % modulo)
  return toZn(
    sum.reduce((acc, a) => acc + a, 0n),
    modulo
  )
}

export function modPow(b: number | bigint, e: number | bigint, n: number | bigint): bigint {
  let base = forceBigint(b)
  let exponent = forceBigint(e)
  const modulo = forceBigint(n)

  if (modulo === 1n) {
    return 0n
  }
  if (modulo <= 0n) {
    throw new RangeError("modulo must be positive")
  }

  base = toZn(base, modulo)

  if (exponent < 0n) {
    return modInv(modPow(base, -exponent, modulo), modulo)
  }

  let result = 1n
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = toZn(result * base, modulo)
    }
    exponent /= 2n
    base = toZn(base * base, modulo)
  }
  return result
}

function generateNumbers(n: number, f: (n: number) => number): Set<number> {
  const numbers = new Set<number>()
  for (let i = 1; i <= n; i++) {
    numbers.add(f(i))
  }
  return numbers
}

export function triangleNumbers(n: number): Set<number> {
  return generateNumbers(n, i => (i * (i + 1)) / 2)
}

export function squareNumbers(n: number): Set<number> {
  return generateNumbers(n, i => i * i)
}

export function cubeNumbers(n: number): Set<number> {
  return generateNumbers(n, i => i * i * i)
}

export function pentagonalNumbers(n: number): Set<number> {
  return generateNumbers(n, i => (i * (3 * i - 1)) / 2)
}

export function hexagonalNumbers(n: number): Set<number> {
  return generateNumbers(n, i => i * (2 * i - 1))
}

export function heptagonalNumbers(n: number): Set<number> {
  return generateNumbers(n, i => (i * (5 * i - 3)) / 2)
}

export function octagonalNumbers(n: number): Set<number> {
  return generateNumbers(n, i => i * (3 * i - 2))
}
