// 🎮 CodinGame Puzzle - find-the-missing-plus-signs-in-addition
// https://www.codingame.com/training/medium/find-the-missing-plus-signs-in-addition

const n = parseInt(readline())
const sumText = readline().trim()
const target = BigInt(sumText)
const digits = readline().trim()
const maxLen = sumText.length

// DFS over term boundaries; trying shorter terms first yields lexicographic order ('+' < digits)
const solutions: string[] = []
const terms: string[] = []
const search = (pos: number, left: number, remaining: bigint) => {
  const rest = digits.length - pos
  if (left === 0) {
    if (rest === 0 && remaining === BigInt(0)) solutions.push(`${terms.join("+")}=${sumText}`)
    return
  }
  if (rest < left || rest > left * maxLen) return
  for (let len = 1; len <= Math.min(maxLen, rest - (left - 1)); len++) {
    const term = digits.substr(pos, len)
    const value = BigInt(term)
    if (value > remaining) break
    terms.push(term)
    search(pos + len, left - 1, remaining - value)
    terms.pop()
  }
}
search(0, n, target)
console.log(solutions.length ? solutions.join("\n") : "No solution")
