// 🎮 CodinGame Puzzle - pascal-trapezoid
// https://www.codingame.com/training/hard/pascal-trapezoid

// Element N of line L only depends on a diagonal band of the previous lines:
// on line l we keep positions max(1, N-(L-l)) .. min(N, E+l-1) only.
// Numbers are BigInt (binomial growth), text elements concatenate.
type Elem = bigint | string

const [E, L, N] = readline().split(" ").map(Number)
const start: Elem[] = readline()
  .trim()
  .split(/\s+/)
  .map(s => (/^-?\d+$/.test(s) ? BigInt(s) : s))

// Combine left (n-1) and right (n); undefined means outside the line
const combine = (a: Elem | undefined, b: Elem | undefined): Elem => {
  if (a === undefined) return b as Elem
  if (b === undefined) return a
  if (typeof a === "bigint" && typeof b === "bigint") return a + b
  return a.toString() + b.toString()
}

let lo = Math.max(1, N - (L - 1))
let hi = Math.min(N, E)
let line: Elem[] = start.slice(lo - 1, hi)
for (let l = 2; l <= L; l++) {
  const len = E + l - 1
  const nlo = Math.max(1, N - (L - l))
  const nhi = Math.min(N, len)
  const next: Elem[] = []
  for (let p = nlo; p <= nhi; p++) {
    // previous line has E + l - 2 elements at positions 1..len-1
    const left = p - 1 >= lo && p - 1 <= hi ? line[p - 1 - lo] : undefined
    const right = p >= lo && p <= hi ? line[p - lo] : undefined
    next.push(combine(left, right))
  }
  line = next
  lo = nlo
  hi = nhi
}
console.log(line[N - lo].toString())
