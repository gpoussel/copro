// 🧮 Project Euler - Problem 57

const MAX = 1_000

function numerators(n: number): bigint[] {
  // OEIS A001333
  const numerators: bigint[] = [1n, 1n]
  for (let i = 2; i < n; ++i) {
    numerators.push(2n * numerators[i - 1] + numerators[i - 2])
  }
  return numerators
}

function denominators(n: number): bigint[] {
  // OEIS A000129
  const denominators: bigint[] = []
  let a = 0n
  let b = 1n
  denominators.push(a, b)
  for (let i = 1; i < n; i++) {
    ;[a, b] = [b, a + 2n * b]
    denominators.push(b)
  }
  return denominators
}

export function solve() {
  const denoms = denominators(MAX)
  const nums = numerators(MAX)
  let count = 0
  for (let i = 0; i < MAX; ++i) {
    if (nums[i].toString().length > denoms[i].toString().length) {
      ++count
    }
  }
  return count
}
