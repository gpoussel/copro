// 🎮 CodinGame Puzzle - euclids-algorithm-with-complex-numbers
// https://www.codingame.com/

type Complex = { re: number; im: number }

function parse(line: string): Complex {
  const parts: string[] = line.split(" ")
  return { re: parseInt(parts[0], 10), im: parseInt(parts[1], 10) }
}

// Round half up toward +infinity (0.5 -> 1, -1.5 -> -1)
function roundHalfUp(v: number): number {
  return Math.floor(v + 0.5)
}

function divide(a: Complex, b: Complex): Complex {
  const denom: number = b.re * b.re + b.im * b.im
  const x: number = (a.re * b.re + a.im * b.im) / denom
  const y: number = (a.im * b.re - a.re * b.im) / denom
  return { re: roundHalfUp(x), im: roundHalfUp(y) }
}

function mul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }
}

function sub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im }
}

function isZero(c: Complex): boolean {
  return c.re === 0 && c.im === 0
}

// Python complex repr conventions
function fmt(c: Complex): string {
  const re: number = c.re === 0 ? 0 : c.re
  const im: number = c.im === 0 ? 0 : c.im
  if (re === 0) {
    return `${im}j`
  }
  const sign: string = im < 0 ? "-" : "+"
  return `(${re}${sign}${Math.abs(im)}j)`
}

const a: Complex = parse(readline())
const b: Complex = parse(readline())

const origA: Complex = { re: a.re, im: a.im }
const origB: Complex = { re: b.re, im: b.im }

let cur: Complex = { re: a.re, im: a.im }
let nxt: Complex = { re: b.re, im: b.im }
const lines: string[] = []

while (!isZero(nxt)) {
  const q: Complex = divide(cur, nxt)
  const r: Complex = sub(cur, mul(q, nxt))
  lines.push(`${fmt(cur)} = ${fmt(nxt)} * ${fmt(q)} + ${fmt(r)}`)
  cur = nxt
  nxt = r
}

lines.push(`GCD(${fmt(origA)}, ${fmt(origB)}) = ${fmt(cur)}`)
console.log(lines.join("\n"))
