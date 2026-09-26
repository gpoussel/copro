// 🎮 CodinGame Puzzle - trits-balanced-ternary-computing
// https://www.codingame.com/training/medium/trits-balanced-ternary-computing

function tritsToNumber(s: string): number {
  let value = 0
  for (const c of s) value = value * 3 + (c === "T" ? -1 : c === "1" ? 1 : 0)
  return value
}

function numberToTrits(n: number): string {
  if (n === 0) return "0"
  let out = ""
  while (n !== 0) {
    let r = ((n % 3) + 3) % 3
    if (r === 2) r = -1
    out = (r === -1 ? "T" : String(r)) + out
    n = (n - r) / 3
  }
  return out
}

const lhsTrits = readline().trim()
const operator = readline().trim()
const rhsTrits = readline().trim()
const lhsValue = tritsToNumber(lhsTrits)
const rhsValue = tritsToNumber(rhsTrits)

let resultValue = 0
if (operator === "+") resultValue = lhsValue + rhsValue
else if (operator === "-") resultValue = lhsValue - rhsValue
else if (operator === "*") resultValue = lhsValue * rhsValue
else {
  // Shifts append or drop the lowest trits; a negative amount shifts the other way
  const amount = operator === "<<" ? rhsValue : -rhsValue
  const digits = numberToTrits(lhsValue)
  if (lhsValue === 0) resultValue = 0
  else if (amount >= 0) resultValue = lhsValue * Math.pow(3, amount)
  else {
    const kept = digits.length + amount
    resultValue = kept > 0 ? tritsToNumber(digits.substr(0, kept)) : 0
  }
}
console.log(numberToTrits(resultValue))
