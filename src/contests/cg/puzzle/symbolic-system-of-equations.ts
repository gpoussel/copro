// 🎮 CodinGame Puzzle - symbolic-system-of-equations
// https://www.codingame.com/training/hard/symbolic-system-of-equations

// Recursive substitution with memoization; a variable met again while it is
// being expanded means a circular (or self) reference.
readline()
const variables = readline().trim().split(/\s+/)
const m = parseInt(readline())
const defs = new Map<string, string[]>()
for (let i = 0; i < m; i++) {
  const [lhs, rhs] = readline().split("=")
  defs.set(lhs.trim(), rhs.trim().split(/\s+/))
}

const memo = new Map<string, string>()
const visiting = new Set<string>()
let circular = false

const solve = (v: string): string => {
  const known = memo.get(v)
  if (known !== undefined) return known
  const def = defs.get(v)
  if (!def) return v
  if (visiting.has(v)) {
    circular = true
    return v
  }
  visiting.add(v)
  // Tokens are function names (followed by "("), parentheses or variables
  const out = def.map((tok, i) => (tok === "(" || tok === ")" || def[i + 1] === "(" ? tok : solve(tok))).join(" ")
  visiting.delete(v)
  memo.set(v, out)
  return out
}

const lines = variables.map(v => `${v} -> ${solve(v)}`)
console.log(circular ? "No solution!" : lines.join("\n"))
