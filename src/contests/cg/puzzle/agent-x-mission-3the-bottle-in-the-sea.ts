// 🎮 CodinGame Puzzle - agent-x-mission-3the-bottle-in-the-sea
// https://www.codingame.com/training/medium/agent-x-mission-3the-bottle-in-the-sea

const axCipher = readline()
const axKeyLength = parseInt(readline())
const axWord = readline().trim().toUpperCase()

const isLetter = (ch: string) => /[A-Za-z]/.test(ch)
const letterIndex = (ch: string) => ch.toUpperCase().charCodeAt(0) - 65
const isSeparator = (ch: string) => " ,.?;:!".indexOf(ch) >= 0

// Try each word of the ciphertext as the encrypted form of the known word
function findKey(): number[] | null {
  let lettersBefore = 0
  let i = 0
  while (i < axCipher.length) {
    if (isSeparator(axCipher[i])) {
      i++
      continue
    }
    let j = i
    while (j < axCipher.length && !isSeparator(axCipher[j])) j++
    const token = axCipher.substring(i, j)
    const allLetters = token.split("").every(isLetter)
    if (allLetters && token.length === axWord.length) {
      const key: number[] = new Array(axKeyLength).fill(-1)
      let ok = true
      for (let k = 0; k < token.length && ok; k++) {
        const slot = (lettersBefore + k) % axKeyLength
        const shift = (letterIndex(token[k]) - letterIndex(axWord[k]) + 26) % 26
        if (key[slot] === -1) key[slot] = shift
        else if (key[slot] !== shift) ok = false
      }
      if (ok && key.every(v => v >= 0)) return key
    }
    for (const ch of token) if (isLetter(ch)) lettersBefore++
    i = j
  }
  return null
}

const axKey = findKey() || new Array(axKeyLength).fill(0)
console.log(axKey.map(v => String.fromCharCode(65 + v)).join(""))

let plain = ""
let letterPos = 0
for (const ch of axCipher) {
  if (!isLetter(ch)) {
    plain += ch
    continue
  }
  const base = ch <= "Z" ? 65 : 97
  const shift = axKey[letterPos % axKeyLength]
  plain += String.fromCharCode(((letterIndex(ch) - shift + 26) % 26) + base)
  letterPos++
}
console.log(plain.substring(0, 900))
