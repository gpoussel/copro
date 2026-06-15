// 🎮 CodinGame Puzzle - dice-probability-calculator
// https://www.codingame.com/training/medium/dice-probability-calculator

type Dist = Map<number, number>

const expr: string = readline().trim()
let pos = 0

const peek = (): string => expr[pos]
const eof = (): boolean => pos >= expr.length

// Combine two distributions under a binary operator (independent variables).
const combine = (a: Dist, b: Dist, op: (x: number, y: number) => number): Dist => {
  const res: Dist = new Map()
  for (const [va, pa] of a) {
    for (const [vb, pb] of b) {
      const v = op(va, vb)
      res.set(v, (res.get(v) ?? 0) + pa * pb)
    }
  }
  return res
}

const constDist = (v: number): Dist => new Map([[v, 1]])

const diceDist = (n: number): Dist => {
  const res: Dist = new Map()
  for (let i = 1; i <= n; i++) res.set(i, 1 / n)
  return res
}

// Precedence (low -> high): '>' , '+'/'-' , '*' , primary.
let parseComparison: () => Dist

const parsePrimary = (): Dist => {
  if (peek() === "(") {
    pos++
    const d = parseComparison()
    pos++ // ')'
    return d
  }
  if (peek() === "d") {
    pos++
    let num = ""
    while (!eof() && peek() >= "0" && peek() <= "9") num += expr[pos++]
    return diceDist(parseInt(num))
  }
  let num = ""
  while (!eof() && peek() >= "0" && peek() <= "9") num += expr[pos++]
  return constDist(parseInt(num))
}

const parseMul = (): Dist => {
  let d = parsePrimary()
  while (!eof() && peek() === "*") {
    pos++
    const r = parsePrimary()
    d = combine(d, r, (x, y) => x * y)
  }
  return d
}

const parseAdd = (): Dist => {
  let d = parseMul()
  while (!eof() && (peek() === "+" || peek() === "-")) {
    const op = expr[pos++]
    const r = parseMul()
    d = combine(d, r, (x, y) => (op === "+" ? x + y : x - y))
  }
  return d
}

parseComparison = (): Dist => {
  let d = parseAdd()
  while (!eof() && peek() === ">") {
    pos++
    const r = parseAdd()
    d = combine(d, r, (x, y) => (x > y ? 1 : 0))
  }
  return d
}

const result = parseComparison()
const keys = Array.from(result.keys()).sort((a, b) => a - b)
const out: string[] = []
for (const k of keys) {
  const p = (result.get(k) ?? 0) * 100
  out.push(k + " " + p.toFixed(2))
}
console.log(out.join("\n"))
