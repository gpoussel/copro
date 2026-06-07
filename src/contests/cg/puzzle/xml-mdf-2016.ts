// 🎮 CodinGame Puzzle - xml-mdf-2016
// https://www.codingame.com/training/easy/xml-mdf-2016

const sequence = readline()

// Parse the sequence token by token.
// A token is either:
//   - a single lowercase letter (open tag) → push onto stack
//   - '-' followed by a lowercase letter (close tag) → pop from stack

// Weight of each tag = sum of 1/depth for each occurrence
const weights: Record<string, number> = {}

const stack: string[] = []
let i = 0

while (i < sequence.length) {
  if (sequence[i] === "-") {
    // Closing tag: skip '-' and the letter
    i += 2
    stack.pop()
  } else {
    // Opening tag: record depth = stack.length + 1
    const letter = sequence[i]
    const depth = stack.length + 1
    weights[letter] = (weights[letter] ?? 0) + 1 / depth
    stack.push(letter)
    i += 1
  }
}

// Find the letter with the greatest weight; tie-break alphabetically (smallest letter wins)
let bestLetter = ""
let bestWeight = -Infinity

for (const [letter, weight] of Object.entries(weights)) {
  if (weight > bestWeight || (weight === bestWeight && letter < bestLetter)) {
    bestLetter = letter
    bestWeight = weight
  }
}

console.log(bestLetter)
