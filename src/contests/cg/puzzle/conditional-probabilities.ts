// 🎮 CodinGame Puzzle - conditional-probabilities
// https://www.codingame.com/training/hard/conditional-probabilities

// Everything is expressed with the 4 atoms p(A∧B), p(A∧¬B), p(¬A∧B), p(¬A∧¬B).
// Each given probability is a linear equation on those atoms (a conditional
// P(E|F) = v becomes P(E∧F) - v·P(F) = 0), plus the atoms summing to 1.
// After a Gauss-Jordan elimination with exact fractions, every quantity is reduced
// to an affine form of the free variables: a probability is known when that form is
// constant, and a conditional is known when numerator and denominator forms are proportional.

type Frac = [bigint, bigint]
const gcd = (a: bigint, b: bigint): bigint => {
  if (a < 0n) a = -a
  if (b < 0n) b = -b
  while (b) [a, b] = [b, a % b]
  return a
}
const frac = (n: bigint, d: bigint = 1n): Frac => {
  if (d < 0n) [n, d] = [-n, -d]
  const g = gcd(n, d) || 1n
  return [n / g, d / g]
}
const add = (x: Frac, y: Frac): Frac => frac(x[0] * y[1] + y[0] * x[1], x[1] * y[1])
const sub = (x: Frac, y: Frac): Frac => frac(x[0] * y[1] - y[0] * x[1], x[1] * y[1])
const mul = (x: Frac, y: Frac): Frac => frac(x[0] * y[0], x[1] * y[1])
const div = (x: Frac, y: Frac): Frac => frac(x[0] * y[1], x[1] * y[0])
const isZero = (x: Frac): boolean => x[0] === 0n
const cmp = (x: Frac, y: Frac): number => {
  const d = x[0] * y[1] - y[0] * x[1]
  return d < 0n ? -1 : d > 0n ? 1 : 0
}
const show = (x: Frac): string => (x[1] === 1n ? `${x[0]}` : `${x[0]}/${x[1]}`)
const ZERO = frac(0n)
const ONE = frac(1n)

// Atom index: 2 * (A false) + (B false) -> 0: A∧B, 1: A∧¬B, 2: ¬A∧B, 3: ¬A∧¬B
type Literal = { event: "A" | "B"; negated: boolean }
const parseLiteral = (s: string): Literal => {
  const negated = s.startsWith("NOT ")
  return { event: (negated ? s.slice(4) : s) as "A" | "B", negated }
}
// Linear form (atom mask) of a conjunction of literals
const conj = (lits: Literal[]): Frac[] => {
  const coeffs: Frac[] = []
  for (let atom = 0; atom < 4; atom++) {
    const aTrue = atom < 2
    const bTrue = atom % 2 === 0
    const ok = lits.every(l => (l.event === "A" ? aTrue : bTrue) !== l.negated)
    coeffs.push(ok ? ONE : ZERO)
  }
  return coeffs
}

// A quantity is numerator / denominator (denominator = [1,1,1,1] for plain probabilities)
type Quantity = { num: Frac[]; den: Frac[] }
const parseQuantity = (name: string): Quantity => {
  if (name.includes(" GIVEN ")) {
    const [e, f] = name.split(" GIVEN ").map(parseLiteral)
    return { num: conj([e, f]), den: conj([f]) }
  }
  const lits = name.split(" AND ").map(parseLiteral)
  return { num: conj(lits), den: conj([]) }
}

// Rows: 4 coefficients + right-hand side
const rows: Frac[][] = [[ONE, ONE, ONE, ONE, ONE]]
for (let i = 0; i < 3; i++) {
  const [name, value] = readline().split(" = ")
  const [n, d] = value.trim().split("/")
  const v = frac(BigInt(n), BigInt(d ?? "1"))
  const q = parseQuantity(name.trim())
  rows.push([...q.num.map((c, k) => sub(c, mul(v, q.den[k]))), ZERO])
}

// Gauss-Jordan elimination
const pivotCol: number[] = []
let rank = 0
for (let col = 0; col < 4 && rank < rows.length; col++) {
  const p = rows.findIndex((r, i) => i >= rank && !isZero(r[col]))
  if (p < 0) continue
  ;[rows[rank], rows[p]] = [rows[p], rows[rank]]
  const pv = rows[rank][col]
  rows[rank] = rows[rank].map(x => div(x, pv))
  for (let i = 0; i < rows.length; i++) {
    if (i === rank || isZero(rows[i][col])) continue
    const f = rows[i][col]
    rows[i] = rows[i].map((x, k) => sub(x, mul(f, rows[rank][k])))
  }
  pivotCol.push(col)
  rank++
}

let impossible = false
for (let i = rank; i < rows.length; i++) if (!isZero(rows[i][4])) impossible = true

// Express a linear form as [coefficients of free variables..., constant]
const freeCols = [0, 1, 2, 3].filter(c => !pivotCol.includes(c))
const reduce = (form: Frac[]): Frac[] => {
  const coef = [...form]
  let constant = ZERO
  for (let i = 0; i < rank; i++) {
    const c = pivotCol[i]
    const f = coef[c]
    if (isZero(f)) continue
    // atom_c = rhs - sum(row[free] * free)
    constant = add(constant, mul(f, rows[i][4]))
    for (const fc of freeCols) coef[fc] = sub(coef[fc], mul(f, rows[i][fc]))
    coef[c] = ZERO
  }
  return [...freeCols.map(fc => coef[fc]), constant]
}

// Value of num/den if it does not depend on free variables
const evaluate = (q: Quantity): Frac | null => {
  const a = reduce(q.num)
  const b = reduce(q.den)
  const k = b.findIndex(x => !isZero(x))
  if (k < 0) return null
  const ratio = div(a[k], b[k])
  for (let i = 0; i < a.length; i++) if (cmp(a[i], mul(ratio, b[i])) !== 0) return null
  return ratio
}

const names: string[] = []
const lits = ["A", "NOT A", "B", "NOT B"]
for (const l of lits) names.push(l)
for (const a of ["A", "NOT A"]) for (const b of ["B", "NOT B"]) names.push(`${a} AND ${b}`)
for (const e of lits) for (const f of lits) if (e.endsWith("A") !== f.endsWith("A")) names.push(`${e} GIVEN ${f}`)
names.sort()

const output: string[] = []
if (!impossible) {
  for (const name of names) {
    const v = evaluate(parseQuantity(name))
    if (v === null) continue
    if (cmp(v, ZERO) < 0 || cmp(v, ONE) > 0) {
      impossible = true
      break
    }
    output.push(`${name} = ${show(v)}`)
  }
}
console.log(impossible ? "IMPOSSIBLE" : output.join("\n"))
