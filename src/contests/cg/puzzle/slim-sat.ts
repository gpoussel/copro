// 🎮 CodinGame Puzzle - slim-sat
// https://www.codingame.com/training/medium/slim-sat

const tokens = readline().trim().split(/\s+/)
const n = +readline()
const values: { [name: string]: boolean } = {}
for (let i = 0; i < n; i++) {
  const [name, value] = readline().trim().split(/\s+/)
  values[name] = value === "TRUE"
}

// Recursive descent over the fully parenthesized formula
const evaluate = (x: boolean): boolean => {
  let pos = 0
  const parse = (): boolean => {
    const token = tokens[pos++]
    if (token !== "(") return token === "X" ? x : values[token]
    const left = parse()
    const op = tokens[pos++]
    const right = parse()
    pos++ // ")"
    if (op === "AND") return left && right
    if (op === "OR") return left || right
    return left !== right
  }
  return parse()
}

console.log(evaluate(true) || evaluate(false) ? "Satisfiable" : "Unsatisfiable")
