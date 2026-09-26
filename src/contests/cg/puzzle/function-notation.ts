// 🎮 CodinGame Puzzle - function-notation
// https://www.codingame.com/training/medium/function-notation

// Grammar: sum := comp ('+' comp)*, comp := atom ('.' atom)*, atom := letter | '(' sum ')'
const tokens = readline().replace(/\s+/g, "").split("")
let pos = 0

function parseSum(): string {
  const terms = [parseComposition()]
  while (tokens[pos] === "+") {
    pos++
    terms.push(parseComposition())
  }
  return terms.join(" + ")
}

function parseComposition(): string {
  const atoms = [parseAtom()]
  while (tokens[pos] === ".") {
    pos++
    atoms.push(parseAtom())
  }
  return atoms.reverse().join(" |> ")
}

function parseAtom(): string {
  if (tokens[pos] === "(") {
    pos++
    const inner = parseSum()
    pos++ // closing parenthesis
    return `(${inner})`
  }
  return tokens[pos++]
}

console.log(parseSum())
