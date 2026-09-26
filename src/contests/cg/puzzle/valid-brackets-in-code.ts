// 🎮 CodinGame Puzzle - valid-brackets-in-code
// https://www.codingame.com/training/medium/valid-brackets-in-code

const n = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < n; i++) lines.push(readline())
const code = lines.join("\n")

const OPEN = "({["
const CLOSE = ")}]"
const stack: string[] = []
let inString = false
let seenBracket = false
let valid = true
for (let i = 0; i < code.length && valid; i++) {
  const ch = code[i]
  if (inString) {
    if (ch === "\\") i++ // skip the escaped character
    else if (ch === '"') inString = false
    continue
  }
  if (ch === '"') {
    inString = true
  } else if (OPEN.indexOf(ch) >= 0) {
    seenBracket = true
    stack.push(ch)
  } else if (CLOSE.indexOf(ch) >= 0) {
    seenBracket = true
    if (stack.pop() !== OPEN[CLOSE.indexOf(ch)]) valid = false
  }
}

if (!seenBracket) console.log("No brackets")
else console.log(valid && stack.length === 0 ? "Valid" : "Invalid")
