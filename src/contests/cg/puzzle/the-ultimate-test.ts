// 🎮 CodinGame Puzzle - the-ultimate-test
// https://www.codingame.com/training/medium/the-ultimate-test

const digitsN = readline().trim()
const targetK = parseInt(readline(), 10)
const OPERATORS = ["", "+", "-"]
const choices: string[] = []

function evaluate(expr: string): number {
  const terms = expr.match(/[+-]?\d+/g) || []
  let sum = 0
  for (const t of terms) sum += parseInt(t, 10)
  return sum
}

function explore(i: number): void {
  if (i === digitsN.length) {
    let expr = digitsN[0]
    for (let j = 1; j < digitsN.length; j++) expr += choices[j - 1] + digitsN[j]
    if (evaluate(expr) === targetK) console.log(expr)
    return
  }
  for (const op of OPERATORS) {
    choices.push(op)
    explore(i + 1)
    choices.pop()
  }
}

explore(1)
