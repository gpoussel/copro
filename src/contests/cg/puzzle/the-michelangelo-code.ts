// 🎮 CodinGame Puzzle - the-michelangelo-code
// https://www.codingame.com/training/easy/the-michelangelo-code

const text = readline()
const n = parseInt(readline())
const words: string[] = []
for (let i = 0; i < n; i++) {
  words.push(readline().toLowerCase())
}

// Strip non-letters from text, keeping track of original lowercase letters
const letters = text.replace(/[^a-zA-Z]/g, "").toLowerCase()

// For each word, find the best (start, step) that embeds the word in letters[]
// Then track the one with the longest word
let bestWord = ""
let bestStart = -1
let bestStep = -1

for (const word of words) {
  if (word.length <= bestWord.length) continue // can't beat current best

  const wLen = word.length
  const lLen = letters.length

  // Step must be >= 1, and start + step*(wLen-1) < lLen
  // So max step = (lLen - 1) / (wLen - 1) if wLen > 1
  const maxStep = wLen === 1 ? lLen : Math.floor((lLen - 1) / (wLen - 1))

  for (let step = 1; step <= maxStep; step++) {
    // For each possible start
    const maxStart = lLen - step * (wLen - 1) - 1
    for (let start = 0; start <= maxStart; start++) {
      let match = true
      for (let k = 0; k < wLen; k++) {
        if (letters[start + step * k] !== word[k]) {
          match = false
          break
        }
      }
      if (match) {
        bestWord = word
        bestStart = start
        bestStep = step
        break // found for this step, try next step (but word is already best)
      }
    }
    if (bestWord === word) break // found, no need to continue steps
  }
}

// Now output: the section of letters from bestStart to bestStart + bestStep*(wLen-1)
// inclusive, in lowercase, with the hidden word letters in uppercase
const wLen = bestWord.length
const endIdx = bestStart + bestStep * (wLen - 1)
let result = ""
for (let i = bestStart; i <= endIdx; i++) {
  // Check if this position is one of the word's letters
  const k = i - bestStart
  if (k % bestStep === 0) {
    result += letters[i].toUpperCase()
  } else {
    result += letters[i]
  }
}

console.log(result)
