// 🎮 CodinGame Puzzle - fun-with-set-theory
// https://www.codingame.com/training/medium/fun-with-set-theory

// Sets are boolean arrays indexed by value + OFFSET (values are in [-100, 100])
const OFFSET = 100
const UNIVERSE = 201
type ValueSet = boolean[]

const expression = readline().replace(/\s+/g, "")
let cursor = 0

function emptySet(): ValueSet {
  const set: ValueSet = []
  for (let i = 0; i < UNIVERSE; i++) set.push(false)
  return set
}

function readNumber(): number {
  const start = cursor
  if (expression[cursor] === "-") cursor++
  while (cursor < expression.length && expression[cursor] >= "0" && expression[cursor] <= "9") cursor++
  return parseInt(expression.substring(start, cursor))
}

function parseSetLiteral(): ValueSet {
  const set = emptySet()
  const opening = expression[cursor++]
  if (opening === "{") {
    while (expression[cursor] !== "}") {
      if (expression[cursor] === ";") cursor++
      else set[readNumber() + OFFSET] = true
    }
    cursor++
    return set
  }
  // Interval: '[' includes the lower bound, ']' excludes it
  let low = readNumber()
  cursor++ // ';'
  let high = readNumber()
  const closing = expression[cursor++]
  if (opening === "]") low++
  if (closing === "[") high--
  for (let v = low; v <= high; v++) set[v + OFFSET] = true
  return set
}

function parseTerm(): ValueSet {
  if (expression[cursor] === "(") {
    cursor++
    const inner = parseExpression()
    cursor++ // ')'
    return inner
  }
  return parseSetLiteral()
}

function parseExpression(): ValueSet {
  let result = parseTerm()
  while (cursor < expression.length && expression[cursor] !== ")") {
    const operator = expression[cursor++]
    const right = parseTerm()
    if (operator === "U") result = result.map((v, i) => v || right[i])
    else if (operator === "I") result = result.map((v, i) => v && right[i])
    else result = result.map((v, i) => v && !right[i])
  }
  return result
}

const resultSet = parseExpression()
const members: number[] = []
resultSet.forEach((present, i) => {
  if (present) members.push(i - OFFSET)
})
console.log(members.length > 0 ? members.join(" ") : "EMPTY")
