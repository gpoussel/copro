// 🎮 CodinGame Puzzle - logic-gates-detective
// https://www.codingame.com/training/medium/logic-gates-detective

type Gate = { a: string; b: string; c: string; op: (x: number, y: number) => number }
type Assignment = { [node: string]: number }

const OPS: { [name: string]: (x: number, y: number) => number } = {
  or: (x, y) => x | y,
  and: (x, y) => x & y,
  xor: (x, y) => x ^ y,
}

const initial: Assignment = {}
for (const obs of readline().trim().split(/\s+/)) {
  const [name, value] = obs.split(":")
  initial[name] = +value
}
const outputs = readline().trim().split(/\s+/)
const n = +readline()
const gates: Gate[] = []
const nodes: string[] = []
const addNode = (name: string) => {
  if (nodes.indexOf(name) < 0) nodes.push(name)
}
for (let i = 0; i < n; i++) {
  const [a, op, b, , c] = readline().trim().split(/\s+/)
  gates.push({ a, b, c, op: OPS[op] })
  addNode(a)
  addNode(b)
  addNode(c)
}
for (const name of outputs) addNode(name)

// Deduce forced values until fixpoint; false on contradiction
const propagate = (asg: Assignment): boolean => {
  let changed = true
  while (changed) {
    changed = false
    for (const g of gates) {
      const names = [g.a, g.b, g.c]
      if (names.every(x => x in asg)) {
        if (g.op(asg[g.a], asg[g.b]) !== asg[g.c]) return false
        continue
      }
      const possible: number[][] = []
      for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 2; y++) {
          const combo = [x, y, g.op(x, y)]
          if (names.every((name, k) => !(name in asg) || asg[name] === combo[k])) possible.push(combo)
        }
      }
      if (possible.length === 0) return false
      names.forEach((name, k) => {
        if (name in asg) return
        const v = possible[0][k]
        if (possible.every(combo => combo[k] === v)) {
          asg[name] = v
          changed = true
        }
      })
    }
  }
  return true
}

const solve = (asg: Assignment): Assignment | null => {
  if (!propagate(asg)) return null
  const free = nodes.filter(x => !(x in asg))
  if (free.length === 0) return asg
  for (let v = 0; v < 2; v++) {
    const copy: Assignment = {}
    for (const k in asg) copy[k] = asg[k]
    copy[free[0]] = v
    const result = solve(copy)
    if (result) return result
  }
  return null
}

// Output values are guaranteed identical across all solutions, so any solution works
const solution = solve(initial)!
console.log(outputs.map(x => solution[x]).join(""))
