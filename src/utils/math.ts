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
