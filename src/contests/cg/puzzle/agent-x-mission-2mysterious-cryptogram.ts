// 🎮 CodinGame Puzzle - agent-x-mission-2mysterious-cryptogram
// https://www.codingame.com/training/medium/agent-x-mission-2mysterious-cryptogram

const ciphertext = readline()
const n = parseInt(readline())
const register: string[] = []
for (let i = 0; i < n; i++) register.push(readline().trim().toUpperCase())

const isLetter = (ch: string) => ch >= "A" && ch <= "Z"

// Distinct encrypted words containing letters, hardest (longest) first
const cipherWords: string[] = []
for (const w of ciphertext.toUpperCase().split(/[ ,.?;:!]+/)) {
  if (w.split("").some(isLetter) && cipherWords.indexOf(w) < 0) cipherWords.push(w)
}
cipherWords.sort((a, b) => b.length - a.length)

const candidates = cipherWords.map(cw =>
  register.filter(word => {
    if (word.length !== cw.length) return false
    for (let i = 0; i < word.length; i++) if (isLetter(word[i]) !== isLetter(cw[i]) || (!isLetter(word[i]) && word[i] !== cw[i])) return false
    return true
  }),
)

const cipherToPlain: { [c: string]: string } = {}
const plainToCipher: { [p: string]: string } = {}

// Try to map a cipher word onto a plain word; returns the newly bound cipher letters, or null
function bind(cw: string, word: string): string[] | null {
  const added: string[] = []
  for (let i = 0; i < cw.length; i++) {
    const c = cw[i]
    const p = word[i]
    if (!isLetter(c)) continue
    if (c in cipherToPlain || p in plainToCipher) {
      if (cipherToPlain[c] !== p || plainToCipher[p] !== c) {
        unbind(added)
        return null
      }
      continue
    }
    cipherToPlain[c] = p
    plainToCipher[p] = c
    added.push(c)
  }
  return added
}

function unbind(added: string[]) {
  for (const c of added) {
    delete plainToCipher[cipherToPlain[c]]
    delete cipherToPlain[c]
  }
}

function solve(i: number): boolean {
  if (i === cipherWords.length) return true
  for (const word of candidates[i]) {
    const added = bind(cipherWords[i], word)
    if (!added) continue
    if (solve(i + 1)) return true
    unbind(added)
  }
  return false
}

solve(0)

let plaintext = ""
for (const ch of ciphertext) {
  const upper = ch.toUpperCase()
  if (!isLetter(upper)) plaintext += ch
  else {
    const p = cipherToPlain[upper]
    plaintext += ch === upper ? p : p.toLowerCase()
  }
}
console.log(plaintext)
for (let i = 0; i < 26; i++) {
  const p = String.fromCharCode(65 + i)
  console.log(p in plainToCipher ? `${p} -> ${plainToCipher[p]}` : "Na")
}
