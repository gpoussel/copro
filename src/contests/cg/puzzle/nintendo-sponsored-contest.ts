// 🎮 CodinGame Puzzle - nintendo-sponsored-contest
// https://www.codingame.com/training/expert/nintendo-sponsored-contest
// Note: this puzzle only accepts C++ on CodinGame; the submission was a C++ port
// of this exact algorithm.

// The encoder is a carry-less product: seeing the first S bits of a as the
// polynomial A over GF(2) and the last S bits as B, b = A * B. So we factor b
// into irreducibles over GF(2) (square-free split, distinct-degree then
// Cantor-Zassenhaus equal-degree factorization, polynomials held in BigInt
// bitmasks), then enumerate every divisor A of b with deg A < S and
// deg(b / A) < S, and print the sorted "A B" words.
// Note: the judge only accepts C++ for this puzzle; this is the reference
// TypeScript version of the submitted program.

const sizeS = parseInt(readline())
const words = readline().trim().split(/\s+/)
let target = 0n
words.forEach((w, i) => {
  target |= BigInt("0x" + w) << BigInt(32 * i)
})

const degOf = (a: bigint): number => (a === 0n ? -1 : a.toString(2).length - 1)
const polyMod = (a: bigint, m: bigint): bigint => {
  const dm = degOf(m)
  let da = degOf(a)
  while (da >= dm) {
    a ^= m << BigInt(da - dm)
    da = degOf(a)
  }
  return a
}
const polyDiv = (a: bigint, m: bigint): bigint => {
  const dm = degOf(m)
  let q = 0n
  let da = degOf(a)
  while (da >= dm) {
    q |= 1n << BigInt(da - dm)
    a ^= m << BigInt(da - dm)
    da = degOf(a)
  }
  return q
}
const polyMul = (a: bigint, b: bigint): bigint => {
  let res = 0n
  for (let s = 0n; b; s++, b >>= 1n) if (b & 1n) res ^= a << s
  return res
}
const mulMod = (a: bigint, b: bigint, m: bigint): bigint => polyMod(polyMul(a, b), m)
const polyGcd = (a: bigint, b: bigint): bigint => {
  while (b) [a, b] = [b, polyMod(a, b)]
  return a
}

let evenMask = 0n
for (let i = 0; i < 2 * sizeS + 2; i += 2) evenMask |= 1n << BigInt(i)

const factors = new Map<bigint, number>()
const addFactor = (f: bigint, times: number): void => {
  factors.set(f, (factors.get(f) ?? 0) + times)
}

const randomPoly = (deg: number): bigint => {
  let r = 0n
  for (let i = 0; i < deg; i++) if (Math.random() < 0.5) r |= 1n << BigInt(i)
  return r
}

// g square-free, product of irreducibles of degree d
const equalDegree = (g: bigint, d: number, times: number): void => {
  const dg = degOf(g)
  if (dg === d) {
    addFactor(g, times)
    return
  }
  for (;;) {
    const r = randomPoly(dg)
    let t = r
    let p = r
    for (let i = 1; i < d; i++) {
      p = mulMod(p, p, g)
      t ^= p
    }
    const u = polyGcd(t, g)
    const du = degOf(u)
    if (du > 0 && du < dg) {
      equalDegree(u, d, times)
      equalDegree(polyDiv(g, u), d, times)
      return
    }
  }
}

const squareFree = (f: bigint, times: number): void => {
  let h = 2n // x
  for (let d = 1; degOf(f) >= 2 * d; d++) {
    h = mulMod(h, h, f)
    const g = polyGcd(h ^ 2n, f)
    if (degOf(g) > 0) {
      equalDegree(g, d, times)
      f = polyDiv(f, g)
      h = polyMod(h, f)
    }
  }
  if (degOf(f) > 0) addFactor(f, times)
}

const factorize = (f: bigint, times: number): void => {
  if (degOf(f) <= 0) return
  const deriv = (f >> 1n) & evenMask
  if (deriv === 0n) {
    // f = h^2 with h made of the even coefficients
    let h = 0n
    for (let i = 0; 2 * i <= degOf(f); i++) if ((f >> BigInt(2 * i)) & 1n) h |= 1n << BigInt(i)
    factorize(h, 2 * times)
    return
  }
  const g = polyGcd(f, deriv)
  if (degOf(g) === 0) squareFree(f, times)
  else {
    factorize(g, times)
    factorize(polyDiv(f, g), times)
  }
}

factorize(target, 1)

const fList = [...factors.entries()]
const results: string[] = []
const wordCount = sizeS / 32
const toWords = (p: bigint): string[] => {
  const res: string[] = []
  for (let i = 0; i < wordCount; i++) res.push(((p >> BigInt(32 * i)) & 0xffffffffn).toString(16).padStart(8, "0"))
  return res
}
const totalDeg = degOf(target)
const enumerate = (idx: number, acc: bigint, accDeg: number): void => {
  if (accDeg >= sizeS) return
  if (idx === fList.length) {
    if (totalDeg - accDeg < sizeS) results.push([...toWords(acc), ...toWords(polyDiv(target, acc))].join(" "))
    return
  }
  const [f, e] = fList[idx]
  const df = degOf(f)
  let cur = acc
  for (let k = 0; k <= e; k++) {
    enumerate(idx + 1, cur, accDeg + k * df)
    cur = polyMul(cur, f)
  }
}
if (target !== 0n) enumerate(0, 1n, 0)
results.sort()
console.log(results.join("\n"))
