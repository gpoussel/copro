// 🎮 CodinGame Puzzle - derivative-time---part1
// https://www.codingame.com/training/medium/derivative-time---part1

type Expr =
  | { kind: "num"; value: number }
  | { kind: "var"; name: string }
  | { kind: "op"; op: string; left: Expr; right: Expr }

const num = (value: number): Expr => ({ kind: "num", value })
const op = (o: string, left: Expr, right: Expr): Expr => ({ kind: "op", op: o, left, right })

// Recursive-descent parser for fully parenthesized binary expressions
const parse = (src: string): Expr => {
  let pos = 0
  const parseExpr = (): Expr => {
    if (src[pos] === "(") {
      pos++
      const left = parseExpr()
      const o = src[pos++]
      const right = parseExpr()
      pos++ // closing parenthesis
      return op(o, left, right)
    }
    const match = /^(-?\d+|[A-Za-z][A-Za-z0-9_]*)/.exec(src.slice(pos))!
    pos += match[0].length
    return /^-?\d/.test(match[0]) ? num(Number(match[0])) : { kind: "var", name: match[0] }
  }
  return parseExpr()
}

// Symbolic partial derivative (exponents are assumed constant w.r.t. v)
const derive = (e: Expr, v: string): Expr => {
  if (e.kind === "num") return num(0)
  if (e.kind === "var") return num(e.name === v ? 1 : 0)
  const { left: u, right: w } = e
  if (e.op === "+") return op("+", derive(u, v), derive(w, v))
  if (e.op === "*") return op("+", op("*", derive(u, v), w), op("*", u, derive(w, v)))
  // (u^w)' = w * u^(w-1) * u'
  return op("*", op("*", w, op("^", u, op("+", w, num(-1)))), derive(u, v))
}

const evaluate = (e: Expr, env: { [name: string]: number }): number => {
  if (e.kind === "num") return e.value
  if (e.kind === "var") return env[e.name] || 0
  const a = evaluate(e.left, env)
  const b = evaluate(e.right, env)
  if (e.op === "+") return a + b
  // A zero factor wins even against an infinite one (e.g. 0 * 0^-1 from a vanished term)
  if (e.op === "*") return a === 0 || b === 0 ? 0 : a * b
  return Math.pow(a, b)
}

let formula = parse(readline().replace(/\s+/g, ""))
for (const v of readline().trim().split(/\s+/)) formula = derive(formula, v)
const tokens = readline().trim().split(/\s+/)
const env: { [name: string]: number } = {}
for (let i = 0; i + 1 < tokens.length; i += 2) env[tokens[i]] = Number(tokens[i + 1])
console.log(Math.round(evaluate(formula, env)) || 0)
