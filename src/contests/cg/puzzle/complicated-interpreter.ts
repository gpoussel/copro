// 🎮 CodinGame Puzzle - complicated-interpreter
// https://www.codingame.com/training/medium/complicated-interpreter

// Thrown sentinels: an invalid reference, or the print instruction
const ERROR = "ERROR"
const PRINT = "PRINT"

const vars = new Map<string, number>()
const functions = new Map<string, string[]>()

const value = (token: string): number => {
  if (token[0] !== "$") return Number(token)
  const v = vars.get(token.slice(1))
  if (v === undefined) throw ERROR
  return v
}

const variable = (name: string): number => {
  const v = vars.get(name)
  if (v === undefined) throw ERROR
  return v
}

// Evaluates a condition: comparisons joined by "and" (binding tighter) and "or"
const condition = (tokens: string[]): boolean => {
  const orGroups: boolean[][] = [[]]
  let i = 0
  while (i < tokens.length) {
    const [left, op, right] = tokens.slice(i, i + 3)
    const l = value(left)
    const r = value(right)
    orGroups[orGroups.length - 1].push(op === "==" ? l === r : l !== r)
    i += 3
    if (tokens[i] === "or") orGroups.push([])
    i++
  }
  return orGroups.some(group => group.every(b => b))
}

const execute = (tokens: string[]): void => {
  let i = 0
  while (i < tokens.length) {
    const t = tokens[i]
    const next = tokens[i + 1]
    if (t === "print") throw PRINT
    if (t.slice(-2) === "()") {
      const body = functions.get(t.slice(0, -2))
      if (!body) throw ERROR
      execute(body)
      i++
    } else if (t === "loop") {
      const count = value(next)
      const body = tokens.slice(i + 3)
      for (let k = 0; k < count; k++) execute(body)
      return
    } else if (t === "if") {
      const thenIndex = tokens.indexOf("then", i)
      if (condition(tokens.slice(i + 1, thenIndex))) execute(tokens.slice(thenIndex + 1))
      return
    } else if (next === "function") {
      functions.set(t, tokens.slice(i + 2))
      return
    } else if (t === "delete") {
      variable(next)
      vars.delete(next)
      i += 2
    } else if (next === "=") {
      vars.set(t, value(tokens[i + 2]))
      i += 3
    } else if (next === "add" || next === "sub" || next === "mult") {
      const current = variable(t)
      const operand = value(tokens[i + 2])
      vars.set(t, next === "add" ? current + operand : next === "sub" ? current - operand : current * operand)
      i += 3
    } else i++
  }
}

const n = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < n; i++) lines.push(readline())

const values = (): string => {
  const out: number[] = []
  vars.forEach(v => out.push(v))
  return out.join(" ")
}

let output: string | null = null
try {
  for (const line of lines) {
    const commentAt = line.indexOf("//")
    const code = commentAt >= 0 ? line.slice(0, commentAt) : line
    execute(code.split(" ").filter(s => s.length > 0))
  }
} catch (e) {
  if (e === ERROR) output = ERROR
  else if (e !== PRINT) throw e
}
console.log(output === null ? values() : output)
