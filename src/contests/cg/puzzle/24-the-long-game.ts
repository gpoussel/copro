// 🎮 CodinGame Puzzle - 24-the-long-game
// https://www.codingame.com/training/hard/24-the-long-game

// Enumerate every binary expression tree over the four numbers with exact
// rational arithmetic. Each tree is canonicalised into n-ary nodes: a sum
// holds positive/negative terms, a product holds numerator/denominator
// factors (nested sums in sums and products in products are flattened,
// which removes every unnecessary parenthesis). Groups are sorted by the
// statement rules and rendered; the resulting strings are deduplicated.
interface Frac {
  n: bigint
  d: bigint
}
const gcd = (a: bigint, b: bigint): bigint => {
  if (a < 0n) a = -a
  if (b < 0n) b = -b
  while (b) [a, b] = [b, a % b]
  return a
}
const frac = (n: bigint, d: bigint): Frac => {
  if (d < 0n) {
    n = -n
    d = -d
  }
  const g = gcd(n, d) || 1n
  return { n: n / g, d: d / g }
}
const add = (a: Frac, b: Frac): Frac => frac(a.n * b.d + b.n * a.d, a.d * b.d)
const sub = (a: Frac, b: Frac): Frac => frac(a.n * b.d - b.n * a.d, a.d * b.d)
const mul = (a: Frac, b: Frac): Frac => frac(a.n * b.n, a.d * b.d)
const div = (a: Frac, b: Frac): Frac => frac(a.n * b.d, a.d * b.n)
const cmp = (a: Frac, b: Frac): number => {
  const x = a.n * b.d - b.n * a.d
  return x < 0n ? -1 : x > 0n ? 1 : 0
}

type Node =
  | { kind: "num"; value: Frac }
  | { kind: "sum"; value: Frac; pos: Node[]; neg: Node[] }
  | { kind: "prod"; value: Frac; num: Node[]; den: Node[] }

const sumParts = (x: Node): [Node[], Node[]] => (x.kind === "sum" ? [x.pos, x.neg] : [[x], []])
const prodParts = (x: Node): [Node[], Node[]] => (x.kind === "prod" ? [x.num, x.den] : [[x], []])

const combine = (a: Node, b: Node, op: string): Node | null => {
  if (op === "+" || op === "-") {
    const [ap, an] = sumParts(a)
    const [bp, bn] = sumParts(b)
    if (op === "+") return { kind: "sum", value: add(a.value, b.value), pos: [...ap, ...bp], neg: [...an, ...bn] }
    return { kind: "sum", value: sub(a.value, b.value), pos: [...ap, ...bn], neg: [...an, ...bp] }
  }
  const [an, ad] = prodParts(a)
  const [bn, bd] = prodParts(b)
  if (op === "*") return { kind: "prod", value: mul(a.value, b.value), num: [...an, ...bn], den: [...ad, ...bd] }
  if (b.value.n === 0n) return null
  return { kind: "prod", value: div(a.value, b.value), num: [...an, ...bd], den: [...ad, ...bn] }
}

// Render a node; returns the string and its number of parenthesis pairs
const render = (x: Node): [string, number] => {
  if (x.kind === "num") return [x.value.n.toString(), 0]
  const inProduct = x.kind === "prod"
  const piece = (t: Node): [string, number] => {
    const [s, p] = render(t)
    return inProduct && t.kind === "sum" ? [`(${s})`, p + 1] : [s, p]
  }
  const order = (group: Node[]): [string, number][] => {
    const items = group.map(t => ({ t, r: piece(t) }))
    items.sort((u, v) => {
      const uc = u.t.kind === "num"
      const vc = v.t.kind === "num"
      if (uc !== vc) return uc ? -1 : 1
      const c = cmp(u.t.value, v.t.value)
      if (c !== 0) return c
      return u.r[0] < v.r[0] ? -1 : u.r[0] > v.r[0] ? 1 : 0
    })
    return items.map(i => i.r)
  }
  const [first, second] = x.kind === "sum" ? [x.pos, x.neg] : [x.num, x.den]
  const [plus, minus] = x.kind === "sum" ? ["+", "-"] : ["*", "/"]
  let parens = 0
  const a = order(first)
  const b = order(second)
  let s = a.map(r => r[0]).join(plus)
  for (const r of a) parens += r[1]
  for (const r of b) {
    s += minus + r[0]
    parens += r[1]
  }
  return [s, parens]
}

const numbers = readline()
  .split(" ")
  .map(s => BigInt(s))
const target = frac(24n, 1n)
const found = new Map<string, number>()

const search = (items: Node[]): void => {
  if (items.length === 1) {
    if (cmp(items[0].value, target) === 0) {
      const [s, p] = render(items[0])
      found.set(s, p)
    }
    return
  }
  for (let i = 0; i < items.length; i++)
    for (let j = 0; j < items.length; j++) {
      if (i === j) continue
      const rest = items.filter((_, k) => k !== i && k !== j)
      for (const op of ["+", "-", "*", "/"]) {
        const node = combine(items[i], items[j], op)
        if (node) search([...rest, node])
      }
    }
}
search(numbers.map((v): Node => ({ kind: "num", value: frac(v, 1n) })))

const solutions = [...found.entries()].sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
if (solutions.length === 0) console.log("not possible")
else console.log([solutions.length, ...solutions.map(s => s[0])].join("\n"))
