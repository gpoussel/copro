// 🎮 CodinGame Puzzle - fibonomials
// https://www.codingame.com/training/medium/fibonomials

const definedBy = readline().trim()
const parse = (line: string): bigint[] =>
  line
    .trim()
    .split(/\s+/)
    .map(t => BigInt(t))
const a = parse(readline())
const b = parse(readline())
const x = BigInt(readline().trim())
const n = parseInt(readline())

const ZERO = BigInt(0)
const ONE = BigInt(1)

// Base polynomial evaluator and its degree
function base(params: bigint[]): [(y: bigint) => bigint, number] {
  if (definedBy === "ROOTS") {
    return [(y: bigint) => params.reduce((acc, r) => acc * (y - r), ONE), params.length]
  }
  let degree = 0
  params.forEach((c, i) => {
    if (c !== ZERO) degree = i
  })
  return [(y: bigint) => params.reduceRight((acc, c) => acc * y + c, ZERO), degree]
}

const [p0, d0] = base(a)
const [p1, d1] = base(b)
const degrees = [d0, d1]
for (let i = 2; i < n; i++) degrees.push(degrees[i - 1] * degrees[i - 2])

// P_i(y), memoized; a degree-0 polynomial ignores its argument
const memo = new Map<string, bigint>()
function evaluate(i: number, y: bigint): bigint {
  if (i === 0) return p0(y)
  if (i === 1) return p1(y)
  const key = degrees[i] === 0 ? `${i}` : `${i},${y}`
  const cached = memo.get(key)
  if (cached !== undefined) return cached
  const value = evaluate(i - 1, evaluate(i - 2, y)) + evaluate(i - 2, evaluate(i - 1, y))
  memo.set(key, value)
  return value
}

const LIMIT = BigInt(10) ** BigInt(12)
function format(v: bigint): string {
  const negative = v < ZERO
  const abs = negative ? -v : v
  if (abs < LIMIT) return v.toString()
  const digits = abs.toString()
  let exponent = digits.length - 1
  // Round to 7 significant digits (half up)
  let mantissa = BigInt(digits.slice(0, 7))
  if (digits.charCodeAt(7) >= 53) mantissa += ONE
  let m = mantissa.toString()
  if (m.length > 7) {
    m = m.slice(0, 7)
    exponent++
  }
  return `${negative ? "-" : ""}${m[0]}.${m.slice(1)}E+${exponent}`
}

for (let i = 0; i < n; i++) console.log(format(evaluate(i, x)))
