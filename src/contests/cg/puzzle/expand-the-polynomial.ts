// 🎮 CodinGame Puzzle - expand-the-polynomial
// https://www.codingame.com/training/hard/expand-the-polynomial

const input: string = readline().replace(/\s+/g, "")

type Poly = bigint[]

function polyMul(a: Poly, b: Poly): Poly {
  const r: Poly = new Array(a.length + b.length - 1).fill(0n)
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      r[i + j] += a[i] * b[j]
    }
  }
  return r
}
function polyAdd(a: Poly, b: Poly): Poly {
  const len = Math.max(a.length, b.length)
  const r: Poly = new Array(len).fill(0n)
  for (let i = 0; i < a.length; i++) r[i] += a[i]
  for (let i = 0; i < b.length; i++) r[i] += b[i]
  return r
}
function polyPow(a: Poly, n: number): Poly {
  let r: Poly = [1n]
  for (let i = 0; i < n; i++) r = polyMul(r, a)
  return r
}

let pos = 0
function peek(): string {
  return input[pos]
}

function parseUInt(): bigint {
  let s = ""
  while (pos < input.length && /[0-9]/.test(input[pos])) {
    s += input[pos++]
  }
  return BigInt(s)
}

function parseSum(): Poly {
  let result: Poly = [0n]
  let sign = 1n
  if (peek() === "+") {
    pos++
  } else if (peek() === "-") {
    sign = -1n
    pos++
  }
  result = polyAdd(result, scaleTerm(parseProduct(), sign))
  while (pos < input.length && (peek() === "+" || peek() === "-")) {
    const s = peek() === "-" ? -1n : 1n
    pos++
    result = polyAdd(result, scaleTerm(parseProduct(), s))
  }
  return result
}

function scaleTerm(p: Poly, sign: bigint): Poly {
  if (sign === 1n) return p
  return p.map(c => -c)
}

function parseProduct(): Poly {
  let result: Poly = parseFactor()
  while (pos < input.length) {
    const c = peek()
    if (c === "*") {
      pos++
      result = polyMul(result, parseFactor())
    } else if (c === "(") {
      result = polyMul(result, parseFactor())
    } else if (/[0-9x]/.test(c)) {
      result = polyMul(result, parseFactor())
    } else {
      break
    }
  }
  return result
}

function parseFactor(): Poly {
  let base: Poly
  if (peek() === "(") {
    pos++
    base = parseSum()
    pos++
  } else {
    base = parseMonomial()
  }
  if (peek() === "^") {
    pos++
    const exp = Number(parseUInt())
    base = polyPow(base, exp)
  }
  return base
}

function parseMonomial(): Poly {
  let coef = 1n
  if (/[0-9]/.test(peek())) {
    coef = parseUInt()
  }
  if (peek() === "x") {
    pos++
    let power = 1
    if (peek() === "^") {
      pos++
      power = Number(parseUInt())
    }
    const p: Poly = new Array(power + 1).fill(0n)
    p[power] = coef
    return p
  } else {
    return [coef]
  }
}

const poly = parseSum()

const terms: string[] = []
for (let p = poly.length - 1; p >= 0; p--) {
  const c = poly[p]
  if (c === 0n) continue
  const sign = c < 0n ? "-" : "+"
  const abs = c < 0n ? -c : c
  let body: string
  if (p === 0) {
    body = abs.toString()
  } else {
    const coefPart = abs === 1n ? "" : abs.toString()
    const varPart = p === 1 ? "x" : "x^" + p
    body = coefPart + varPart
  }
  terms.push(sign + body)
}
let out: string
if (terms.length === 0) {
  out = "0"
} else {
  out = terms.join("")
  if (out[0] === "+") out = out.slice(1)
}
console.log(out)
