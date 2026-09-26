// 🎮 CodinGame Puzzle - frequency-based-decryption
// https://www.codingame.com/training/medium/frequency-based-decryption

const ENGLISH_FREQ = [
  8.08, 1.67, 3.18, 3.99, 12.56, 2.17, 1.8, 5.27, 7.24, 0.14, 0.63, 4.04, 2.6, 7.38, 7.47, 1.91, 0.09, 6.42, 6.59,
  9.15, 2.79, 1.0, 1.89, 0.21, 1.65, 0.07,
]

const cipherText = readline()

const counts: number[] = new Array(26).fill(0)
let letterTotal = 0
for (const ch of cipherText) {
  const code = ch.toUpperCase().charCodeAt(0) - 65
  if (code >= 0 && code < 26 && /[A-Za-z]/.test(ch)) {
    counts[code]++
    letterTotal++
  }
}

// Chi-squared distance between the decoded distribution and English
let bestShift = 0
let bestScore = Infinity
for (let shift = 0; shift < 26; shift++) {
  let score = 0
  for (let p = 0; p < 26; p++) {
    const expected = (ENGLISH_FREQ[p] / 100) * letterTotal
    const observed = counts[(p + shift) % 26]
    score += ((observed - expected) * (observed - expected)) / expected
  }
  if (score < bestScore) {
    bestScore = score
    bestShift = shift
  }
}

const decoded = cipherText.replace(/[A-Za-z]/g, ch => {
  const base = ch <= "Z" ? 65 : 97
  return String.fromCharCode(((ch.charCodeAt(0) - base - bestShift + 26) % 26) + base)
})
console.log(decoded)
