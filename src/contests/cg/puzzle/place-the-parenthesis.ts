// 🎮 CodinGame Puzzle - place-the-parenthesis
// https://www.codingame.com/training/medium/place-the-parenthesis

function evaluate(nums: number[], ops: string[]): number {
  // First collapse * and /, then sum the remaining terms
  const terms: number[] = [nums[0]]
  const signs: string[] = []
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i]
    if (op === "*") terms[terms.length - 1] *= nums[i + 1]
    else if (op === "/") terms[terms.length - 1] /= nums[i + 1]
    else {
      signs.push(op)
      terms.push(nums[i + 1])
    }
  }
  let total = terms[0]
  for (let i = 0; i < signs.length; i++) total += signs[i] === "+" ? terms[i + 1] : -terms[i + 1]
  return total
}

function solve(equation: string): string {
  const [left, right] = equation.split("=")
  const target = Number(right)
  // Tokenize: a "-" is a sign when it starts the expression or follows an operator
  const nums: number[] = []
  const texts: string[] = []
  const ops: string[] = []
  let current = ""
  for (const ch of left.split("")) {
    if ("+-*/".indexOf(ch) >= 0 && current !== "" && current !== "-") {
      nums.push(Number(current))
      texts.push(current)
      ops.push(ch)
      current = ""
    } else current += ch
  }
  nums.push(Number(current))
  texts.push(current)

  const matches = (value: number) => Math.abs(value - target) < 1e-9
  if (matches(evaluate(nums, ops))) return equation

  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const inner = evaluate(nums.slice(i, j + 1), ops.slice(i, j))
      const reducedNums = nums.slice(0, i).concat([inner], nums.slice(j + 1))
      const reducedOps = ops.slice(0, i).concat(ops.slice(j))
      if (!matches(evaluate(reducedNums, reducedOps))) continue
      let text = ""
      for (let k = 0; k < nums.length; k++) {
        if (k === i) text += "("
        text += texts[k]
        if (k === j) text += ")"
        if (k < ops.length) text += ops[k]
      }
      return `${text}=${right}`
    }
  }
  return equation
}

const n = parseInt(readline())
for (let i = 0; i < n; i++) console.log(solve(readline().trim()))
