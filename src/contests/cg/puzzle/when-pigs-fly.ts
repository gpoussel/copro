// 🎮 CodinGame Puzzle - when-pigs-fly
// https://www.codingame.com/training/expert/when-pigs-fly

// Every description is a set of atomic properties: "is:X" (class), "has:X"
// (trait) and "can:X" (ability). A statement "LHS verb RHS" is a rule
// props(LHS) => props(RHS), and it asserts that an entity with props(LHS)
// exists. A bare "A are B" also links the traits (has:A => has:B).
// Forward-chaining closure then answers:
//   All  - closure({is:PIGS}) contains can:FLY
//   Some - some asserted entity's closure contains both is:PIGS and can:FLY
//   No   - otherwise

type PigRule = { cond: string[]; concl: string[] }

const pigRules: PigRule[] = []
const entities: string[][] = []

// parse "NAME [with T and T] [that can A and A]" starting at pos
const parseDesc = (tok: string[], pos: number): [string[], number] => {
  const props = ["is:" + tok[pos]]
  let i = pos + 1
  if (tok[i] === "with") {
    i++
    props.push("has:" + tok[i++])
    while (tok[i] === "and") props.push("has:" + tok[(i += 2) - 1])
  }
  if (tok[i] === "that" && tok[i + 1] === "can") {
    i += 2
    props.push("can:" + tok[i++])
    while (tok[i] === "and") props.push("can:" + tok[(i += 2) - 1])
  }
  return [props, i]
}

// "X and Y and Z" list of names from pos
const parseList = (tok: string[], pos: number, kind: string): string[] => {
  const out = [kind + tok[pos]]
  for (let i = pos + 1; tok[i] === "and"; i += 2) out.push(kind + tok[i + 1])
  return out
}

const statementCount = Number(readline())
for (let s = 0; s < statementCount; s++) {
  const tok = readline().trim().split(/\s+/)
  const [lhs, vi] = parseDesc(tok, 0)
  const verb = tok[vi]
  let rhs: string[]
  if (verb === "are") {
    rhs = parseDesc(tok, vi + 1)[0]
    if (lhs.length === 1 && rhs.length === 1) {
      pigRules.push({ cond: ["has:" + tok[0]], concl: ["has:" + tok[vi + 1]] })
    }
  } else if (verb === "have") rhs = parseList(tok, vi + 1, "has:")
  else rhs = parseList(tok, vi + 1, "can:")
  pigRules.push({ cond: lhs, concl: rhs })
  entities.push(lhs)
}

const closure = (start: string[]): Set<string> => {
  const known = new Set(start)
  let changed = true
  while (changed) {
    changed = false
    for (const r of pigRules) {
      if (r.concl.every(p => known.has(p))) continue
      if (r.cond.every(p => known.has(p))) {
        for (const p of r.concl) known.add(p)
        changed = true
      }
    }
  }
  return known
}

let verdict = "No"
if (closure(["is:PIGS"]).has("can:FLY")) verdict = "All"
else if (
  entities.some(e => {
    const c = closure(e)
    return c.has("is:PIGS") && c.has("can:FLY")
  })
)
  verdict = "Some"
console.log(verdict + " pigs can fly")
