// 🎮 CodinGame Puzzle - fun-with-cgx-expressions
// https://www.codingame.com/training/medium/fun-with-cgx-expressions

// --- CGX parsing -------------------------------------------------------------
type CgxValue = bigint | string | CgxBlock
interface CgxBlock {
  fields: { [key: string]: CgxValue }
}

const n = parseInt(readline())
let text = ""
for (let i = 0; i < n; i++) text += readline() + "\n"
let pos = 0

const skipSpaces = () => {
  while (pos < text.length && /\s/.test(text[pos])) pos++
}

function parseString(): string {
  const end = text.indexOf("'", pos + 1)
  const s = text.slice(pos + 1, end)
  pos = end + 1
  return s
}

// Parses an element; a KEY_VALUE is stored in the enclosing block by parseBlock
function parseValue(): CgxValue {
  skipSpaces()
  if (text[pos] === "(") return parseBlock()
  if (text[pos] === "'") return parseString()
  const start = pos
  while (pos < text.length && /[-0-9]/.test(text[pos])) pos++
  return BigInt(text.slice(start, pos))
}

function parseBlock(): CgxBlock {
  const block: CgxBlock = { fields: {} }
  pos++ // (
  skipSpaces()
  while (text[pos] !== ")") {
    skipSpaces()
    const key = parseString()
    skipSpaces()
    pos++ // =
    block.fields[key] = parseValue()
    skipSpaces()
    if (text[pos] === ";") pos++
    skipSpaces()
  }
  pos++ // )
  return block
}

// --- Exact fractions ---------------------------------------------------------
type Fraction = [bigint, bigint]
const ZERO = BigInt(0)
const ONE = BigInt(1)

const abs = (a: bigint) => (a < ZERO ? -a : a)
function gcd(a: bigint, b: bigint): bigint {
  a = abs(a)
  b = abs(b)
  while (b !== ZERO) [a, b] = [b, a % b]
  return a
}
function fraction(num: bigint, den: bigint): Fraction {
  if (den < ZERO) [num, den] = [-num, -den]
  const g = gcd(num, den)
  return g === ZERO ? [num, den] : [num / g, den / g]
}

function apply(op: string, [a, b]: Fraction, [c, d]: Fraction): Fraction {
  switch (op) {
    case "+":
      return fraction(a * d + c * b, b * d)
    case "-":
      return fraction(a * d - c * b, b * d)
    case "*":
      return fraction(a * c, b * d)
    default:
      return fraction(a * d, b * c)
  }
}

// --- Evaluation --------------------------------------------------------------
const root = parseValue() as CgxBlock
const vars = (root.fields["vars"] as CgxBlock | undefined)?.fields ?? {}
const cache: { [name: string]: Fraction } = {}

function evaluate(value: CgxValue): Fraction {
  if (typeof value === "bigint") return [value, ONE]
  if (typeof value === "string") {
    if (!(value in cache)) cache[value] = evaluate(vars[value])
    return cache[value]
  }
  const f = value.fields
  if ("numerator" in f) return apply("/", evaluate(f["numerator"]), evaluate(f["denominator"]))
  return apply(f["operator"] as string, evaluate(f["num1"]), evaluate(f["num2"]))
}

const [num, den] = evaluate(root.fields["result"])
console.log(den === ONE ? `${num}` : `${num}/${den}`)
