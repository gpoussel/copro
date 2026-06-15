// 🎮 CodinGame Puzzle - anagram-to-break-the-code
// https://www.codingame.com/training/easy/anagram-to-break-the-code

const w = readline().trim()
const s = readline()

function sig(str: string): string {
  return str.toLowerCase().split("").sort().join("")
}

const wSig = sig(w)
const wLower = w.toLowerCase()

// Words are separated by spaces or the punctuation marks : . , ? !
const words = s.split(/[\s:.,?!]+/).filter(x => x.length > 0)

let keyIndex = -1
for (let i = 0; i < words.length; i++) {
  const word = words[i]
  if (word.toLowerCase() === wLower) continue // a word is not an anagram of itself
  if (sig(word) === wSig) {
    keyIndex = i
    break
  }
}

if (keyIndex === -1) {
  console.log("IMPOSSIBLE")
} else {
  const wordsBefore = keyIndex
  const wordsAfter = words.length - keyIndex - 1
  let lettersBefore = 0
  for (let i = 0; i < keyIndex; i++) lettersBefore += words[i].length
  let lettersAfter = 0
  for (let i = keyIndex + 1; i < words.length; i++) lettersAfter += words[i].length
  const d = (x: number) => x % 10 // keep only the rightmost digit
  console.log(`${d(wordsBefore)}.${d(wordsAfter)}.${d(lettersBefore)}.${d(lettersAfter)}`)
}
