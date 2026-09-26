// 🎮 CodinGame Puzzle - derivative-time---part2
// https://www.codingame.com/training/hard/derivative-time---part2

// Parse the formula into an expression tree (recursive descent following the
// priorities func > ^ (right-assoc) > * > +), then differentiate it
// symbolically once per requested variable and evaluate the final tree.

type DtNode =
  | { k: "num"; v: number }
  | { k: "var"; name: string }
  | { k: "add"; a: DtNode; b: DtNode }
  | { k: "mul"; a: DtNode; b: DtNode }
  | { k: "pow"; a: DtNode; b: DtNode }
  | { k: "fn"; f: string; a: DtNode }

const dtFormula = readline()
const dtVars = readline().trim().split(/\s+/)
const dtDict = readline().trim().split(/\s+/)
const dtValues = new Map<string, number>()
for (let i = 0; i + 1 < dtDict.length; i += 2) dtValues.set(dtDict[i], parseFloat(dtDict[i + 1]))

// Tokenizer: numbers, identifiers, single-char operators
const dtTokens: string[] = dtFormula.match(/\d+(?:\.\d+)?|[A-Za-z_][A-Za-z0-9_]*|[()+*^-]/g) ?? []
let dtPos = 0

const num = (v: number): DtNode => ({ k: "num", v })
const add = (a: DtNode, b: DtNode): DtNode => ({ k: "add", a, b })
const mul = (a: DtNode, b: DtNode): DtNode => ({ k: "mul", a, b })
const pow = (a: DtNode, b: DtNode): DtNode => ({ k: "pow", a, b })
const fn = (f: string, a: DtNode): DtNode => ({ k: "fn", f, a })

function parseSum(): DtNode {
  let n = parseProd()
  while (dtTokens[dtPos] === "+") {
    dtPos++
    n = add(n, parseProd())
  }
  return n
}

function parseProd(): DtNode {
  let n = parsePow()
  while (dtTokens[dtPos] === "*") {
    dtPos++
    n = mul(n, parsePow())
  }
  return n
}

function parsePow(): DtNode {
  const base = parseUnary()
  if (dtTokens[dtPos] !== "^") return base
  dtPos++
  if (dtTokens[dtPos] === "-") {
    dtPos++
    return pow(base, mul(num(-1), parsePow()))
  }
  return pow(base, parsePow())
}

function parseUnary(): DtNode {
  const t = dtTokens[dtPos]
  if (t === "ln" || t === "sin" || t === "cos") {
    dtPos++
    return fn(t, parseUnary())
  }
  return parseAtom()
}

function parseAtom(): DtNode {
  const t = dtTokens[dtPos++]
  if (t === "(") {
    const n = parseSum()
    dtPos++ // ")"
    return n
  }
  if (t === "-") return mul(num(-1), parseUnary())
  if (/^\d/.test(t)) return num(parseFloat(t))
  if (t === "e" && !dtValues.has("e")) return num(Math.E)
  if (t === "pi" && !dtValues.has("pi")) return num(Math.PI)
  return { k: "var", name: t }
}

function depends(n: DtNode, x: string): boolean {
  switch (n.k) {
    case "num":
      return false
    case "var":
      return n.name === x
    case "fn":
      return depends(n.a, x)
    default:
      return depends(n.a, x) || depends(n.b, x)
  }
}

function derive(n: DtNode, x: string): DtNode {
  if (!depends(n, x)) return num(0)
  switch (n.k) {
    case "num":
      return num(0)
    case "var":
      return num(1)
    case "add":
      return add(derive(n.a, x), derive(n.b, x))
    case "mul":
      return add(mul(derive(n.a, x), n.b), mul(n.a, derive(n.b, x)))
    case "fn":
      if (n.f === "ln") return mul(derive(n.a, x), pow(n.a, num(-1)))
      if (n.f === "sin") return mul(fn("cos", n.a), derive(n.a, x))
      return mul(mul(num(-1), fn("sin", n.a)), derive(n.a, x))
    case "pow": {
      const { a: u, b: v } = n
      if (!depends(v, x)) return mul(mul(v, pow(u, add(v, num(-1)))), derive(u, x))
      if (!depends(u, x)) return mul(mul(fn("ln", u), n), derive(v, x))
      // (u^v)' = u^v * (v' ln u + v u'/u)
      return mul(n, add(mul(derive(v, x), fn("ln", u)), mul(mul(v, derive(u, x)), pow(u, num(-1)))))
    }
  }
}

function evaluate(n: DtNode): number {
  switch (n.k) {
    case "num":
      return n.v
    case "var":
      return dtValues.get(n.name) ?? 0
    case "add":
      return evaluate(n.a) + evaluate(n.b)
    case "mul":
      return evaluate(n.a) * evaluate(n.b)
    case "pow":
      return Math.pow(evaluate(n.a), evaluate(n.b))
    case "fn": {
      const a = evaluate(n.a)
      return n.f === "ln" ? Math.log(a) : n.f === "sin" ? Math.sin(a) : Math.cos(a)
    }
  }
}

let dtTree = parseSum()
for (const x of dtVars) dtTree = derive(dtTree, x)
const dtResult = evaluate(dtTree)
let dtOut = (Math.round(dtResult * 100 + 1e-9) / 100).toFixed(2)
if (dtOut === "-0.00") dtOut = "0.00"
console.log(dtOut)
