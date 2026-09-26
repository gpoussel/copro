// 🎮 CodinGame Puzzle - russian-dolls
// https://www.codingame.com/training/medium/russian-dolls

interface OpenDoll {
  size: number
  childrenSum: number
  hasChild: boolean
}

// Returns the number of solid dolls, or -1 if the design is invalid
function countSolidDolls(line: string): number {
  const tokens = line.trim().split(/\s+/)
  if (tokens.length === 0 || tokens[0] === "") return -1
  const stack: OpenDoll[] = []
  let solid = 0
  let closedRoot = false
  for (const token of tokens) {
    if (!/^-?[1-9][0-9]*$/.test(token)) return -1
    if (closedRoot) return -1
    const value = parseInt(token, 10)
    if (value < 0) {
      stack.push({ size: -value, childrenSum: 0, hasChild: false })
      continue
    }
    const doll = stack.pop()
    if (doll === undefined || doll.size !== value) return -1
    if (doll.childrenSum >= doll.size) return -1
    if (!doll.hasChild) solid++
    if (stack.length === 0) closedRoot = true
    else {
      const parentDoll = stack[stack.length - 1]
      parentDoll.childrenSum += doll.size
      parentDoll.hasChild = true
    }
  }
  return closedRoot && stack.length === 0 ? solid : -1
}

const dollCases = parseInt(readline())
for (let i = 0; i < dollCases; i++) console.log(countSolidDolls(readline()))
