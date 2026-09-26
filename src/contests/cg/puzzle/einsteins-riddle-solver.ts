// 🎮 CodinGame Puzzle - einsteins-riddle-solver
// https://www.codingame.com/training/hard/einsteins-riddle-solver

// People are identified by their item of the first category. Each item keeps
// a bitmask of possible owners, narrowed by constraint propagation (links,
// all-different per category, hidden singles) plus backtracking when stuck.
const [nbC, nbP] = readline().split(" ").map(Number)
const cats: string[][] = []
const where = new Map<string, [number, number]>()
for (let c = 0; c < nbC; c++) {
  const items = readline().trim().split(/\s+/)
  cats.push(items)
  items.forEach((it, i) => where.set(it, [c, i]))
}
const nbLinks = Number(readline())
const links: [number, number, number, number, boolean][] = []
for (let i = 0; i < nbLinks; i++) {
  const m = readline()
    .trim()
    .match(/^(\S+)\s*([&!])\s*(\S+)$/)!
  const [c1, i1] = where.get(m[1])!
  const [c2, i2] = where.get(m[3])!
  links.push([c1, i1, c2, i2, m[2] === "&"])
}

// dom[c][i] = bitmask of the persons that may own item i of category c
const full = (1 << nbP) - 1
const single = (m: number) => m !== 0 && (m & (m - 1)) === 0
const popcount = (m: number) => {
  let n = 0
  for (; m; m &= m - 1) n++
  return n
}

// Constraint propagation until fixpoint; false on contradiction
const propagate = (dom: number[][]): boolean => {
  for (let changed = true; changed; ) {
    changed = false
    const set = (c: number, i: number, v: number) => {
      if (dom[c][i] !== v) {
        dom[c][i] = v
        changed = true
      }
    }
    for (const [c1, i1, c2, i2, same] of links) {
      const a = dom[c1][i1]
      const b = dom[c2][i2]
      if (same) {
        set(c1, i1, a & b)
        set(c2, i2, a & b)
      } else {
        if (single(a)) set(c2, i2, b & ~a)
        if (single(b)) set(c1, i1, a & ~b)
      }
    }
    for (let c = 0; c < nbC; c++) {
      for (let i = 0; i < nbP; i++) {
        if (dom[c][i] === 0) return false
        if (single(dom[c][i])) for (let j = 0; j < nbP; j++) if (j !== i) set(c, j, dom[c][j] & ~dom[c][i])
      }
      // A person that fits a single item of the category owns it
      for (let p = 0; p < nbP; p++) {
        let cnt = 0
        let last = -1
        for (let i = 0; i < nbP; i++)
          if (dom[c][i] & (1 << p)) {
            cnt++
            last = i
          }
        if (cnt === 0) return false
        if (cnt === 1) set(c, last, 1 << p)
      }
    }
  }
  return true
}

// Backtracking on the undecided item with the smallest domain
const solve = (dom: number[][]): number[][] | null => {
  if (!propagate(dom)) return null
  let best: [number, number] | null = null
  let bestSize = Infinity
  for (let c = 0; c < nbC; c++)
    for (let i = 0; i < nbP; i++) {
      const s = popcount(dom[c][i])
      if (s > 1 && s < bestSize) {
        bestSize = s
        best = [c, i]
      }
    }
  if (!best) return dom
  const [c, i] = best
  for (let p = 0; p < nbP; p++)
    if (dom[c][i] & (1 << p)) {
      const copy = dom.map(row => [...row])
      copy[c][i] = 1 << p
      const res = solve(copy)
      if (res) return res
    }
  return null
}

const start = cats.map((items, c) => items.map((_, i) => (c === 0 ? 1 << i : full)))
const dom = solve(start)!
const person = dom.map(row => row.map(m => Math.round(Math.log2(m))))

// Columns ordered by the first category's items alphabetically
const order = [...Array(nbP).keys()].sort((a, b) => (cats[0][a] < cats[0][b] ? -1 : cats[0][a] > cats[0][b] ? 1 : 0))
for (let c = 0; c < nbC; c++) {
  const byPerson: string[] = []
  cats[c].forEach((it, i) => (byPerson[person[c][i]] = it))
  console.log(order.map(p => byPerson[p]).join(" "))
}
