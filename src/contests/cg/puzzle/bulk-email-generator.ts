// 🎮 CodinGame Puzzle - bulk-email-generator
// https://www.codingame.com/training/easy/bulk-email-generator

const n = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < n; i++) {
  lines.push(readline())
}

// Join all lines into one big template (it's not a line-based problem)
const template = lines.join("\n")

let choiceIndex = 0
let result = ""
let i = 0

while (i < template.length) {
  if (template[i] === "(") {
    // Find the matching closing parenthesis (choices don't nest)
    const start = i + 1
    let end = template.indexOf(")", start)
    const group = template.substring(start, end)
    const clauses = group.split("|")
    const pick = choiceIndex % clauses.length
    result += clauses[pick]
    choiceIndex++
    i = end + 1
  } else {
    result += template[i]
    i++
  }
}

console.log(result)
