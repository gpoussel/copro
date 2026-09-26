// 🎮 CodinGame Puzzle - reverse-polish-notation
// https://www.codingame.com/training/medium/reverse-polish-notation

readline()
const instructions = readline().trim().split(/\s+/)
const rpnStack: number[] = []

class StackError extends Error {}

function popValue(): number {
  if (rpnStack.length === 0) throw new StackError()
  return rpnStack.pop()!
}

function execute(instruction: string): void {
  switch (instruction) {
    case "ADD":
    case "SUB":
    case "MUL":
    case "DIV":
    case "MOD": {
      const b = popValue()
      const a = popValue()
      if (instruction === "ADD") rpnStack.push(a + b)
      else if (instruction === "SUB") rpnStack.push(a - b)
      else if (instruction === "MUL") rpnStack.push(a * b)
      else {
        if (b === 0) throw new StackError()
        rpnStack.push(instruction === "DIV" ? Math.trunc(a / b) : a % b)
      }
      return
    }
    case "POP":
      popValue()
      return
    case "DUP": {
      const a = popValue()
      rpnStack.push(a, a)
      return
    }
    case "SWP": {
      const b = popValue()
      const a = popValue()
      rpnStack.push(b, a)
      return
    }
    case "ROL": {
      const n = popValue()
      if (n < 1 || n > rpnStack.length) throw new StackError()
      const [moved] = rpnStack.splice(rpnStack.length - n, 1)
      rpnStack.push(moved)
      return
    }
    default:
      rpnStack.push(parseInt(instruction))
  }
}

let failed = false
try {
  for (const instruction of instructions) execute(instruction)
} catch (e) {
  failed = true
}
const outputParts = rpnStack.map(String)
if (failed) outputParts.push("ERROR")
console.log(outputParts.join(" "))
