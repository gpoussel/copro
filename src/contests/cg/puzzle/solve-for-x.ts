// 🎮 CodinGame Puzzle - solve-for-x
// https://www.codingame.com/training/hard/solve-for-x

// Expressions are kept in a flattened normal form: a sum is a list of added
// and subtracted terms, a product a list of multiplied and divided factors
// (nested sums/products of the same kind are merged, which is exactly the
// "fewest parentheses" rule). x is isolated by peeling the operation around
// it, then every group is sorted: constants ascending, then subexpressions by
// exact (rational) value, ties broken by their string.

type Node =
  | { kind: "num"; v: bigint }
  | { kind: "x" }
  | { kind: "sum"; pos: Node[]; neg: Node[] }
  | { kind: "prod"; num: Node[]; den: Node[] }

const makeSum = (pos: Node[], neg: Node[]): Node => {
  const p: Node[] = []
  const n: Node[] = []
  for (const c of pos) {
    if (c.kind === "sum") {
      p.push(...c.pos)
      n.push(...c.neg)
    } else p.push(c)
  }
  for (const c of neg) {
    if (c.kind === "sum") {
      n.push(...c.pos)
      p.push(...c.neg)
    } else n.push(c)
  }
  return p.length === 1 && n.length === 0 ? p[0] : { kind: "sum", pos: p, neg: n }
}

const makeProd = (num: Node[], den: Node[]): Node => {
  const p: Node[] = []
  const d: Node[] = []
  for (const c of num) {
    if (c.kind === "prod") {
      p.push(...c.num)
      d.push(...c.den)
    } else p.push(c)
  }
  for (const c of den) {
    if (c.kind === "prod") {
      d.push(...c.num)
      p.push(...c.den)
    } else d.push(c)
  }
  return p.length === 1 && d.length === 0 ? p[0] : { kind: "prod", num: p, den: d }
}

// recursive descent parser building normal forms directly
const parse = (src: string): Node => {
  let i = 0
  const expr = (): Node => {
    const pos = [term()]
    const neg: Node[] = []
    while (src[i] === "+" || src[i] === "-") {
      const op = src[i++]
      ;(op === "+" ? pos : neg).push(term())
    }
    return makeSum(pos, neg)
  }
  const term = (): Node => {
    const num = [factor()]
    const den: Node[] = []
    while (src[i] === "*" || src[i] === "/") {
      const op = src[i++]
      ;(op === "*" ? num : den).push(factor())
    }
    return makeProd(num, den)
  }
  const factor = (): Node => {
    if (src[i] === "(") {
      i++
      const e = expr()
      i++ // ")"
      return e
    }
    if (src[i] === "x") {
      i++
      return { kind: "x" }
    }
    let j = i
    while (j < src.length && src[j] >= "0" && src[j] <= "9") j++
    const v = BigInt(src.slice(i, j))
    i = j
    return { kind: "num", v }
  }
  return expr()
}

const hasX = (n: Node): boolean => {
  if (n.kind === "x") return true
  if (n.kind === "num") return false
  const [a, b] = n.kind === "sum" ? [n.pos, n.neg] : [n.num, n.den]
  return a.some(hasX) || b.some(hasX)
}

// isolates x in "target = value"
const solve = (target: Node, value: Node): Node => {
  while (target.kind !== "x") {
    if (target.kind === "num") throw new Error("no x")
    if (target.kind === "sum") {
      const i = target.pos.findIndex(hasX)
      if (i >= 0) {
        const others = target.pos.filter((_, k) => k !== i)
        const next = target.pos[i]
        value = makeSum([value, ...target.neg], others)
        target = next
      } else {
        const j = target.neg.findIndex(hasX)
        const others = target.neg.filter((_, k) => k !== j)
        const next = target.neg[j]
        value = makeSum(target.pos, [...others, value])
        target = next
      }
    } else {
      const i = target.num.findIndex(hasX)
      if (i >= 0) {
        const others = target.num.filter((_, k) => k !== i)
        const next = target.num[i]
        value = makeProd([value, ...target.den], others)
        target = next
      } else {
        const j = target.den.findIndex(hasX)
        const others = target.den.filter((_, k) => k !== j)
        const next = target.den[j]
        value = makeProd(target.num, [...others, value])
        target = next
      }
    }
  }
  return value
}

// exact rational value (denominator kept positive)
type Rat = [bigint, bigint]
const gcd = (a: bigint, b: bigint): bigint => {
  if (a < 0n) a = -a
  if (b < 0n) b = -b
  while (b) [a, b] = [b, a % b]
  return a
}
const norm = ([n, d]: Rat): Rat => {
  if (d < 0n) [n, d] = [-n, -d]
  const g = gcd(n, d) || 1n
  return [n / g, d / g]
}
const valueOf = (n: Node): Rat => {
  if (n.kind === "num") return [n.v, 1n]
  if (n.kind === "x") return [0n, 1n]
  if (n.kind === "sum") {
    let acc: Rat = [0n, 1n]
    for (const c of n.pos) {
      const [a, b] = valueOf(c)
      acc = norm([acc[0] * b + a * acc[1], acc[1] * b])
    }
    for (const c of n.neg) {
      const [a, b] = valueOf(c)
      acc = norm([acc[0] * b - a * acc[1], acc[1] * b])
    }
    return acc
  }
  let acc: Rat = [1n, 1n]
  for (const c of n.num) {
    const [a, b] = valueOf(c)
    acc = norm([acc[0] * a, acc[1] * b])
  }
  for (const c of n.den) {
    const [a, b] = valueOf(c)
    acc = norm([acc[0] * b, acc[1] * a])
  }
  return acc
}

const show = (n: Node): string => {
  if (n.kind === "num") return n.v.toString()
  if (n.kind === "x") return "x"
  if (n.kind === "sum") return n.pos.map(show).join("+") + n.neg.map(c => "-" + show(c)).join("")
  const f = (c: Node) => (c.kind === "sum" ? "(" + show(c) + ")" : show(c))
  return n.num.map(f).join("*") + n.den.map(c => "/" + f(c)).join("")
}
// how a child is written inside its parent (sums get parentheses in products)
const shown = (c: Node) => (c.kind === "sum" ? "(" + show(c) + ")" : show(c))

const sortGroup = (group: Node[]) => {
  const keyed = group.map(c => ({ c, v: valueOf(c), s: shown(c) }))
  keyed.sort((a, b) => {
    const ca = a.c.kind === "num"
    const cb = b.c.kind === "num"
    if (ca !== cb) return ca ? -1 : 1
    const l = a.v[0] * b.v[1]
    const r = b.v[0] * a.v[1]
    if (l !== r) return l < r ? -1 : 1
    return a.s < b.s ? -1 : a.s > b.s ? 1 : 0
  })
  return keyed.map(k => k.c)
}

// bottom-up sort of every group
const canon = (n: Node): Node => {
  if (n.kind === "sum") return { kind: "sum", pos: sortGroup(n.pos.map(canon)), neg: sortGroup(n.neg.map(canon)) }
  if (n.kind === "prod") return { kind: "prod", num: sortGroup(n.num.map(canon)), den: sortGroup(n.den.map(canon)) }
  return n
}

const count = Number(readline())
const out: string[] = []
for (let k = 0; k < count; k++) {
  const [l, r] = readline().trim().split("=").map(parse)
  const res = hasX(l) ? solve(l, r) : solve(r, l)
  out.push("x=" + show(canon(res)))
}
console.log(out.join("\n"))
