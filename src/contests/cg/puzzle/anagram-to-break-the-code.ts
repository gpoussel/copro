// 🎮 CodinGame Puzzle - anagram-to-break-the-code
// https://www.codingame.com/training/easy/anagram-to-break-the-code

const w: string = readline()
const s: string = readline()

const sortLetters = (str: string): string => str.toLowerCase().split("").sort().join("")

const target: string = sortLetters(w)
const lower: string = w.toLowerCase()

const words: string[] = s.split(/[\s:.,?!]+/).filter(t => t.length > 0)

let keyIndex: number = -1
for (let i = 0; i < words.length; i++) {
  const word: string = words[i]
  if (word.toLowerCase() === lower) continue
  if (sortLetters(word) === target) {
    keyIndex = i
    break
  }
}

if (keyIndex === -1) {
  console.log("IMPOSSIBLE")
} else {
  const wordsBefore: number = keyIndex
  const wordsAfter: number = words.length - keyIndex - 1
  let lettersBefore: number = 0
  let lettersAfter: number = 0
  for (let i = 0; i < words.length; i++) {
    if (i < keyIndex) lettersBefore += words[i].length
    else if (i > keyIndex) lettersAfter += words[i].length
  }
  const d = (n: number): number => n % 10
  console.log(`${d(wordsBefore)}.${d(wordsAfter)}.${d(lettersBefore)}.${d(lettersAfter)}`)
}
