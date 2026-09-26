// 🎮 CodinGame Puzzle - the-polish-dictionary
// https://www.codingame.com/training/medium/the-polish-dictionary

interface Expr {
  text: string
  precedence: number // 3 for operands
}

const PRECEDENCE: { [op: string]: number } = { "+": 1, "-": 1, "*": 2, "/": 2 }

readline()
const tokens = readline()
  .split(" ")
  .filter(t => t.length > 0)

const stack: Expr[] = []
for (const token of tokens) {
  const precedence = PRECEDENCE[token]
  if (precedence === undefined) {
    stack.push({ text: token, precedence: 3 })
    continue
  }
  const right = stack.pop()!
  const left = stack.pop()!
  const leftText = left.precedence < precedence ? `(${left.text})` : left.text
  // Non-commutative operators need parentheses around an equal-precedence right operand
  const rightNeedsParens =
    right.precedence < precedence || (right.precedence === precedence && (token === "-" || token === "/"))
  const rightText = rightNeedsParens ? `(${right.text})` : right.text
  stack.push({ text: `${leftText} ${token} ${rightText}`, precedence })
}
console.log(stack[0].text)
