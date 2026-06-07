// 🎮 CodinGame Puzzle - obsolete-programming
// https://www.codingame.com/training/hard/obsolete-programming

const n: number = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < n; i++) {
  lines.push(readline())
}

// Tokenize all lines into a flat token array
const allTokens: string[] = []
for (const line of lines) {
  const tokens = line
    .trim()
    .split(/\s+/)
    .filter((t: string) => t.length > 0)
  allTokens.push(...tokens)
}

// Dictionary of user-defined words: name -> token list (body, excluding DEF/name/END)
const dict: Map<string, string[]> = new Map()

// Stack
const stack: number[] = []

// Parse number helper
function isNumber(s: string): boolean {
  return /^-?\d+$/.test(s)
}

// Execute a sequence of tokens with a given index into the token array
// Returns the next index after execution
function execute(tokens: string[], i: number, limit: number): number {
  while (i < limit) {
    const tok = tokens[i]
    i++

    if (isNumber(tok)) {
      stack.push(parseInt(tok))
    } else if (tok === "ADD") {
      const b = stack.pop()!
      const a = stack.pop()!
      stack.push(a + b)
    } else if (tok === "SUB") {
      const b = stack.pop()!
      const a = stack.pop()!
      stack.push(a - b)
    } else if (tok === "MUL") {
      const b = stack.pop()!
      const a = stack.pop()!
      stack.push(a * b)
    } else if (tok === "DIV") {
      const b = stack.pop()!
      const a = stack.pop()!
      stack.push(Math.trunc(a / b))
    } else if (tok === "MOD") {
      const b = stack.pop()!
      const a = stack.pop()!
      stack.push(a % b)
    } else if (tok === "POP") {
      stack.pop()
    } else if (tok === "DUP") {
      stack.push(stack[stack.length - 1])
    } else if (tok === "SWP") {
      const b = stack.pop()!
      const a = stack.pop()!
      stack.push(b)
      stack.push(a)
    } else if (tok === "ROT") {
      // brings the third element to top
      // stack [..., a, b, c] -> [..., a, c, b] -- wait, re-read
      // "If the stack is 1 2 3 4, ROT changes it in 1 3 4 2"
      // So top is 4 (index len-1), then 3, then 2, then 1
      // The third from top is 2. It moves to top.
      // Result: 1 3 4 2 means top is 2, then 4, then 3, then 1
      // Wait: "1 2 3 4" means 4 is on top. "1 3 4 2" means 2 is on top.
      // Third from top is at len-3: which is 2 (stack[1] if stack=[1,2,3,4])
      // ROT: remove the third-from-top and push it on top
      const c = stack.pop()! // top = 4
      const b = stack.pop()! // second = 3
      const a = stack.pop()! // third = 2
      stack.push(b) // push 3
      stack.push(c) // push 4
      stack.push(a) // push 2 -> now top is 2, stack is [1,3,4,2]
    } else if (tok === "OVR") {
      // copies the second top number to top
      // stack [1,2,3,4], OVR -> [1,2,3,4,3]
      stack.push(stack[stack.length - 2])
    } else if (tok === "POS") {
      const a = stack.pop()!
      stack.push(a >= 0 ? 1 : 0)
    } else if (tok === "NOT") {
      const a = stack.pop()!
      stack.push(a === 0 ? 1 : 0)
    } else if (tok === "OUT") {
      console.log(stack.pop()!)
    } else if (tok === "DEF") {
      // Next token is the name, then tokens until END
      const name = tokens[i]
      i++
      const body: string[] = []
      let depth = 1
      while (i < limit) {
        const t = tokens[i]
        i++
        if (t === "DEF") {
          depth++
          body.push(t)
        } else if (t === "END") {
          depth--
          if (depth === 0) break
          body.push(t)
        } else {
          body.push(t)
        }
      }
      dict.set(name, body)
    } else if (tok === "IF") {
      // Find matching FI (or ELS at this depth)
      // Collect the if-branch and else-branch tokens
      const cond = stack.pop()!
      const ifBranch: string[] = []
      const elsBranch: string[] = []
      let depth = 1
      let inElse = false
      while (i < limit) {
        const t = tokens[i]
        i++
        if (t === "IF") {
          depth++
          if (inElse) elsBranch.push(t)
          else ifBranch.push(t)
        } else if (t === "FI") {
          depth--
          if (depth === 0) break
          if (inElse) elsBranch.push(t)
          else ifBranch.push(t)
        } else if (t === "ELS" && depth === 1) {
          inElse = true
        } else {
          if (inElse) elsBranch.push(t)
          else ifBranch.push(t)
        }
      }
      if (cond !== 0) {
        execute(ifBranch, 0, ifBranch.length)
      } else if (inElse) {
        execute(elsBranch, 0, elsBranch.length)
      }
    } else if (dict.has(tok)) {
      // Execute user-defined word
      const body = dict.get(tok)!
      execute(body, 0, body.length)
    }
    // Unknown tokens are ignored (shouldn't happen per constraints)
  }
  return i
}

execute(allTokens, 0, allTokens.length)
